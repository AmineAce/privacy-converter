import type { ConvertedFile, OutputFormat } from '../types/core'
import { processHeicFile } from '../services/heicService'
import { convertToPdf } from '../services/pdfService'

// Initialize a single persistent Web Worker instance at the top level
const worker = new Worker(new URL('./conversion.worker.ts', import.meta.url), {
  type: 'module'
})

export function convertImage(file: File, format: OutputFormat): Promise<ConvertedFile> {
  // Handle PDF conversion
  if (format === 'application/pdf') {
    return convertToPdf(file)
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        const name = file.name.replace(/\.[^/.]+$/, '.pdf')

        return {
          blob,
          url,
          name,
        }
      })
  }

  // Handle HEIC files by converting directly to target format
  if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type.includes('heic')) {
    return processHeicFile(file, format)
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        let extension = '.png'
        if (format === 'image/jpeg') extension = '.jpg'
        else if (format === 'image/webp') extension = '.webp'
        const name = file.name.replace(/\.[^/.]+$/, extension)

        return {
          blob,
          url,
          name,
        }
      })
  }

  // Handle standard image processing via Web Worker
  return new Promise((resolve, reject) => {
    // Create a unique ID for this conversion request
    const requestId = crypto.randomUUID()

    // Set up message handler for this specific request
    const handleMessage = (event: MessageEvent) => {
      const { id, success, blob, name, error } = event.data

      if (id === requestId) {
        // Clean up the event listener after receiving the response
        worker.removeEventListener('message', handleMessage)
        worker.removeEventListener('error', errorHandler)
        clearTimeout(timeoutId)

        if (success) {
          const url = URL.createObjectURL(blob)
          resolve({
            blob,
            url,
            name,
          })
        } else {
          reject(new Error(error || 'Failed to convert image'))
        }
      }
    }

    // Set up error handler
    const errorHandler = (error: ErrorEvent) => {
      worker.removeEventListener('message', handleMessage)
      worker.removeEventListener('error', errorHandler)
      clearTimeout(timeoutId)
      reject(new Error('Worker error: ' + error.message))
    }

    // Set up timeout to prevent hanging requests (30 second timeout)
    const timeoutId = setTimeout(() => {
      worker.removeEventListener('message', handleMessage)
      worker.removeEventListener('error', errorHandler)
      reject(new Error('Image conversion timed out after 30 seconds'))
    }, 30000)

    worker.addEventListener('message', handleMessage)
    worker.addEventListener('error', errorHandler)

    // Send conversion job to worker
    worker.postMessage({
      id: requestId,
      file: file,
      format: format
    })
  })
}
