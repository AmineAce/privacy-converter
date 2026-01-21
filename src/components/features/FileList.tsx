import { useState, useEffect, useRef } from 'react'
import { FileItem } from './FileItem'
import { Button } from '@/ui/primitives/Button'
import { useFileStore } from '@/core/store/useFileStore'
import { downloadAllAsZip } from '@/lib/zip'
import { Download, Trash2, AlertTriangle } from 'lucide-react'

export function FileList() {
  const [isConfirming, setIsConfirming] = useState(false)
  const files = useFileStore((state) => state.files)
  const isProcessing = useFileStore((state) => state.isProcessing)
  const startConversion = useFileStore((state) => state.startConversion)
  const clearFiles = useFileStore((state) => state.clearFiles)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevIsProcessingRef = useRef(false)

  useEffect(() => {
    // Pre-load the success audio
    audioRef.current = new Audio('/success.mp3')
    if (audioRef.current) {
      audioRef.current.volume = 0.40
    }
  }, [])

  useEffect(() => {
    if (isConfirming) {
      const timeout = setTimeout(() => setIsConfirming(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [isConfirming])

  useEffect(() => {
    if (prevIsProcessingRef.current && !isProcessing && files.length > 0 && audioRef.current) {
      audioRef.current.play().catch((error) => console.error('Failed to play success audio:', error))
    }
    prevIsProcessingRef.current = isProcessing
  }, [isProcessing, files.length])

  if (files.length === 0) return null

  const completedCount = files.filter((file) => file.status === 'completed').length
  const showZipButton = !isProcessing && completedCount > 2

  const handleClearClick = () => {
    if (!isConfirming) {
      setIsConfirming(true)
    } else {
      clearFiles()
      setIsConfirming(false)
    }
  }

  const handleDownloadAll = async () => {
    await downloadAllAsZip(files)
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-40 w-full bg-white/80 backdrop-blur-md py-4 mb-6 border-b border-slate-200 flex justify-center gap-4">
        <Button
          onClick={handleClearClick}
          variant={isConfirming ? undefined : "outline"}
          size="lg"
          className={isConfirming ? "bg-slate-900 text-red-500 border-red-500 hover:bg-slate-800" : ""}
        >
          {isConfirming ? <AlertTriangle className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
          {isConfirming ? 'Confirm Clear?' : 'Clear All'}
        </Button>
        <Button
          onClick={() => startConversion()}
          disabled={isProcessing}
          size="lg"
          className={isProcessing ? "bg-slate-900 text-emerald-500 border border-emerald-500/50" : "bg-black text-white"}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((job) => (
          <FileItem key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}
