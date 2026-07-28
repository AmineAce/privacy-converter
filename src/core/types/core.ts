export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf'

type ConversionStatus = 'idle' | 'processing' | 'completed' | 'error'

export type ConvertedFile = {
  blob: Blob
  url: string
  name: string
}

export type ImageJob = {
  id: string
  originalFile: File
  originalPreview: string
  status: ConversionStatus
  result: ConvertedFile | null
  errorMessage: string | null
}
