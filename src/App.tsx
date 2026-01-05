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
        <div className="flex-1">
          <div className="max-w-3xl mx-auto p-8 space-y-8">
            <h1 className="sr-only">Privacy Image Converter</h1>
            <DropZone />
            <FileList />
          </div>
          <SEOContent />
        </div>
        <div className="hidden lg:block sticky top-32 flex flex-col gap-16 pr-8">
          <div className="h-8"></div>
          <AdSpace type="vertical" />
          <div className="h-8"></div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full max-w-[300px] text-center">
            <strong className="font-semibold text-slate-900 text-xs uppercase tracking-wide mb-1">Why Ads?</strong>
            <p className="text-xs text-slate-500 leading-relaxed">We use ads to keep this tool 100% free, private, and offline-capable. Thank you for supporting independent development.</p>
          </div>
          <div className="h-8"></div>
          <AdSpace type="vertical" />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
