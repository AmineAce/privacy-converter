import { Header } from '@/components/layout/Header'
import { DropZone } from '@/components/features/DropZone'
import { FileList } from '@/components/features/FileList'
import { Footer } from '@/components/layout/Footer'
import { SEOContent } from '@/components/layout/SEOContent'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto p-8 space-y-8">
          <h1 className="sr-only">Privacy Image Converter</h1>
          <DropZone />
          <FileList />
        </div>
      </main>
      <SEOContent />
      <Footer />
    </div>
  )
}

export default App
