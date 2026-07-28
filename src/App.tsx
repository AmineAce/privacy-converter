import { Header } from '@/components/layout/Header'
import { IntroHero } from '@/components/layout/IntroHero'
import { ConversionNav } from '@/components/features/ConversionNav'
import { DropZone } from '@/components/features/DropZone'
import { FileList } from '@/components/features/FileList'
import { Footer } from '@/components/layout/Footer'
import { SEOContent } from '@/components/layout/SEOContent'
import { Toast } from '@/components/common/Toast'
import { ErrorBoundary } from "./components/common/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
      <Toast />
      <Header />
      <main className="flex-1 flex">
          <div className="flex-1 min-w-0 flex flex-col items-center">
            <div className="w-full max-w-3xl p-8 space-y-8">
              <h1 className="sr-only">Secure Converter</h1>
              <IntroHero />
            <div className="mt-6">
                <ConversionNav />
            </div>
              <DropZone />
            <FileList />
            </div>
            <SEOContent />
          </div>
        </main>
        <Footer />
      </div>
        </ErrorBoundary>
    )
  }

export default App
