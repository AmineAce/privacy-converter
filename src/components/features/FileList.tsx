import { FileItem } from './FileItem'
import { Button } from '@/ui/primitives/Button'
import { useFileStore } from '@/core/store/useFileStore'

export function FileList() {
  const files = useFileStore((state) => state.files)
  const isProcessing = useFileStore((state) => state.isProcessing)
  const startConversion = useFileStore((state) => state.startConversion)

  if (files.length === 0) return null

  const allCompleted = files.every((file) => file.status === 'completed')

  return (
    <div className="space-y-4">
      {files.map((job) => (
        <FileItem key={job.id} job={job} />
      ))}
      <div className="flex justify-center">
        <Button
          onClick={() => startConversion()}
          disabled={isProcessing || allCompleted}
          size="lg"
        >
          {isProcessing ? 'Converting...' : 'Convert All'}
        </Button>
      </div>
    </div>
  )
}
