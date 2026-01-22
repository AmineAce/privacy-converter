import { useToastStore } from '@/core/store/useToastStore'
import { CheckCircle, AlertTriangle, CircleAlert, X } from 'lucide-react'

export function Toast() {
  const { message, type, clearToast } = useToastStore()

  if (!message || !type) return null

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-black text-green-400 border border-green-500'
      case 'warning':
        return 'bg-yellow-500 text-black border border-yellow-600'
      case 'error':
        return 'bg-red-600 text-white border border-red-700'
      default:
        return 'bg-gray-800 text-white'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'error':
        return <CircleAlert className="w-5 h-5" />
      default:
        return null
    }
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${getStyles()}`}>
        {getIcon()}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={clearToast}
          className="ml-2 hover:opacity-70"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
