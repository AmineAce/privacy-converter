import type { ConvertedFile, OutputFormat } from '../types/core'
import { processHeicFile } from '../services/heicService'
import { convertToPdf } from '../services/pdfService'

// Initialize a single persistent Web Worker instance at the top level
const worker = new Worker(new URL('./conversion.worker.ts', import.meta.url), {
  type: 'module'
})

export function convertImage(file: File, format: OutputFormat): Promise<ConvertedFile> {
  // Handle PDF conversion - MUST run on main thread
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

  // Handle HEIC files by converting directly to target format - MUST run on main thread
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

  // Handle SVG files - MUST run on main thread due to createImageBitmap limitations
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const dataUrl = e.target?.result as string
          
          if (!dataUrl) {
            reject(new Error('Failed to create Data URL'))
            return
          }

          // Create image element
          const img = new Image()

          img.onload = () => {
            try {
              // Create canvas with SVG dimensions from image
              let canvasWidth = img.width
              let canvasHeight = img.height
              
              // Fallback safety: if img.width is 0, use default size
              if (canvasWidth === 0 || canvasHeight === 0) {
                canvasWidth = 1024
                canvasHeight = 1024
              }
              
              const canvas = document.createElement('canvas')
              canvas.width = canvasWidth
              canvas.height = canvasHeight
              const ctx = canvas.getContext('2d')

              if (!ctx) {
                reject(new Error('Failed to get canvas context'))
                return
              }

              // Clear canvas and draw SVG
              ctx.clearRect(0, 0, canvasWidth, canvasHeight)
              ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

              // Export as blob with requested format
              const quality = (format === 'image/jpeg' || format === 'image/webp') ? 0.85 : undefined
              canvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob)
                  let extension = '.png'
                  if (format === 'image/jpeg') extension = '.jpg'
                  else if (format === 'image/webp') extension = '.webp'
                  const name = file.name.replace(/\.[^/.]+$/, extension)

                  resolve({
                    blob,
                    url,
                    name,
                  })
                } else {
                  reject(new Error('Failed to convert SVG to blob'))
                }
              }, format, quality)
            } catch (error) {
              reject(new Error('SVG rendering failed: ' + (error as Error).message))
            }
          }

          img.onerror = () => {
            reject(new Error('Failed to load SVG via Data URL'))
          }

          // Add error handling for cross-origin issues
          img.crossOrigin = 'anonymous'
          
          img.src = dataUrl
          
          // Add a timeout to detect if the image never loads
          setTimeout(() => {
            if (!img.complete || img.naturalWidth === 0) {
              reject(new Error('SVG image failed to load within timeout'))
            }
          }, 5000) // 5 second timeout
        } catch (error) {
          reject(new Error('SVG processing failed: ' + (error as Error).message))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read SVG file'))
      }

      reader.readAsDataURL(file)
    })
  }

  // Handle standard image processing via Web Worker - ONLY for image formats (PNG, JPG, WebP)
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

    // Send conversion job to worker - ONLY for image formats (PNG, JPG, WebP)
    worker.postMessage({
      id: requestId,
      file: file,
      format: format
    })
  })
}
