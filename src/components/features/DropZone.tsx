import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACCEPTED_IMAGE_TYPES } from '@/lib/constants'
import { useFileStore } from '@/core/store/useFileStore'
import { useToastStore } from '@/core/store/useToastStore'
import { preloadHeicTo } from '@/core/services/heicService'

export function DropZone({ className }: { className?: string } = {}) {
  const files = useFileStore((state) => state.files)
  const addFiles = useFileStore((state) => state.addFiles)
  const setSuggestedModes = useFileStore((state) => state.setSuggestedModes)
  const showToast = useToastStore((state) => state.showToast)

  const analyzeAndSuggest = (files: File[]) => {
    if (files.length === 0) return

    const firstFile = files[0]
    const inputType = firstFile.type
    let suggestions: string[] = []

    if (inputType === 'image/heic' || firstFile.name.toLowerCase().endsWith('.heic')) {
      suggestions = ['HEIC to JPG', 'HEIC to PNG']
    } else {
      switch (inputType) {
        case 'image/png':
          suggestions = ['PNG to JPG', 'PNG to WebP', 'PNG to PDF']
          break
        case 'image/jpeg':
          suggestions = ['JPG to PNG', 'JPG to WebP', 'JPG to PDF']
          break
        case 'image/webp':
          suggestions = ['WebP to JPG', 'WebP to PNG', 'WebP to PDF']
          break
        case 'image/svg+xml':
          suggestions = ['SVG to PNG', 'SVG to JPG']
          break
        default:
          suggestions = []
      }
    }

    setSuggestedModes(suggestions)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      // Check if any HEIC files are present and preload the library
      const hasHeicFiles = acceptedFiles.some(file =>
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif') ||
        file.type.includes('heic')
      )

      if (hasHeicFiles) {
        // Preload heic-to in the background for better UX
        preloadHeicTo().catch(console.warn)
      }

      const existingTypes = files.map(file => file.originalFile.type)
      const incomingTypes = acceptedFiles.map(file => file.type)
      const allTypes = [...existingTypes, ...incomingTypes]
      const uniqueTypes = new Set(allTypes)

      if (uniqueTypes.size > 1) {
        showToast('Cannot mix file types.', 'error')
        return
      }

      analyzeAndSuggest(acceptedFiles)
      addFiles(acceptedFiles)
    },
    accept: ACCEPTED_IMAGE_TYPES,
    multiple: true,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors flex flex-col items-center justify-center gap-4 text-center',
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50',
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-10 h-10 text-slate-400" />
      <p className="text-lg font-medium text-gray-900">
        Drag & drop images here
      </p>
    </div>
  )
}
