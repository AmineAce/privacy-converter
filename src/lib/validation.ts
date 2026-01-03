import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from './constants'

export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check type
  if (!(file.type in ACCEPTED_IMAGE_TYPES)) {
    return { isValid: false, error: 'File type not supported' }
  } 

  // Check size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File is too large (Max 50MB)' }
  }

  return { isValid: true }
}