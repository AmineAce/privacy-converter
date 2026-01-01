import type { ConvertedFile } from '../types/core'

export function convertImage(file: File): Promise<ConvertedFile> {
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

        const toBlob = (canvas: HTMLCanvasElement | OffscreenCanvas): Promise<Blob | null> => {
          if (canvas instanceof OffscreenCanvas) {
            return canvas.convertToBlob({ type: 'image/png' })
          } else {
            return new Promise((resolve) => {
              canvas.toBlob(resolve, 'image/png')
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
        const name = file.name.replace(/\.[^/.]+$/, '.png')

        resolve({
          blob,
          url,
          name,
        })
      })
      .catch(reject)
  })
}
