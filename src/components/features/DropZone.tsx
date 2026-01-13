import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACCEPTED_IMAGE_TYPES } from '@/lib/constants'
import { useFileStore } from '@/core/store/useFileStore'

export function DropZone({ className }: { className?: string } = {}) {
  const addFiles = useFileStore((state) => state.addFiles)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addFiles,
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
