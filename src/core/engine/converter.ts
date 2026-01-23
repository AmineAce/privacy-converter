import type { ConvertedFile, OutputFormat } from '../types/core'
import { processHeicFile } from '../services/heicService'

export function convertImage(file: File, format: OutputFormat): Promise<ConvertedFile> {
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
  return new Promise((resolve, reject) => {
    createImageBitmap(file)
      .then((bitmap) => {
        let canvas: HTMLCanvasElement | OffscreenCanvas

        if (typeof OffscreenCanvas !== 'undefined') {
          canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
        } else {
          canvas = document.createElement('canvas')
          canvas.width = bitmap.width
          canvas.height = bitmap.height
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        ctx.drawImage(bitmap, 0, 0)

        const quality = (format === 'image/jpeg' || format === 'image/webp') ? 0.85 : undefined

        const toBlob = (canvas: HTMLCanvasElement | OffscreenCanvas): Promise<Blob | null> => {
          if (canvas instanceof OffscreenCanvas) {
            return canvas.convertToBlob({ type: format, ...(quality && { quality }) })
          } else {
            return new Promise((resolve) => {
              canvas.toBlob(resolve, format, quality)
            })
          }
        }

        return toBlob(canvas)
      })
      .then((blob) => {
        if (!blob) {
          reject(new Error('Failed to convert image'))
          return
        }

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
      })
      .catch(reject)
  })
}
