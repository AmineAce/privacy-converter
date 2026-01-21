import { Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="max-w-3xl mx-auto px-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-900">© 2026 Secure Converter</p>
          <p className="text-sm text-slate-500 text-center">
            All conversions happen locally. Your files never leave your device.
          </p>
          <a
            href="https://github.com/AmineAce/privacy-converter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
          >
            <Github className="w-5 h-5" />
            <span className="text-sm">Github</span>
          </a>
          <a
            href="https://lucide.dev"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Icons by Lucide
          </a>
        </div>
      </div>
    </footer>
  )
}
