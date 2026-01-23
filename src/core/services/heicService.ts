// Cache for the heic-to module to avoid repeated imports
let heicToModule: any = null

async function getHeicTo() {
  if (!heicToModule) {
    heicToModule = await import('heic-to')
  }
  return heicToModule
}

export async function processHeicFile(blob: File, format: string): Promise<Blob> {
  // Double-check this is actually an HEIC file before loading the heavy library
  const isHeic = blob.name.toLowerCase().endsWith('.heic') ||
                 blob.name.toLowerCase().endsWith('.heif') ||
                 blob.type.includes('heic')

  if (!isHeic) {
    throw new Error('File is not HEIC format')
  }

  const { heicTo } = await getHeicTo()

  try {
    const result = await heicTo({
      blob,
      type: format as `image/${string}`,
      quality: 0.85
    })

    return result
  } catch (error) {
    console.error('heic-to conversion failed:', error)
    throw new Error(`HEIC conversion failed: ${error}`)
  }
}

// Preload function for when HEIC files are detected (optional optimization)
export async function preloadHeicTo(): Promise<void> {
  if (!heicToModule) {
    heicToModule = await import('heic-to')
  }
}
