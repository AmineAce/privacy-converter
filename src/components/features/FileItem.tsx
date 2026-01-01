import { Loader2, X } from 'lucide-react'
import type { ImageJob } from '@/core/types/core'
import { useFileStore } from '@/core/store/useFileStore'

interface FileItemProps {
  job: ImageJob
}

export function FileItem({ job }: FileItemProps) {
  const removeFile = useFileStore((state) => state.removeFile)

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <img
        src={job.originalPreview}
        alt={job.originalFile.name}
        className="w-16 h-16 object-cover rounded border border-slate-200"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {job.originalFile.name}
        </p>
        <p className="text-sm text-gray-500">
          {formatSize(job.originalFile.size)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {job.status === 'idle' && (
          <span className="text-sm text-gray-500">Ready</span>
        )}
        {job.status === 'processing' && (
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        )}
        {job.status === 'completed' && job.result && (
          <>
            <span className="text-sm text-green-500">Done</span>
            <a
              href={job.result.url}
              download={job.result.name}
              className="text-sm text-blue-500 hover:underline"
            >
              Download
            </a>
          </>
        )}
        {job.status === 'error' && (
          <span className="text-sm text-red-500">{job.errorMessage}</span>
        )}
      </div>
      <button
        onClick={() => removeFile(job.id)}
        className="p-1 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
