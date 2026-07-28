import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueueManager } from './queue'
import type { ImageJob } from '@/core/types/core'

vi.mock('@/core/services/heicService')
vi.mock('@/core/engine/converter')

function createMockFile(name: string, type: string): File {
  return new File([''], name, { type })
}

function createJob(name: string, type: string): ImageJob {
  return {
    id: name,
    originalFile: createMockFile(name, type),
    originalPreview: '',
    status: 'idle',
    result: null,
  }
}

describe('QueueManager.classifyFiles', () => {
  let qm: QueueManager

  beforeEach(() => {
    qm = new QueueManager(() => {})
  })

  it('classifies PDF files when outputFormat is application/pdf', () => {
    const files = [
      createJob('doc1.jpg', 'image/jpeg'),
      createJob('doc2.png', 'image/png'),
    ]
    const result = qm.classifyFiles(files, 'application/pdf')
    expect(result.pdfFiles).toHaveLength(2)
    expect(result.regularFiles).toHaveLength(0)
    expect(result.mainThreadQueue).toHaveLength(2)
  })

  it('classifies HEIC files by .heic extension', () => {
    const files = [createJob('photo.heic', 'image/heic')]
    const result = qm.classifyFiles(files, 'image/png')
    expect(result.heicFiles).toHaveLength(1)
    expect(result.svgFiles).toHaveLength(0)
    expect(result.regularFiles).toHaveLength(0)
    expect(result.mainThreadQueue).toHaveLength(1)
  })

  it('classifies HEIC files by .heif extension', () => {
    const files = [createJob('photo.heif', 'image/heif')]
    const result = qm.classifyFiles(files, 'image/png')
    expect(result.heicFiles).toHaveLength(1)
  })

  it('classifies HEIC files by type containing heic', () => {
    const files = [createJob('photo', 'image/heic')]
    const result = qm.classifyFiles(files, 'image/png')
    expect(result.heicFiles).toHaveLength(1)
  })

  it('classifies SVG files by type image/svg+xml', () => {
    const files = [createJob('icon.svg', 'image/svg+xml')]
    const result = qm.classifyFiles(files, 'image/png')
    expect(result.svgFiles).toHaveLength(1)
    expect(result.heicFiles).toHaveLength(0)
    expect(result.regularFiles).toHaveLength(0)
    expect(result.mainThreadQueue).toHaveLength(1)
  })

  it('classifies regular files as those not in HEIC or SVG', () => {
    const files = [
      createJob('pic.jpg', 'image/jpeg'),
      createJob('pic.png', 'image/png'),
      createJob('pic.webp', 'image/webp'),
    ]
    const result = qm.classifyFiles(files, 'image/png')
    expect(result.regularFiles).toHaveLength(3)
    expect(result.heicFiles).toHaveLength(0)
    expect(result.svgFiles).toHaveLength(0)
    expect(result.mainThreadQueue).toHaveLength(0)
  })

  it('handles mixed file types correctly', () => {
    const files = [
      createJob('pic.jpg', 'image/jpeg'),
      createJob('photo.heic', 'image/heic'),
      createJob('icon.svg', 'image/svg+xml'),
    ]
    const result = qm.classifyFiles(files, 'image/png')
    expect(result.regularFiles).toHaveLength(1)
    expect(result.heicFiles).toHaveLength(1)
    expect(result.svgFiles).toHaveLength(1)
    expect(result.mainThreadQueue).toHaveLength(2)
  })

  it('returns empty arrays for empty input', () => {
    const result = qm.classifyFiles([], 'image/png')
    expect(result.pdfFiles).toHaveLength(0)
    expect(result.heicFiles).toHaveLength(0)
    expect(result.svgFiles).toHaveLength(0)
    expect(result.regularFiles).toHaveLength(0)
    expect(result.mainThreadQueue).toHaveLength(0)
  })

  it('returns all files as regular when no outputFormat is set', () => {
    const files = [createJob('pic.jpg', 'image/jpeg')]
    const result = qm.classifyFiles(files, null)
    expect(result.regularFiles).toHaveLength(1)
    expect(result.pdfFiles).toHaveLength(0)
  })
})

