/**
 * Web Worker for image conversion to keep UI responsive
 * This file runs in a Worker scope (no window or document)
 */

interface ConversionMessage {
  id: string
  file: File | Blob
  format: string
}

interface ConversionResult {
  id: string
  success: true
  blob: Blob
  name: string
}

interface ConversionError {
  id: string
  success: false
  error: string
}

// Check if file is HEIC format
function isHeicFile(file: File | Blob): boolean {
  const name = (file as File).name || ''
  const type = file.type || ''
  
  return name.toLowerCase().endsWith('.heic') ||
         name.toLowerCase().endsWith('.heif') ||
         type.includes('heic') ||
         type.includes('heif')
}

self.onmessage = async function (event: MessageEvent<ConversionMessage>) {
  const { id, file, format } = event.data

  try {
    // Handle HEIC files with special processing
    if (isHeicFile(file)) {
      // For HEIC files, we need to use the heic-to library
      // Since we can't import modules directly in the worker message handler,
      // we'll need to handle this differently
      throw new Error('HEIC conversion requires main thread processing')
    }

    // Decode the image using createImageBitmap
    const bitmap = await createImageBitmap(file)

    // Initialize OffscreenCanvas with image dimensions
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      // Explicitly close the bitmap before throwing error
      bitmap.close()
      throw new Error('Failed to get canvas context')
    }

    // Draw the bitmap to the canvas
    ctx.drawImage(bitmap, 0, 0)

    // CRITICAL: Explicitly release ImageBitmap memory immediately after use
    bitmap.close()

    // Export as Blob with the requested MIME type
    // For JPEG and WebP, use quality 0.85 for good compression/quality balance
    const quality = (format === 'image/jpeg' || format === 'image/webp') ? 0.85 : undefined
    const blob = await canvas.convertToBlob({ 
      type: format, 
      ...(quality && { quality })
    })

    // Generate output filename
    let extension = '.png'
    if (format === 'image/jpeg') extension = '.jpg'
    else if (format === 'image/webp') extension = '.webp'
    
    const name = (file as File).name 
      ? (file as File).name.replace(/\.[^/.]+$/, extension)
      : `converted-image${extension}`

    // Send result back to main thread
    const result: ConversionResult = {
      id,
      success: true,
      blob,
      name
    }

    self.postMessage(result)
    
    // CRITICAL: Clear object references to allow garbage collection
    // The blob will be transferred to main thread, so we don't need to close it
    // Clear local references to help garbage collection
    result.blob = null as any // This will be transferred, so we clear the reference
    result.name = ''
    result.id = ''
    
  } catch (error) {
    // Handle errors (corrupted files, unsupported formats, etc.)
    const errorMessage: ConversionError = {
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error'
    }

    self.postMessage(errorMessage)
  }
}
