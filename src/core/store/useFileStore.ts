import { create } from 'zustand'
import type { ImageJob, OutputFormat } from '@/core/types/core'
import { validateFile } from '@/lib/validation'
import { processHeicFile } from '@/core/services/heicService'
import { mergeImagesToPdf } from '@/core/services/pdfService'
import { useToastStore } from './useToastStore'

// Define concurrency limit for batch processing
const MAX_CONCURRENT = 5

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
    set({ isProcessing: true })

    const idleFiles = get().files.filter((file) => file.status === 'idle')
    const totalFiles = idleFiles.length

    // Reset progress to 0 at the start
    set({ totalProgress: 0 })

    // Check if we're converting to PDF - if so, handle all files on main thread
    const isPdfConversion = get().outputFormat === 'application/pdf'
    
    if (isPdfConversion) {
      // Handle PDF conversion for all files on main thread
      for (const file of idleFiles) {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === file.id ? { ...f, status: 'processing' as const } : f
          ),
        }))

        try {
          // Import the convertImage function to handle PDF conversion
          const { convertImage } = await import('@/core/engine/converter')
          const result = await convertImage(file.originalFile, get().outputFormat!)

          set((state) => ({
            files: state.files.map((f) =>
              f.id === file.id ? { ...f, status: 'completed' as const, result } : f
            ),
          }))

          // Update progress after each file completes
          const completedCount = idleFiles.filter(f => f.status === 'completed').length + 1
          const progress = Math.round((completedCount / totalFiles) * 100)
          set({ totalProgress: progress })
        } catch (error) {
          set((state) => ({
            files: state.files.map((f) =>
              f.id === file.id
                ? { ...f, status: 'error' as const, errorMessage: (error as Error).message }
                : f
            ),
          }))

          // Update progress after each file completes (including errors)
          const completedCount = idleFiles.filter(f => f.status === 'completed').length + 1
          const progress = Math.round((completedCount / totalFiles) * 100)
          set({ totalProgress: progress })
        }
      }
      
      set({ isProcessing: false })
      set({ totalProgress: 100 })
      useToastStore.getState().showToast('PDF conversion complete!', 'success')
      return
    }

    // For non-PDF conversions, separate HEIC files, SVG files, and regular image files
    const heicFiles = idleFiles.filter(file => 
      file.originalFile.name.toLowerCase().endsWith('.heic') ||
      file.originalFile.name.toLowerCase().endsWith('.heif') ||
      file.originalFile.type.includes('heic')
    )
    const svgFiles = idleFiles.filter(file => 
      file.originalFile.type === 'image/svg+xml'
    )
    const regularFiles = idleFiles.filter(file => !heicFiles.includes(file) && !svgFiles.includes(file))

    // Track completed files for accurate progress calculation
    let completedInThisSession = 0

    // Process HEIC files on main thread (they require the heic-to library)
    for (const file of heicFiles) {
      set((state) => ({
        files: state.files.map((f) =>
          f.id === file.id ? { ...f, status: 'processing' as const } : f
        ),
      }))

      try {
        const result = await processHeicFile(file.originalFile, get().outputFormat || 'image/png')

        const url = URL.createObjectURL(result)
        let extension = '.png'
        if (get().outputFormat === 'image/jpeg') extension = '.jpg'
        else if (get().outputFormat === 'image/webp') extension = '.webp'
        
        const name = file.originalFile.name.replace(/\.[^/.]+$/, extension)

        const convertedResult = {
          blob: result,
          url,
          name
        }

        set((state) => ({
          files: state.files.map((f) =>
            f.id === file.id ? { ...f, status: 'completed' as const, result: convertedResult } : f
          ),
        }))

        // Update progress after each file completes
        completedInThisSession++
        const progress = Math.round((completedInThisSession / totalFiles) * 100)
        set({ totalProgress: progress })
      } catch (error) {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === file.id
              ? { ...f, status: 'error' as const, errorMessage: (error as Error).message }
              : f
          ),
        }))

        // Update progress after each file completes (including errors)
        completedInThisSession++
        const progress = Math.round((completedInThisSession / totalFiles) * 100)
        set({ totalProgress: progress })
      }
    }
    
    // Check if all HEIC files are completed - use state from store
    const currentState = get()
    const heicCompletedCount = heicFiles.filter(f => currentState.files.find(cf => cf.id === f.id)?.status === 'completed').length
    if (heicCompletedCount === heicFiles.length && heicFiles.length > 0) {
      useToastStore.getState().showToast('HEIC conversion complete!', 'success')
    }

    // Process SVG files on main thread (they require special handling)
    for (const file of svgFiles) {
      set((state) => ({
        files: state.files.map((f) =>
          f.id === file.id ? { ...f, status: 'processing' as const } : f
        ),
      }))

      try {
        // Import the convertImage function to handle SVG conversion
        const { convertImage } = await import('@/core/engine/converter')
        const result = await convertImage(file.originalFile, get().outputFormat || 'image/png')

        set((state) => ({
          files: state.files.map((f) =>
            f.id === file.id ? { ...f, status: 'completed' as const, result } : f
          ),
        }))

        // Update progress after each file completes
        completedInThisSession++
        const progress = Math.round((completedInThisSession / totalFiles) * 100)
        set({ totalProgress: progress })
      } catch (error) {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === file.id
              ? { ...f, status: 'error' as const, errorMessage: (error as Error).message }
              : f
          ),
        }))

        // Update progress after each file completes (including errors)
        completedInThisSession++
        const progress = Math.round((completedInThisSession / totalFiles) * 100)
        set({ totalProgress: progress })
      }
    }
    
    // Check if all SVG files are completed - use state from store
    const svgCompletedCount = svgFiles.filter(f => currentState.files.find(cf => cf.id === f.id)?.status === 'completed').length
    if (svgCompletedCount === svgFiles.length && svgFiles.length > 0) {
      useToastStore.getState().showToast('SVG conversion complete!', 'success')
    }

    // Process regular image files with Web Worker using pool-based approach
    if (regularFiles.length > 0) {
      // Create a queue of files to process
      const fileQueue = [...regularFiles]
      let activeWorkers = 0
      let completedCount = 0
      let errorCount = 0

      // Create a single persistent worker for the pool
      const worker = new Worker(new URL('../engine/conversion.worker.ts', import.meta.url), {
        type: 'module'
      })

      // Pool worker function that processes files from the queue
      const processNextFile = async () => {
        if (fileQueue.length === 0) return

        const file = fileQueue.shift()!
        activeWorkers++

        set((state) => ({
          files: state.files.map((f) =>
            f.id === file.id ? { ...f, status: 'processing' as const } : f
          ),
        }))

        // Send conversion job to worker
        worker.postMessage({
          id: file.id,
          file: file.originalFile,
          format: get().outputFormat || 'image/png'
        })
      }

      // Handle worker responses
      worker.onmessage = (event: MessageEvent) => {
        const { id, success, blob, name, error } = event.data
        activeWorkers--

        if (success) {
          // Create object URL for the blob
          const url = URL.createObjectURL(blob)
          const result = {
            blob,
            url,
            name
          }

          set((state) => ({
            files: state.files.map((f) =>
              f.id === id ? { ...f, status: 'completed' as const, result } : f
            ),
          }))

          completedCount++
          completedInThisSession++
          
          // Calculate progress for regular files - ensure accurate progress updates
          const progress = Math.round((completedInThisSession / totalFiles) * 100)
          set({ totalProgress: progress })
        } else {
          set((state) => ({
            files: state.files.map((f) =>
              f.id === id
                ? { ...f, status: 'error' as const, errorMessage: error }
                : f
            ),
          }))

          errorCount++
          completedInThisSession++
          
          // Calculate progress for regular files (including errors) - ensure accurate progress updates
          const progress = Math.round((completedInThisSession / totalFiles) * 100)
          set({ totalProgress: progress })
        }

        // Check if all files are processed - ensure isProcessing only turns false when entire queue is empty
        if (completedCount + errorCount === regularFiles.length) {
          worker.terminate()
          set({ isProcessing: false })

          // Ensure progress is explicitly set to 100 when all files are processed
          set({ totalProgress: 100 })
          
          const totalCompleted = completedCount + heicFiles.filter(f => f.status === 'completed').length
          const totalFiles = idleFiles.length
          
          if (totalCompleted === totalFiles && totalFiles > 0) {
            useToastStore.getState().showToast('Conversion complete!', 'success')
          }
        } else {
          // Launch next file if queue is not empty and we have capacity - dynamic slot management
          if (fileQueue.length > 0 && activeWorkers < MAX_CONCURRENT) {
            processNextFile()
          }
        }
      }

      worker.onerror = (error) => {
        worker.terminate()
        set({ isProcessing: false })
        useToastStore.getState().showToast(`Worker error: ${error.message || 'Unknown error'}`, 'error')
      }

      // Launch initial pool of workers (up to MAX_CONCURRENT or fileQueue.length, whichever is smaller)
      const initialWorkers = Math.min(MAX_CONCURRENT, fileQueue.length)
      for (let i = 0; i < initialWorkers; i++) {
        processNextFile()
      }
    } else {
      // Only HEIC files were processed - ensure proper state management
      set({ isProcessing: false })
      // Ensure progress is explicitly set to 100 when all files are processed
      set({ totalProgress: 100 })
      const totalCompleted = heicFiles.filter(f => f.status === 'completed').length
      if (totalCompleted === heicFiles.length && heicFiles.length > 0) {
        useToastStore.getState().showToast('Conversion complete!', 'success')
      }
    }
    
    // Check if all files are completed (both HEIC and regular files)
    const finalTotalCompleted = heicFiles.filter(f => f.status === 'completed').length + 
                               get().files.filter(f => f.status === 'completed' && heicFiles.every(hf => hf.id !== f.id)).length
    const finalTotalFiles = idleFiles.length
    
    if (finalTotalCompleted === finalTotalFiles && finalTotalFiles > 0) {
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
      mergedPdf: null,
      totalProgress: 0
    })
  },
}))
