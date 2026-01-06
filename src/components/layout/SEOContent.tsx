import { useState, useEffect } from 'react'
import { Button } from '@/ui/primitives/Button'

export function SEOContent() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      setInstallPrompt(null)
    }
  }
  return (
    <article className="max-w-4xl mx-auto px-8 py-16 space-y-12 text-gray-600">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Why use Secure Converter?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A secure, privacy-focused image converter that processes everything locally in your browser.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Zero Server Uploads</h3>
          <p className="text-gray-600">
            Your images never leave your device. All processing happens client-side,
            ensuring complete privacy and security.
          </p>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Offline Capable</h3>
          <p className="text-gray-600">
            Works without an internet connection. Convert images anywhere,
            anytime, with full functionality offline.
          </p>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Bulk Processing</h3>
          <p className="text-gray-600">
            Convert multiple images at once. Select multiple files and process
            them all in a single batch operation.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          How to Convert Images
        </h3>
        <ol className="list-decimal list-inside space-y-3 max-w-2xl mx-auto text-gray-600">
          <li>Click or drag images onto the upload area above</li>
          <li>Wait for the files to be processed locally</li>
          <li>Download your converted images individually or as a ZIP</li>
        </ol>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Install as an App
        </h3>
        <div className="max-w-2xl mx-auto text-center space-y-4">
          {installPrompt && (
            <Button
              onClick={handleInstallClick}
              variant="default"
              size="lg"
              className="mb-4"
            >
              Install Secure Converter App
            </Button>
          )}
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>On Chrome/Edge:</strong> Look for the install icon in the address bar, or use the button above.
            </p>
            <p>
              <strong>On iOS Safari:</strong> Tap the share button, then "Add to Home Screen".
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Frequently Asked Questions
        </h3>
        <div className="space-y-6 max-w-3xl mx-auto">
          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">Is it free?</h4>
            <p className="text-gray-600">
              Yes, Secure Converter is completely free to use with no limitations on file size or number of conversions.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">Does it support WebP format?</h4>
            <p className="text-gray-600">
              Yes, you can convert between JPG, PNG, and WebP formats. The tool supports the most common image formats.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">Is it really secure?</h4>
            <p className="text-gray-600">
              Absolutely. All processing happens in your browser using JavaScript Canvas API.
              Your images are never uploaded to any server.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Upcoming Features
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center p-4 border border-dashed border-brand-sage/30 rounded-lg">
            <div className="mb-2">
              <span className="text-xs bg-brand-sage/20 text-brand-sage px-2 py-1 rounded">Coming Soon</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">HEIC to JPG</h4>
            <p className="text-brand-sage">Convert iPhone photos on the fly.</p>
          </div>
          <div className="text-center p-4 border border-dashed border-brand-sage/30 rounded-lg">
            <div className="mb-2">
              <span className="text-xs bg-brand-sage/20 text-brand-sage px-2 py-1 rounded">Coming Soon</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">PNG to JPG</h4>
            <p className="text-brand-sage">Optimize file size for websites.</p>
          </div>
          <div className="text-center p-4 border border-dashed border-brand-sage/30 rounded-lg">
            <div className="mb-2">
              <span className="text-xs bg-brand-sage/20 text-brand-sage px-2 py-1 rounded">Coming Soon</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">PDF Tools</h4>
            <p className="text-brand-sage">Securely merge or convert PDFs locally.</p>
          </div>
          <div className="text-center p-4 border border-dashed border-brand-sage/30 rounded-lg md:col-span-2 lg:col-span-1">
            <div className="mb-2">
              <span className="text-xs bg-brand-sage/20 text-brand-sage px-2 py-1 rounded">Coming Soon</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">SVG Converter</h4>
            <p className="text-brand-sage">Vector to Raster conversion.</p>
          </div>
        </div>
      </section>
    </article>
  )
}
