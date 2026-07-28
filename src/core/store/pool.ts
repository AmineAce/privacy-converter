import type { ImageJob, OutputFormat } from '@/core/types/core'

const MAX_CONCURRENT = 5

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetFn = (partial: any) => void

export class WorkerPool {
  private set: SetFn
  private worker: Worker | null = null

  constructor(set: SetFn) {
    this.set = set
  }

  async processFiles(
    files: ImageJob[],
    format: OutputFormat,
    onFileCompleted: () => void,
    onFileError: () => void,
      onComplete: () => void,
      onWorkerError?: (message: string) => void,
  ): Promise<void> {
    if (files.length === 0) {
      onComplete()
      return
    }

    this.worker = new Worker(
      new URL('../engine/conversion.worker.ts', import.meta.url),
      { type: 'module' },
    )

    const fileQueue = [...files]
    let activeCount = 0
    let completedCount = 0
    let errorCount = 0
    const totalFiles = files.length

    const processNext = () => {
      if (fileQueue.length === 0) return

      const file = fileQueue.shift()!
      activeCount++

      this.set((state: Record<string, unknown>) => ({
        ...state,
        files: (state.files as ImageJob[]).map((f: ImageJob) =>
          f.id === file.id ? { ...f, status: 'processing' as const } : f,
        ),
      }))

      this.worker!.postMessage({
        id: file.id,
        file: file.originalFile,
        format,
      })
    }

    return new Promise<void>((resolve) => {
      this.worker!.onmessage = (event: MessageEvent) => {
        const { id, success, blob, name, error } = event.data
        activeCount--

        if (success) {
          const url = URL.createObjectURL(blob)
          const result = { blob, url, name }

          this.set((state: Record<string, unknown>) => ({
            ...state,
            files: (state.files as ImageJob[]).map((f: ImageJob) =>
              f.id === id ? { ...f, status: 'completed' as const, result } : f,
            ),
          }))

          completedCount++
        onFileCompleted()
        } else {
          this.set((state: Record<string, unknown>) => ({
            ...state,
            files: (state.files as ImageJob[]).map((f: ImageJob) =>
              f.id === id
                ? { ...f, status: 'error' as const, errorMessage: error }
                : f,
            ),
          }))

          errorCount++
            onFileError()
        }

        if (completedCount + errorCount === totalFiles) {
          this.worker!.terminate()
          this.worker = null
          onComplete()
          resolve()
        } else if (fileQueue.length > 0 && activeCount < MAX_CONCURRENT) {
          processNext()
        }
      }

      this.worker!.onerror = (event: ErrorEvent) => {
        this.worker!.terminate()
        this.worker = null
        if (onWorkerError) onWorkerError(event.message || 'Unknown worker error')
        onComplete()
          resolve()
      }

      // Launch initial pool of workers (up to MAX_CONCURRENT or fileQueue.length)
      const initial = Math.min(MAX_CONCURRENT, fileQueue.length)
      for (let i = 0; i < initial; i++) {
        processNext()
      }
    })
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }
}
