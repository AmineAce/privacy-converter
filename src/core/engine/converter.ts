import type { ConvertedFile, OutputFormat } from '../types/core'
import { processHeicFile } from '../services/heicService'
import { convertToPdf } from '../services/pdfService'

// Main-thread conversion engine — workers managed by useFileStore

function wrapResult(blob: Blob, file: File, _format: OutputFormat, extension: string): ConvertedFile {
  const url = URL.createObjectURL(blob)
  const name = file.name.replace(/\.[^/.]+$/, extension)
  return { blob, url, name }
}

function convertPdf(file: File, format: OutputFormat): Promise<ConvertedFile> {
  return convertToPdf(file)
    .then((blob) => wrapResult(blob, file, format, '.pdf'))
}

function convertHeic(file: File, format: OutputFormat): Promise<ConvertedFile> {
  return processHeicFile(file, format)
    .then((blob) => {
      let extension = '.png'
      if (format === 'image/jpeg') extension = '.jpg'
      else if (format === 'image/webp') extension = '.webp'
      return wrapResult(blob, file, format, extension)
    })
}

function convertSvg(file: File, format: OutputFormat): Promise<ConvertedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const dataUrl = e.target?.result as string

        if (!dataUrl) {
          reject(new Error('Failed to create Data URL'))
          return
        }

        const img = new Image()
        let timeoutId: ReturnType<typeof setTimeout> | null = null

        img.onload = () => {
          if (timeoutId !== null) clearTimeout(timeoutId)
          try {
            let canvasWidth = img.width
            let canvasHeight = img.height

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

            ctx.clearRect(0, 0, canvasWidth, canvasHeight)
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

            const quality = (format === 'image/jpeg' || format === 'image/webp') ? 0.85 : undefined
            canvas.toBlob((blob) => {
              if (blob) {
                let extension = '.png'
                if (format === 'image/jpeg') extension = '.jpg'
                else if (format === 'image/webp') extension = '.webp'
                resolve(wrapResult(blob, file, format, extension))
              } else {
                reject(new Error('Failed to convert SVG to blob'))
              }
            }, format, quality)
          } catch (error) {
            reject(new Error('SVG rendering failed: ' + (error as Error).message))
          }
        }

        img.onerror = () => {
          if (timeoutId !== null) clearTimeout(timeoutId)
          reject(new Error('Failed to load SVG via Data URL'))
        }

        img.crossOrigin = 'anonymous'
        img.src = dataUrl

        timeoutId = setTimeout(() => {
          if (!img.complete || img.naturalWidth === 0) {
            reject(new Error('SVG image failed to load within timeout'))
          }
        }, 5000)
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

export function convertImage(file: File, format: OutputFormat): Promise<ConvertedFile> {
  if (format === 'application/pdf') return convertPdf(file, format)
  if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type.includes('heic')) return convertHeic(file, format)
  if (file.type === 'image/svg+xml') return convertSvg(file, format)
  throw new Error('Standard image conversion must be routed through useFileStore worker')
}
