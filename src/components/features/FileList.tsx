import { FileItem } from './FileItem'
import { Button } from '@/ui/primitives/Button'
import { useFileStore } from '@/core/store/useFileStore'
import { downloadAllAsZip } from '@/lib/zip'
import { Download } from 'lucide-react'

export function FileList() {
  const files = useFileStore((state) => state.files)
  const isProcessing = useFileStore((state) => state.isProcessing)
  const startConversion = useFileStore((state) => state.startConversion)

  if (files.length === 0) return null

  const completedCount = files.filter((file) => file.status === 'completed').length
  const showZipButton = !isProcessing && completedCount > 2

  const handleDownloadAll = async () => {
    await downloadAllAsZip(files)
  }

  return (
    <div className="space-y-4">
      {files.map((job) => (
        <FileItem key={job.id} job={job} />
      ))}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => startConversion()}
          disabled={isProcessing}
          size="lg"
        >
          {isProcessing ? 'Converting...' : 'Convert'}
        </Button>
        {showZipButton && (
          <Button
            onClick={handleDownloadAll}
            disabled={isProcessing}
            size="lg"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download {completedCount} File{completedCount !== 1 ? 's' : ''} as ZIP
          </Button>
        )}
      </div>
    </div>
  )
}
