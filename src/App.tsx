import { Header } from '@/components/layout/Header'
import { DropZone } from '@/components/features/DropZone'
import { ConversionNav } from '@/components/features/ConversionNav'
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
          <AdSpace imageSrc="/ads/nordpass.jpg" linkUrl="https://go.nordpass.io/aff_c?offer_id=488&aff_id=138496&url_id=9356" />
        </aside>
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="w-full max-w-3xl p-8 space-y-8">
            <h1 className="sr-only">Secure Converter</h1>
            <DropZone />
            <div className="mt-6">
              <ConversionNav />
            </div>
            <FileList />
          </div>
          <SEOContent />
        </div>
        <aside className="hidden lg:flex w-[300px] flex-col gap-6 sticky top-32 h-fit pr-6">
          <AdSpace imageSrc="/ads/nordvpn.jpg" linkUrl="https://go.nordvpn.net/aff_c?offer_id=15&aff_id=138496&url_id=902" />
          <div className="hidden bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full max-w-[300px] text-center">
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
