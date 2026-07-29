import { useState } from 'react'
import { Share2, MessageSquare } from 'lucide-react'
import { Button } from '@/ui/primitives/Button'
import { ShareModal } from '@/components/common/ShareModal'

export function Header() {
  const [isShareOpen, setIsShareOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-brand-sage/15 h-16">
        <div className="max-w-3xl mx-auto px-8 h-full flex items-center justify-between max-sm:px-4">
          <div className="flex items-center gap-3 max-sm:gap-2">
            <img src="/favicons/logo.webp" alt="Logo" width="32" height="32" className="w-8 h-8" />
            <span className="font-bold text-brand-dark">Secure Converter</span>
          </div>
          <div className="hidden md:flex bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
            Local & Secure
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              onClick={() => window.open('https://forms.gle/M5YAnWM4uNcmf3kb9', '_blank', 'noopener,noreferrer')}
              variant="outline"
              size="sm"
              className="text-brand-dark hover:bg-brand-sage/10 border-brand-sage/30"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline ml-2">Feedback</span>
              </Button>
              <Button
                onClick={() => setIsShareOpen(true)}
                variant="outline"
                size="sm"
                className="text-brand-dark hover:bg-brand-sage/10 border-brand-sage/30"
                >
                <Share2 className="w-4 h-4" />
                <span className="hidden md:inline ml-2">Share</span>
              </Button>
          </div>
        </div>
      </header>
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  )
}
