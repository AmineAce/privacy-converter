import { Header } from '@/components/layout/Header'
import { DropZone } from '@/components/features/DropZone'
import { FileList } from '@/components/features/FileList'
import { Footer } from '@/components/layout/Footer'
import { SEOContent } from '@/components/layout/SEOContent'
import AdSpace from '@/components/features/AdSpace'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex">
        <aside className="hidden xl:flex w-[300px] flex-col gap-6 sticky top-32 h-fit pl-6">
          <AdSpace type="vertical" heading="Secure Storage" />
        </aside>
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="w-full max-w-3xl p-8 space-y-8">
            <h1 className="sr-only">Secure Converter</h1>
            <DropZone />
            <FileList />
          </div>
          <SEOContent />
        </div>
        <aside className="hidden lg:flex w-[300px] flex-col gap-6 sticky top-32 h-fit pr-6">
          <AdSpace type="vertical" heading="Private VPN" />
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full max-w-[300px] text-center">
            <strong className="font-semibold text-slate-900 text-xs uppercase tracking-wide mb-1">Why Ads?</strong>
            <p className="text-xs text-slate-500 leading-relaxed">We use ads to keep this tool 100% free, private, and offline-capable. Thank you for supporting independent development.</p>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  )
}

export default App