describe('QueueManager.runMainThreadQueue', () => {
  let qm: QueueManager
  let setMock: ReturnType<typeof vi.fn>
  let onFileCompleted: ReturnType<typeof vi.fn>
  let onFileError: ReturnType<typeof vi.fn>

  const mockBlob = new Blob(['fake'], { type: 'image/png' })

  beforeEach(() => {
    vi.resetAllMocks()
    setMock = vi.fn()
    onFileCompleted = vi.fn()
    onFileError = vi.fn()
    qm = new QueueManager(setMock)
  })

  it('returns zeros for an empty queue', async () => {
    const result = await qm.runMainThreadQueue([], 'image/png', onFileCompleted, onFileError)
    expect(result).toEqual({ completed: 0, errors: 0 })
    expect(onFileCompleted).not.toHaveBeenCalled()
    expect(onFileError).not.toHaveBeenCalled()
  })

  it('processes a HEIC file via processHeicFile', async () => {
    const { processHeicFile } = await import('@/core/services/heicService')
    vi.mocked(processHeicFile).mockResolvedValue(mockBlob)

    const job = createJob('photo.heic', 'image/heic')
    const result = await qm.runMainThreadQueue([job], 'image/png', onFileCompleted, onFileError)

    expect(processHeicFile).toHaveBeenCalledWith(job.originalFile, 'image/png')
    expect(result).toEqual({ completed: 1, errors: 0 })
    expect(onFileCompleted).toHaveBeenCalledTimes(1)
  })

  it('processes SVG file via dynamic import of converter', async () => {
    const converter = await import('@/core/engine/converter')
    vi.mocked(converter.convertImage).mockResolvedValue({
      blob: mockBlob,
      url: 'blob:mock',
      name: 'icon.png',
    })

    const job = createJob('icon.svg', 'image/svg+xml')
    const result = await qm.runMainThreadQueue([job], 'image/png', onFileCompleted, onFileError)

    expect(converter.convertImage).toHaveBeenCalledWith(job.originalFile, 'image/png')
    expect(result).toEqual({ completed: 1, errors: 0 })
    expect(onFileCompleted).toHaveBeenCalledTimes(1)
  })

  it('handles HEIC conversion errors gracefully', async () => {
    const { processHeicFile } = await import('@/core/services/heicService')
    vi.mocked(processHeicFile).mockRejectedValue(new Error('decode failed'))

    const job = createJob('photo.heic', 'image/heic')
    const result = await qm.runMainThreadQueue([job], 'image/webp', onFileCompleted, onFileError)

    expect(result).toEqual({ completed: 0, errors: 1 })
    expect(onFileError).toHaveBeenCalledTimes(1)
    expect(onFileCompleted).not.toHaveBeenCalled()
  })

  it('handles SVG conversion errors gracefully', async () => {
    const converter = await import('@/core/engine/converter')
    vi.mocked(converter.convertImage).mockRejectedValue(new Error('render failed'))

    const job = createJob('icon.svg', 'image/svg+xml')
    const result = await qm.runMainThreadQueue([job], 'image/png', onFileCompleted, onFileError)

    expect(result).toEqual({ completed: 0, errors: 1 })
    expect(onFileError).toHaveBeenCalledTimes(1)
  })

  it('processes mixed HEIC + SVG files with correct counts', async () => {
    const { processHeicFile } = await import('@/core/services/heicService')
    const converter = await import('@/core/engine/converter')
    vi.mocked(processHeicFile).mockResolvedValue(mockBlob)
    vi.mocked(converter.convertImage).mockResolvedValue({
      blob: mockBlob,
      url: 'blob:mock',
      name: 'converted.png',
    })

    const jobs = [
      createJob('photo.heic', 'image/heic'),
      createJob('icon.svg', 'image/svg+xml'),
    ]
    const result = await qm.runMainThreadQueue(jobs, 'image/png', onFileCompleted, onFileError)

    expect(result).toEqual({ completed: 2, errors: 0 })
    expect(onFileCompleted).toHaveBeenCalledTimes(2)
  })

  it('updates file status via set function during processing', async () => {
    const { processHeicFile } = await import('@/core/services/heicService')
    vi.mocked(processHeicFile).mockResolvedValue(mockBlob)

    const job = createJob('photo.heic', 'image/heic')
    await qm.runMainThreadQueue([job], 'image/png', onFileCompleted, onFileError)

    expect(setMock).toHaveBeenCalled()
  })

  it('processes up to MAX_MAIN_THREAD_CONCURRENT (3) concurrent files', async () => {
    const { processHeicFile } = await import('@/core/services/heicService')
    vi.mocked(processHeicFile).mockResolvedValue(mockBlob)

    const jobs = [
      createJob('a.heic', 'image/heic'),
      createJob('b.heic', 'image/heic'),
      createJob('c.heic', 'image/heic'),
      createJob('d.heic', 'image/heic'),
    ]
    const result = await qm.runMainThreadQueue(jobs, 'image/png', onFileCompleted, onFileError)

    expect(result).toEqual({ completed: 4, errors: 0 })
    expect(onFileCompleted).toHaveBeenCalledTimes(4)
  })
})
