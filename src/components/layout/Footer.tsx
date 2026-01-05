import { Github } from 'lucide-react'
import AdSpace from '@/components/features/AdSpace'

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="max-w-3xl mx-auto px-8">
        <p className="text-[10px] uppercase tracking-wider text-brand-sage/50 mb-2 text-center">Advertisement • Supporting Serverless Privacy</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <AdSpace type="horizontal" />
          <AdSpace type="horizontal" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-900">© 2026 PrivacyConverter</p>
          <p className="text-sm text-slate-500 text-center">
            All conversions happen locally. Your files never leave your device.
          </p>
          <a
            href="https://github.com/AmineAce/privacy-converter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
