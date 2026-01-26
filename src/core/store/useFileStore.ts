import { create } from 'zustand'
import type { ImageJob, OutputFormat } from '@/core/types/core'
import { validateFile } from '@/lib/validation'
import { convertImage } from '@/core/engine/converter'
import { mergeImagesToPdf } from '@/core/services/pdfService'
import { useToastStore } from './useToastStore'

interface FileStore {
  files: ImageJob[]
  isProcessing: boolean
  activeMode: string | null
  outputFormat: OutputFormat | null
  suggestedModes: string[]
  mergedPdf: Blob | null
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

  addFiles: (incomingFiles) => {
    console.log('files sent to store', incomingFiles)

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
    set({ isProcessing: true })

    const idleFiles = get().files.filter((file) => file.status === 'idle')

    for (const file of idleFiles) {
      set((state) => ({
        files: state.files.map((f) =>
          f.id === file.id ? { ...f, status: 'processing' as const } : f
        ),
      }))

      try {
        const result = await convertImage(file.originalFile, get().outputFormat || 'image/png')

        set((state) => ({
          files: state.files.map((f) =>
            f.id === file.id ? { ...f, status: 'completed' as const, result } : f
          ),
        }))
      } catch (error) {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === file.id
              ? { ...f, status: 'error' as const, errorMessage: (error as Error).message }
              : f
          ),
        }))
      }
    }

    const finalFiles = get().files
    const completedCount = finalFiles.filter((file) => file.status === 'completed').length
    const totalFiles = finalFiles.length

    set({ isProcessing: false })

    if (completedCount === totalFiles && totalFiles > 0) {
      useToastStore.getState().showToast('Conversion complete!', 'success')
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
      mergedPdf: null 
    })
  },
}))
