import { create } from 'zustand'
import type { ImageJob, OutputFormat } from '@/core/types/core'
import { validateFile } from '@/lib/validation'
import { processHeicFile } from '@/core/services/heicService'
import { mergeImagesToPdf } from '@/core/services/pdfService'
import { useToastStore } from './useToastStore'

// Define concurrency limits for batch processing
const MAX_CONCURRENT = 5
const MAX_MAIN_THREAD_CONCURRENT = 3

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
    console.log('🔧 startConversion called')
    set({ isProcessing: true })

    const idleFiles = get().files.filter((file) => file.status === 'idle')
    const totalFiles = idleFiles.length
    console.log('📄 Total idle files:', totalFiles)

    // Reset progress to 0 at the start
    set({ totalProgress: 0 })

    // Separate files by conversion type - EXPLICIT QUEUE CLASSIFICATION
    const pdfFiles = idleFiles.filter(() => get().outputFormat === 'application/pdf')
    const heicFiles = idleFiles.filter(file => 
      (get().outputFormat !== 'application/pdf') &&
      (file.originalFile.name.toLowerCase().endsWith('.heic') ||
       file.originalFile.name.toLowerCase().endsWith('.heif') ||
       file.originalFile.type.includes('heic'))
    )
    const svgFiles = idleFiles.filter(file => 
      (get().outputFormat !== 'application/pdf') &&
      file.originalFile.type === 'image/svg+xml'  // EXPLICITLY ensure SVG files go to Main Thread Queue
    )
    const regularFiles = idleFiles.filter(file => 
      !pdfFiles.includes(file) && !heicFiles.includes(file) && !svgFiles.includes(file)
    )

    console.log('📋 File separation:')
    console.log('  PDF files:', pdfFiles.length)
    console.log('  HEIC files:', heicFiles.length)
    console.log('  SVG files:', svgFiles.length)
    console.log('  Regular files:', regularFiles.length)
    console.log('  Output format:', get().outputFormat)

    // Main thread queue management for PDF, HEIC, and SVG conversions
    const mainThreadQueue = [...pdfFiles, ...heicFiles, ...svgFiles]  // EXPLICIT Main Thread Queue
    console.log('🚀 Main thread queue length:', mainThreadQueue.length)

    // CREATE THE QUEUE MANAGEMENT LOGIC
    const pendingFiles = [...mainThreadQueue]  // Shallow copy of the mainThreadQueue array
    let completedMainThreadJobs = 0
    let errorMainThreadJobs = 0

    // DEFINE THE 'WORKER' FUNCTION (Recursive Helper)
    const processNextMainThreadJob = async () => {
      // Base Case: If pendingFiles is empty, return immediately
      if (pendingFiles.length === 0) return

      // Action: .shift() (remove) the next file from pendingFiles
      const file = pendingFiles.shift()!
      console.log('📁 Processing file:', file.originalFile.name, 'Type:', file.originalFile.type)

      // State Update 1: Update this specific file's status to 'processing' (Green text)
      set((state) => ({
        files: state.files.map((f) =>
          f.id === file.id ? { ...f, status: 'processing' as const } : f
        ),
      }))

      try {
        let result: any

        if (file.originalFile.name.toLowerCase().endsWith('.heic') || 
            file.originalFile.name.toLowerCase().endsWith('.heif') || 
            file.originalFile.type.includes('heic')) {
          console.log('🖼️ Processing HEIC file:', file.originalFile.name)
          // HEIC conversion
          result = await processHeicFile(file.originalFile, get().outputFormat || 'image/png')
          const url = URL.createObjectURL(result)
          let extension = '.png'
          if (get().outputFormat === 'image/jpeg') extension = '.jpg'
          else if (get().outputFormat === 'image/webp') extension = '.webp'
          const name = file.originalFile.name.replace(/\.[^/.]+$/, extension)
          result = { blob: result, url, name }
        } else if (file.originalFile.type === 'image/svg+xml') {
          console.log('🎨 Processing SVG file:', file.originalFile.name)
          // SVG conversion
          const { convertImage } = await import('@/core/engine/converter')
          result = await convertImage(file.originalFile, get().outputFormat || 'image/png')
        } else {
          console.log('📄 Processing PDF file:', file.originalFile.name)
          // PDF conversion
          const { convertImage } = await import('@/core/engine/converter')
          result = await convertImage(file.originalFile, get().outputFormat!)
        }

        // State Update 2: Update this specific file's status to 'completed' (or 'error') and save the result
        set((state) => ({
          files: state.files.map((f) =>
            f.id === file.id ? { ...f, status: 'completed' as const, result } : f
          ),
        }))

        completedMainThreadJobs++
        console.log('✅ File completed, completed:', completedMainThreadJobs, 'errors:', errorMainThreadJobs)
        const progress = Math.round(((completedMainThreadJobs + errorMainThreadJobs) / totalFiles) * 100)
        set({ totalProgress: progress })
      } catch (error) {
        console.error('❌ File failed:', file.originalFile.name, error)
        set((state) => ({
          files: state.files.map((f) =>
            f.id === file.id
              ? { ...f, status: 'error' as const, errorMessage: (error as Error).message }
              : f
          ),
        }))

        errorMainThreadJobs++
        console.log('❌ Error count:', errorMainThreadJobs)
        const progress = Math.round(((completedMainThreadJobs + errorMainThreadJobs) / totalFiles) * 100)
        set({ totalProgress: progress })
      }

      // Recursion: await processNextMainThreadJob() (Call itself to grab the next file)
      await processNextMainThreadJob()
    }

    // EXECUTE THE POOL
    // Create an array of size Math.min(mainThreadQueue.length, MAX_MAIN_THREAD_CONCURRENT)
    const initialWorkersCount = Math.min(mainThreadQueue.length, MAX_MAIN_THREAD_CONCURRENT)
    console.log('🚀 Launching', initialWorkersCount, 'initial main thread workers')
    const initialWorkers = Array(initialWorkersCount).fill(null).map(() => processNextMainThreadJob())

    // The Barrier: await Promise.all() on this array of workers
    await Promise.all(initialWorkers)
    console.log('🎯 Main thread pool synchronization barrier crossed')

    // Count successes and failures
    const successfulConversions = completedMainThreadJobs
    const failedConversions = errorMainThreadJobs

    console.log('📊 Main thread results:')
    console.log('  Successful:', successfulConversions)
    console.log('  Failed:', failedConversions)

    // Update progress to 100% for main thread conversions
    if (mainThreadQueue.length > 0) {
      set({ totalProgress: 100 })
    }

    // Show success sounds for main thread conversions if all succeeded
    if (successfulConversions === mainThreadQueue.length && mainThreadQueue.length > 0) {
      console.log('🎉 All main thread conversions succeeded!')
      if (get().outputFormat === 'application/pdf') {
        console.log('📢 Showing PDF success toast')
        useToastStore.getState().showToast('PDF conversion complete!', 'success')
      }
      if (mainThreadQueue.some(f => 
        f.originalFile.name.toLowerCase().endsWith('.heic') ||
        f.originalFile.name.toLowerCase().endsWith('.heif') ||
        f.originalFile.type.includes('heic')
      )) {
        console.log('📢 Showing HEIC success toast')
        useToastStore.getState().showToast('HEIC conversion complete!', 'success')
      }
      if (mainThreadQueue.some(f => f.originalFile.type === 'image/svg+xml')) {
        console.log('📢 Showing SVG success toast')
        useToastStore.getState().showToast('SVG conversion complete!', 'success')
      }
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
          const progress = Math.round(((successfulConversions + failedConversions + completedCount + errorCount) / totalFiles) * 100)
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
          const progress = Math.round(((successfulConversions + failedConversions + completedCount + errorCount) / totalFiles) * 100)
          set({ totalProgress: progress })
        }

        // Check if all files are processed - ensure isProcessing only turns false when entire queue is empty
        if (completedCount + errorCount === regularFiles.length) {
          worker.terminate()
          
          // Check if all main thread jobs are also completed
          if (successfulConversions + failedConversions === mainThreadQueue.length) {
            set({ isProcessing: false })
            set({ totalProgress: 100 })
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
      // Only main thread conversions - set isProcessing to false after main thread completes
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
