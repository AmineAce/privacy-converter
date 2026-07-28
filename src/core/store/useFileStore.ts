import { create } from 'zustand'
import type { ImageJob, OutputFormat } from '@/core/types/core'
import { validateFile } from '@/lib/validation'
import { mergeImagesToPdf } from '@/core/services/pdfService'
import { useToastStore } from './useToastStore'
import { ProgressTracker } from './progress'
import { QueueManager } from './queue'
import { WorkerPool } from './pool'

interface FileStore {
  files: ImageJob[]
  isProcessing: boolean
  activeMode: string | null
  outputFormat: OutputFormat | null
  suggestedModes: string[]
  mergedPdf: Blob | null
  totalProgress: number
  addFiles: (incomingFiles: File[]) => void
  startConversion: () => Promise<void>
  removeFile: (id: string) => void
  setOutputFormat: (format: OutputFormat) => void
  setActiveMode: (mode: string | null) => void
  setSuggestedModes: (modes: string[]) => void
  mergeToPdf: () => Promise<void>
  resetFileStatuses: () => void
  clearFiles: () => void
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  isProcessing: false,
  activeMode: null,
  outputFormat: null,
  suggestedModes: [],
  mergedPdf: null,
  totalProgress: 0,

  addFiles: (incomingFiles) => {
    const validFiles = incomingFiles.filter((file) => validateFile(file).isValid)

    const newJobs: ImageJob[] = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      originalFile: file,
      originalPreview: URL.createObjectURL(file),
      status: 'idle' as const,
      result: null,
      errorMessage: null,
    }))

    set((state) => ({ files: [...state.files, ...newJobs] }))
  },

  startConversion: async () => {
    set({ isProcessing: true, totalProgress: 0 })

    const idleFiles = get().files.filter((file) => file.status === 'idle')
    const totalFiles = idleFiles.length
    if (totalFiles === 0) { set({ isProcessing: false }); return }

    const tracker = new ProgressTracker(totalFiles)
    const queueManager = new QueueManager(set)
    const workerPool = new WorkerPool(set)

    const { mainThreadQueue, regularFiles } = queueManager.classifyFiles(idleFiles, get().outputFormat)

      // Run main thread conversions (PDF, HEIC, SVG) — throttled concurrent pool
      const mtResult = await queueManager.runMainThreadQueue(
        mainThreadQueue,
        get().outputFormat || 'image/png',
        () => { tracker.incrementCompleted(); set({ totalProgress: tracker.percentage }) },
        () => { tracker.incrementErrors(); set({ totalProgress: tracker.percentage }) },
      )

    if (mainThreadQueue.length > 0) {
        set({ totalProgress: 100 })
      }

    // Show per-type toasts if all succeeded
    if (mtResult.completed === mainThreadQueue.length && mainThreadQueue.length > 0) {
      if (get().outputFormat === 'application/pdf') {
          useToastStore.getState().showToast('PDF conversion complete!', 'success')
        }
      if (mainThreadQueue.some(f => 
        f.originalFile.name.toLowerCase().endsWith('.heic') ||
          f.originalFile.name.toLowerCase().endsWith('.heif') ||
          f.originalFile.type.includes('heic')
        )) {
          useToastStore.getState().showToast('HEIC conversion complete!', 'success')
      }
        if (mainThreadQueue.some(f => f.originalFile.type === 'image/svg+xml')) {
          useToastStore.getState().showToast('SVG conversion complete!', 'success')
      }
      }

      // Process standard images with Web Worker pool
      if (regularFiles.length > 0) {
      await workerPool.processFiles(
        regularFiles,
          get().outputFormat || 'image/png',
          () => { tracker.incrementCompleted(); set({ totalProgress: tracker.percentage }) },
        () => { tracker.incrementErrors(); set({ totalProgress: tracker.percentage }) },
          () => {
            set({ isProcessing: false, totalProgress: 100 })
            useToastStore.getState().showToast('Conversion complete!', 'success')
        },
          (msg: string) => {
            set({ isProcessing: false })
          useToastStore.getState().showToast(`Worker error: ${msg}`, 'error')
        },
        )
      } else {
        set({ isProcessing: false })
      }
    },

  removeFile: (id) => {
    const file = get().files.find((f) => f.id === id)
    if (file) {
      URL.revokeObjectURL(file.originalPreview)
      if (file.result) {
        URL.revokeObjectURL(file.result.url)
      }
    }

    set((state) => {
      const newFiles = state.files.filter((f) => f.id !== id)
      if (newFiles.length === 0) {
        return {
          files: [],
          activeMode: null,
          outputFormat: null,
          suggestedModes: [],
        }
      } else {
        return {
          files: newFiles,
        }
      }
    })
  },

  setOutputFormat: (format) => set({ outputFormat: format }),

  setActiveMode: (mode) => set({ activeMode: mode }),

  setSuggestedModes: (modes) => set({ suggestedModes: modes }),

  resetFileStatuses: () => {
    set((state) => ({
      files: state.files.map((file) => ({
        ...file,
        status: 'idle' as const,
        result: null,
        errorMessage: null,
      })),
    }))
  },

  mergeToPdf: async () => {
    set({ isProcessing: true })

    try {
      // Extract raw File objects from the files state array
      const rawFiles = get().files.map((job) => job.originalFile)

      // Call the PDF merging service
      const mergedPdfBlob = await mergeImagesToPdf(rawFiles)

      // Create download link and trigger download
      const url = URL.createObjectURL(mergedPdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'merged_document.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Trigger success toast
      useToastStore.getState().showToast('Merged PDF downloaded!', 'success')
    } catch (error) {
      // Trigger error toast if it fails
      useToastStore.getState().showToast(`PDF merge failed: ${(error as Error).message}`, 'error')
      throw error
    } finally {
      // Always set isProcessing to false
      set({ isProcessing: false })
    }
  },

  clearFiles: () => {
    get().files.forEach((file) => {
      URL.revokeObjectURL(file.originalPreview)
      if (file.result) {
        URL.revokeObjectURL(file.result.url)
      }
    })
    set({ 
      files: [], 
      isProcessing: false, 
      activeMode: null, 
      outputFormat: null, 
      suggestedModes: [],
      mergedPdf: null,
      totalProgress: 0
    })
  },
}))
