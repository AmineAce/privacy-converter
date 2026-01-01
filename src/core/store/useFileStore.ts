import { create } from 'zustand'
import type { ImageJob } from '@/core/types/core'
import { validateFile } from '@/lib/validation'
import { convertImage } from '@/core/engine/converter'

interface FileStore {
  files: ImageJob[]
  isProcessing: boolean
  addFiles: (incomingFiles: File[]) => void
  startConversion: () => Promise<void>
  removeFile: (id: string) => void
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  isProcessing: false,

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
        const result = await convertImage(file.originalFile)

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

    set({ isProcessing: false })
  },

  removeFile: (id) => {
    const file = get().files.find((f) => f.id === id)
    if (file) {
      URL.revokeObjectURL(file.originalPreview)
      if (file.result) {
        URL.revokeObjectURL(file.result.url)
      }
    }

    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    }))
  },
}))
