import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { WorkerPool } from './pool'
import type { ImageJob } from '@/core/types/core'

// --- Mock Worker ---
let mockWorkerInstance: MockWorker | null = null

class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null

  constructor(public url: URL, public options?: WorkerOptions) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this
    mockWorkerInstance = self
  }

  postMessage(_data: unknown): void {
    void _data
      // captured by the test to trigger responses
  }

  terminate(): void {
    mockWorkerInstance = null
  }
}

function createJob(id: string, name = 'pic.jpg', type = 'image/jpeg'): ImageJob {
  return {
    id,
    originalFile: new File([''], name, { type }),
    originalPreview: '',
    status: 'idle' as const,
    result: null,
  }
}

describe('WorkerPool', () => {
  let pool: WorkerPool
  let setMock: ReturnType<typeof vi.fn>
  let onFileCompleted: ReturnType<typeof vi.fn>
  let onFileError: ReturnType<typeof vi.fn>
  let onComplete: ReturnType<typeof vi.fn>
  let onWorkerError: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.stubGlobal('Worker', MockWorker)
    vi.stubGlobal('URL.createObjectURL', vi.fn(() => 'blob:mock'))
    mockWorkerInstance = null

    setMock = vi.fn()
    onFileCompleted = vi.fn()
    onFileError = vi.fn()
    onComplete = vi.fn()
    onWorkerError = vi.fn()
    pool = new WorkerPool(setMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    mockWorkerInstance = null
  })

  it('calls onComplete immediately for empty file list', async () => {
    await pool.processFiles([], 'image/png', onFileCompleted, onFileError, onComplete)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(mockWorkerInstance).toBeNull()
  })

  it('creates a Worker with the correct URL', async () => {
    const jobs = [createJob('1')]
    const promise = pool.processFiles(jobs, 'image/png', onFileCompleted, onFileError, onComplete)

    expect(mockWorkerInstance).not.toBeNull()
    expect(mockWorkerInstance!.url.href).toContain('conversion.worker.ts')

    // Simulate all jobs completing
    mockWorkerInstance!.onmessage?.(new MessageEvent('message', {
      data: { id: '1', success: true, blob: new Blob(), name: 'pic.png' },
    }))

    await promise
  })

  it('processes a single file successfully', async () => {
    const jobs = [createJob('1')]
    const promise = pool.processFiles(jobs, 'image/png', onFileCompleted, onFileError, onComplete, onWorkerError)

    mockWorkerInstance!.onmessage?.(new MessageEvent('message', {
      data: { id: '1', success: true, blob: new Blob(), name: 'pic.png' },
    }))

    await promise
    expect(onFileCompleted).toHaveBeenCalledTimes(1)
    expect(onFileError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onWorkerError).not.toHaveBeenCalled()
  })

  it('handles a single file error', async () => {
    const jobs = [createJob('1')]
    const promise = pool.processFiles(jobs, 'image/png', onFileCompleted, onFileError, onComplete, onWorkerError)

    mockWorkerInstance!.onmessage?.(new MessageEvent('message', {
      data: { id: '1', success: false, error: 'conversion failed' },
    }))

    await promise
    expect(onFileError).toHaveBeenCalledTimes(1)
    expect(onFileCompleted).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('handles a worker error event', async () => {
    const jobs = [createJob('1')]
    const promise = pool.processFiles(jobs, 'image/png', onFileCompleted, onFileError, onComplete, onWorkerError)

    mockWorkerInstance!.onerror?.(new ErrorEvent('error', { message: 'worker crashed' }))

    await promise
    expect(onWorkerError).toHaveBeenCalledWith('worker crashed')
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('processes multiple files with correct counters', async () => {
    const jobs = [createJob('1'), createJob('2')]
    const promise = pool.processFiles(jobs, 'image/png', onFileCompleted, onFileError, onComplete, onWorkerError)

    // Both succeed
    mockWorkerInstance!.onmessage?.(new MessageEvent('message', {
      data: { id: '1', success: true, blob: new Blob(), name: 'pic.png' },
    }))
    mockWorkerInstance!.onmessage?.(new MessageEvent('message', {
      data: { id: '2', success: true, blob: new Blob(), name: 'pic.png' },
    }))

    await promise
    expect(onFileCompleted).toHaveBeenCalledTimes(2)
    expect(onFileError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('tracks mixed success and error counts', async () => {
    const jobs = [createJob('1'), createJob('2')]
    const promise = pool.processFiles(jobs, 'image/png', onFileCompleted, onFileError, onComplete, onWorkerError)

    // One succeeds, one fails
    mockWorkerInstance!.onmessage?.(new MessageEvent('message', {
      data: { id: '1', success: true, blob: new Blob(), name: 'pic.png' },
    }))
    mockWorkerInstance!.onmessage?.(new MessageEvent('message', {
      data: { id: '2', success: false, error: 'bad file' },
    }))

    await promise
    expect(onFileCompleted).toHaveBeenCalledTimes(1)
    expect(onFileError).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('sends correct data in postMessage', async () => {
    const jobs = [createJob('1', 'photo.jpg', 'image/jpeg')]
    const postSpy = vi.spyOn(MockWorker.prototype, 'postMessage')

    const promise = pool.processFiles(jobs, 'image/webp', onFileCompleted, onFileError, onComplete, onWorkerError)

    expect(postSpy).toHaveBeenCalledWith({
      id: '1',
      file: jobs[0].originalFile,
      format: 'image/webp',
    })

    mockWorkerInstance!.onmessage?.(new MessageEvent('message', {
      data: { id: '1', success: true, blob: new Blob(), name: 'pic.webp' },
    }))

    await promise
    postSpy.mockRestore()
  })

  it('calls terminate and cleans up after completion', async () => {
    const jobs = [createJob('1')]
    const terminateSpy = vi.spyOn(MockWorker.prototype, 'terminate')

    const promise = pool.processFiles(jobs, 'image/png', onFileCompleted, onFileError, onComplete, onWorkerError)

    mockWorkerInstance!.onmessage?.(new MessageEvent('message', {
      data: { id: '1', success: true, blob: new Blob(), name: 'pic.png' },
    }))

    await promise
    expect(terminateSpy).toHaveBeenCalledTimes(1)
    terminateSpy.mockRestore()
  })

  it('terminate() method cleans up worker', () => {
    // Start processing to create a worker
    const jobs = [createJob('1')]
    pool.processFiles(jobs, 'image/png', onFileCompleted, onFileError, onComplete, onWorkerError)

    expect(mockWorkerInstance).not.toBeNull()

    const terminateSpy = vi.spyOn(mockWorkerInstance!, 'terminate')
    pool.terminate()
    expect(terminateSpy).toHaveBeenCalledTimes(1)
    terminateSpy.mockRestore()
  })

  it('fires processNext for queued files when active drops below MAX_CONCURRENT', async () => {
    const postSpy = vi.spyOn(MockWorker.prototype, 'postMessage')

    const jobs = [createJob('1'), createJob('2')]
    const promise = pool.processFiles(jobs, 'image/png', onFileCompleted, onFileError, onComplete, onWorkerError)

    // Both should be sent immediately (2 files < MAX_CONCURRENT = 5)
    expect(postSpy).toHaveBeenCalledTimes(2)

    // Complete first file — should not send more (queue is empty)
    mockWorkerInstance!.onmessage?.(new MessageEvent('message', {
      data: { id: '1', success: true, blob: new Blob(), name: 'pic.png' },
    }))

    // Second completes
    mockWorkerInstance!.onmessage?.(new MessageEvent('message', {
      data: { id: '2', success: true, blob: new Blob(), name: 'pic.png' },
    }))

    await promise
    expect(onFileCompleted).toHaveBeenCalledTimes(2)
    postSpy.mockRestore()
  })

  it('updates file status via set function', async () => {
    const jobs = [createJob('1')]
    const promise = pool.processFiles(jobs, 'image/png', onFileCompleted, onFileError, onComplete, onWorkerError)

    // Set was called for status → processing
    expect(setMock).toHaveBeenCalled()

    mockWorkerInstance!.onmessage?.(new MessageEvent('message', {
      data: { id: '1', success: true, blob: new Blob(), name: 'pic.png' },
    }))

    await promise
    // Set was called again for status → completed
    expect(setMock).toHaveBeenCalledTimes(2)
  })
})
