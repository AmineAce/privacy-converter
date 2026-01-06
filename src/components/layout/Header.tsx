export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-brand-blackest/80 backdrop-blur-md border-b border-brand-sage/20 h-16">
      <div className="max-w-3xl mx-auto px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicons/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-brand-mist">Secure Converter</span>
        </div>
        <div className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
          Offline-Ready & Secure
        </div>
      </div>
    </header>
  )
}
