import { useState, useEffect, useRef } from 'react'
import { FileItem } from './FileItem'
import { Button } from '@/ui/primitives/Button'
import { useFileStore } from '@/core/store/useFileStore'
import { downloadAllAsZip } from '@/lib/zip'
import { Download, Trash2, AlertTriangle, Images } from 'lucide-react'

export function FileList() {
  // All hooks at the top level
  const [isConfirming, setIsConfirming] = useState(false)
  const files = useFileStore((state) => state.files)
  const isProcessing = useFileStore((state) => state.isProcessing)
  const outputFormat = useFileStore((state) => state.outputFormat)
  const startConversion = useFileStore((state) => state.startConversion)
  const clearFiles = useFileStore((state) => state.clearFiles)
  const mergeToPdf = useFileStore((state) => state.mergeToPdf)
  const totalProgress = useFileStore((state) => state.totalProgress)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevIsProcessingRef = useRef(false)

  // Effects after hooks
  useEffect(() => {
    // Pre-load the success audio
    audioRef.current = new Audio('/success.mp3')
    if (audioRef.current) {
      audioRef.current.volume = 0.40
    }
  }, [])

  useEffect(() => {
    // Pre-load the delete confirmation audio
    const deleteAudio = new Audio('/delete.mp3')
    if (deleteAudio) {
      deleteAudio.volume = 0.40
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

  // Early return after all hooks are declared
  if (files.length === 0) return null

  // Derived state and logic
  const totalFiles = files.length
  const completedCount = files.filter((file) => file.status === 'completed').length
  const showZipButton = !isProcessing && completedCount > 2
  const showMergeButton = outputFormat === 'application/pdf' && files.length > 1

  // Event handlers
  const handleClearClick = () => {
    if (!isConfirming) {
      setIsConfirming(true)
    } else {
      // Pre-load and play delete confirmation audio
      const deleteAudio = new Audio('/delete.mp3')
      deleteAudio.volume = 0.40
      deleteAudio.play().catch((error) => console.error('Failed to play delete audio:', error))
      
      clearFiles()
      setIsConfirming(false)
    }
  }

  const handleDownloadAll = async () => {
    await downloadAllAsZip(files)
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Images className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
              {totalFiles} Image{totalFiles !== 1 ? 's' : ''} Uploaded
            </span>
          </div>
        </div>
        {isProcessing && (
          <div className="mt-3 w-full bg-slate-200 rounded-full h-1 overflow-hidden">
            <div 
              key={`progress-${totalProgress}`}
              className="bg-black h-1"
              style={{ 
                width: totalProgress + '%',
                height: '100%',
                display: 'block',
                transition: 'width 0.3s ease-in-out',
                backgroundColor: '#000',
                borderRadius: '9999px'
              }}
            />
          </div>
        )}
      </div>
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
          disabled={isProcessing || !outputFormat}
          size="lg"
          className={
            isProcessing
              ? "bg-slate-900 text-emerald-500 border border-emerald-500/50"
              : !outputFormat
              ? "bg-black text-white opacity-50 cursor-not-allowed"
              : "bg-black text-white"
          }
        >
          {isProcessing ? 'Converting...' : 'Convert'}
        </Button>
        {showMergeButton && (
          <Button
            onClick={() => mergeToPdf()}
            disabled={isProcessing}
            size="lg"
            className="bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200"
          >
            <Images className="w-4 h-4 mr-2" />
            Merge to One PDF
          </Button>
        )}
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
        {files.slice(0, 10).map((job) => (
          <FileItem key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}
