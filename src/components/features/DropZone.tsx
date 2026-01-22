import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACCEPTED_IMAGE_TYPES } from '@/lib/constants'
import { useFileStore } from '@/core/store/useFileStore'
import { useToastStore } from '@/core/store/useToastStore'

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

    switch (inputType) {
      case 'image/png':
        suggestions = ['PNG to JPG', 'PNG to WebP']
        break
      case 'image/jpeg':
        suggestions = ['JPG to PNG', 'JPG to WebP']
        break
      case 'image/webp':
        suggestions = ['WebP to JPG', 'WebP to PNG']
        break
      case 'image/svg+xml':
        suggestions = ['SVG to PNG', 'SVG to JPG']
        break
      default:
        suggestions = []
    }

    setSuggestedModes(suggestions)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      console.log('--- DROP DEBUG START ---')
      console.log('Raw Accepted Files:', acceptedFiles)
      console.log('File Types Detected:', acceptedFiles.map(f => f.type))
      console.log('Unique Types Set Size:', new Set(acceptedFiles.map(f => f.type)).size)

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
