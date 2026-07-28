import type { ImageJob, OutputFormat, ConvertedFile } from '@/core/types/core'
import { processHeicFile } from '@/core/services/heicService'

const MAX_MAIN_THREAD_CONCURRENT = 3

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetFn = (partial: any) => void

export class QueueManager {
  private set: SetFn

  constructor(set: SetFn) {
      this.set = set
    }

  classifyFiles(files: ImageJob[], outputFormat: OutputFormat | null) {
    const pdfFiles = files.filter(() => outputFormat === 'application/pdf')
    const nonPdfInputs = outputFormat === 'application/pdf' ? [] : files

    const heicFiles = nonPdfInputs.filter(file =>
      file.originalFile.name.toLowerCase().endsWith('.heic') ||
      file.originalFile.name.toLowerCase().endsWith('.heif') ||
      file.originalFile.type.includes('heic'),
    )
    const svgFiles = nonPdfInputs.filter(file =>
      file.originalFile.type === 'image/svg+xml',
    )
    const regularFiles = nonPdfInputs.filter(file =>
      !heicFiles.includes(file) && !svgFiles.includes(file),
    )
    const mainThreadQueue = [...pdfFiles, ...heicFiles, ...svgFiles]

    return { pdfFiles, heicFiles, svgFiles, regularFiles, mainThreadQueue }
  }

  async runMainThreadQueue(
    queue: ImageJob[],
    format: OutputFormat,
    onFileCompleted: () => void,
      onFileError: () => void,
  ): Promise<{ completed: number; errors: number }> {
    if (queue.length === 0) return { completed: 0, errors: 0 }

    const pendingFiles = [...queue]
    let completed = 0
    let errors = 0

    const processNext = async (): Promise<void> => {
      if (pendingFiles.length === 0) return

      const file = pendingFiles.shift()!

      // Update status to processing
      this.set((state: Record<string, unknown>) => ({
        ...state,
        files: (state.files as ImageJob[]).map((f: ImageJob) =>
          f.id === file.id ? { ...f, status: 'processing' as const } : f,
        ),
      }))

      try {
        let result: ConvertedFile

        if (
          file.originalFile.name.toLowerCase().endsWith('.heic') ||
          file.originalFile.name.toLowerCase().endsWith('.heif') ||
          file.originalFile.type.includes('heic')
        ) {
          // HEIC — use processHeicFile directly
          const heicBlob = await processHeicFile(file.originalFile, format)
          const url = URL.createObjectURL(heicBlob)
          let extension = '.png'
          if (format === 'image/jpeg') extension = '.jpg'
          else if (format === 'image/webp') extension = '.webp'
          const name = file.originalFile.name.replace(/\.[^/.]+$/, extension)
          result = { blob: heicBlob, url, name }
        } else {
          // SVG or PDF — dynamic import of converter
          const { convertImage } = await import('@/core/engine/converter')
          result = await convertImage(file.originalFile, format)
        }

        // Update status to completed
        this.set((state: Record<string, unknown>) => ({
          ...state,
          files: (state.files as ImageJob[]).map((f: ImageJob) =>
            f.id === file.id ? { ...f, status: 'completed' as const, result } : f,
          ),
        }))

        completed++
        onFileCompleted()
      } catch (error) {
        this.set((state: Record<string, unknown>) => ({
          ...state,
          files: (state.files as ImageJob[]).map((f: ImageJob) =>
            f.id === file.id
              ? { ...f, status: 'error' as const, errorMessage: (error as Error).message }
              : f,
          ),
        }))

        errors++
        onFileError()
      }

      await processNext()
    }

    // Launch concurrent pool — throttled to MAX_MAIN_THREAD_CONCURRENT
    const initialCount = Math.min(queue.length, MAX_MAIN_THREAD_CONCURRENT)
    const workers = Array.from({ length: initialCount }, () => processNext())
    await Promise.all(workers)

    return { completed, errors }
  }
}
