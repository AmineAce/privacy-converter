import React, { useState } from 'react'
import { X, Twitter, MessageCircle, Copy } from 'lucide-react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleShareOnX = () => {
    const text = encodeURIComponent("Check out Secure Converter - a privacy-first image converter that processes locally in your browser! No uploads, no trackers.")
    const url = encodeURIComponent("https://secure-jpg-to-png.pages.dev")
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  const handleShareOnWhatsApp = () => {
    const text = encodeURIComponent("Check out Secure Converter - a privacy-first image converter that processes locally in your browser! No uploads, no trackers. https://secure-jpg-to-png.pages.dev")
    const shareUrl = `https://wa.me/?text=${text}`
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://secure-jpg-to-png.pages.dev/')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Share Secure Converter</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <button
            onClick={handleShareOnX}
            className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 251 256"
              className="fill-current"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid"
            >
              <title>X</title>
              <g>
                <path d="M149.078767,108.398529 L242.331303,0 L220.233437,0 L139.262272,94.1209195 L74.5908396,0 L0,0 L97.7958952,142.3275 L0,256 L22.0991185,256 L107.606755,156.605109 L175.904525,256 L250.495364,256 L149.07334,108.398529 L149.078767,108.398529 Z M118.810995,143.581438 L108.902233,129.408828 L30.0617399,16.6358981 L64.0046968,16.6358981 L127.629893,107.647252 L137.538655,121.819862 L220.243874,240.120681 L186.300917,240.120681 L118.810995,143.586865 L118.810995,143.581438 Z" />
              </g>
            </svg>
            Post on X
          </button>
          <button
            onClick={handleShareOnWhatsApp}
            className="w-full py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Share via WhatsApp
          </button>
          <button
            onClick={handleCopyLink}
            className="w-full py-3 px-4 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <Copy size={18} />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  )
}
