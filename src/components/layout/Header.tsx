import { ShieldCheck } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16">
      <div className="max-w-3xl mx-auto px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-slate-900">PrivacyConverter</span>
        </div>
        <div className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full border border-emerald-200">
          Offline-Ready & Secure
        </div>
      </div>
    </header>
  )
}
