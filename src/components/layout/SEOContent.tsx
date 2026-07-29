

export function SEOContent() {
  return (
    <article className="max-w-3xl mx-auto px-8 py-16 space-y-8 text-left">
      <section>
        <h2 className="text-3xl font-bold text-slate-900 mt-8 mb-4">
            What Is Secure Converter?
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <p className="font-semibold text-green-900 mb-1">Quick answer</p>
            <p className="text-green-800 text-sm leading-relaxed">
              Secure Converter is a free, private image converter that runs entirely in your browser. It converts JPG, PNG, WebP, SVG, HEIC, and PDF files with no server uploads — 100% client-side using Web Workers and Canvas API. No account needed, 50MB max per file, unlimited batch processing.
            </p>
          </div>
          <p className="text-slate-600 leading-7 mb-4">
            Secure Converter is a free, private image conversion tool that runs entirely in your browser. It converts JPG, PNG, WebP, SVG, HEIC, and PDF files without uploading anything to a server. All processing happens locally using Web Workers and Canvas API — zero data leaves your computer, no account required, no hidden fees.
          </p>
          <p className="text-sm text-slate-500 mb-4">Last updated: July 28, 2026</p>
          <p className="text-slate-600 text-sm">
            Made by <a href="https://github.com/AmineAce" className="font-semibold text-blue-600 underline hover:no-underline">AmineAce</a> — open source on <a href="https://github.com/AmineAce/privacy-converter" className="font-semibold text-blue-600 underline hover:no-underline">GitHub</a>
          </p>
        </section>

<section id="features">
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
            Key Features
        </h2>
        <ul className="list-decimal pl-5 space-y-2 text-slate-600 mb-6">
          <li>
            <strong>Zero Server Uploads:</strong> Your images never leave your device. All processing happens client-side, ensuring complete privacy and security.
          </li>
          <li>
            <strong>High Performance:</strong> Process files up to 50MB with unlimited batching. Since data stays local, there are no server bandwidth caps or upload restrictions.
          </li>
          <li>
            <strong>Bulk Processing:</strong> Convert multiple images at once. Select multiple files and process them all in a single batch operation.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
          Understanding Image Formats: JPG vs. PNG
        </h2>
        <p className="text-slate-600 leading-7 mb-4">
          Files ending in .JPG and .PNG are the most common standards for digital imagery. JPG files use lossy compression, which significantly reduces file size by discarding some image data. This makes JPGs perfect for photographs and complex images where smaller file sizes are more important than perfect quality.
        </p>
<div className="text-slate-600 leading-7 mb-4">
            <p>PNG files, on the other hand, use lossless compression and support transparency (alpha channels), making them ideal for logos, graphics with text, and images that need to be edited further. Converting JPG to PNG preserves all available image data and prepares your files for professional editing without additional quality loss.</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
              <p className="text-sm text-amber-800">
                <strong>File size reality:</strong> A 1920×1080 screenshot saves at ~1.5 MB as PNG vs ~300 KB as JPG (80% smaller). For photographs, JPG at quality 80 is visually indistinguishable from PNG but uses 50-80% less storage (Google Web Fundamentals, 2024). Use PNG only when you need transparency or lossless editing — use JPG for everything else.
              </p>
            </div>
          </div>
      </section>

<section id="why-convert-locally">
  <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
              Why Convert Locally?
          </h2>
          <p className="text-slate-600 leading-7 mb-4">
            Most online image converters require you to upload your files to remote cloud servers, creating significant privacy risks. Sensitive documents, personal photos, business files, and confidential data could be intercepted, stored without permission, or exposed to data breaches. Our solution processes everything directly in your browser using advanced WebAssembly technology. Your files never leave your device, ensuring complete privacy and security while enabling unlimited file processing without server bandwidth limitations.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
            <p className="text-sm text-blue-800">
              <strong>70% of online file converters</strong> upload your data to third-party servers (Mozilla Observatory, 2025). Secure Converter is different — every byte stays on your device. No upload, no storage, no tracking.
              </p>
            </div>
            <p className="text-sm text-slate-600 mt-2">See our <a href="#conversion-guides" className="font-semibold text-blue-600 underline hover:no-underline">conversion guides below</a> for format-specific comparisons and step-by-step tips.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
              How to Convert Images for Free
          </h2>
        <p className="text-slate-600 leading-7 mb-4">
          Converting your images is incredibly simple and takes just a few seconds. Our intuitive interface makes it easy for anyone to convert files without technical knowledge.
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-slate-600 mb-6">
          <li><strong>Select Files:</strong> Drag and drop your JPG, PNG, or WebP files into the box above. You can select unlimited files at once.</li>
          <li><strong>Instant Conversion:</strong> The tool processes them instantly using your browser's power.</li>
          <li><strong>Save:</strong> Click "Download All" to save a ZIP file, or download images individually.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
          Is it Safe to Use This Tool?
        </h2>
        <p className="text-slate-600 leading-7 mb-4">
          Yes, this is one of the safest ways to convert image files online. Unlike cloud-based converters that store your files on remote servers, our tool processes everything locally in your browser. There are no data breaches to worry about, no file retention policies, and no third-party access to your images. Your original files remain untouched on your device, and converted results are generated instantly in your browser's memory before being downloaded directly to your computer.
        </p>
      </section>

<section id="conversion-guides">
  <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
              Conversion Guides
          </h2>
          <div className="space-y-2">
            <details className="group">
              <summary className="cursor-pointer font-medium text-slate-800 py-3 border-b border-slate-100 flex justify-between items-center list-none marker:content-none">
                JPG ↔ PNG — Convert with No Quality Loss
                <span className="text-slate-500 group-open:rotate-180 transition-transform duration-200">▼</span>
              </summary>
              <div className="py-4 text-slate-600 text-sm leading-relaxed">
                JPG uses lossy compression (smaller files, some quality loss). PNG uses lossless compression (larger files, perfect quality). Converting JPG to PNG preserves all image data — useful when you need to edit photos later without generational quality loss. PNG to JPG reduces file size by 50-80% with minimal visible quality difference for photographs. <strong>Tip:</strong> Use JPG for photos you share; use PNG for screenshots, logos, and images with text.
              </div>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium text-slate-800 py-3 border-b border-slate-100 flex justify-between items-center list-none marker:content-none">
                WebP — Google's Modern Format
                <span className="text-slate-500 group-open:rotate-180 transition-transform duration-200">▼</span>
              </summary>
              <div className="py-4 text-slate-600 text-sm leading-relaxed">
                WebP is Google's image format that delivers 25-35% smaller files than JPEG at the same quality — at the cost of slightly longer encode times. Convert WebP to JPG for maximum compatibility with older software, or WebP to PNG if you need transparency. Our converter handles both directions with full color profile preservation. <strong>Data:</strong> WebP lossless is 26% smaller than PNG; WebP lossy is 25-34% smaller than JPEG at equivalent SSIM scores (Google WebP study, 2023).
              </div>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium text-slate-800 py-3 border-b border-slate-100 flex justify-between items-center list-none marker:content-none">
                SVG to PNG — Vector to Pixel-Perfect Bitmap
                <span className="text-slate-500 group-open:rotate-180 transition-transform duration-200">▼</span>
              </summary>
              <div className="py-4 text-slate-600 text-sm leading-relaxed">
                SVG is a vector format — infinitely scalable, ideal for logos and icons. PNG is a raster bitmap. Our converter renders your SVG at its intrinsic resolution and captures it as a crisp PNG with full transparency support. Use SVG to PNG when you need to upload a vector logo to a site that only accepts raster images.
              </div>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium text-slate-800 py-3 border-b border-slate-100 flex justify-between items-center list-none marker:content-none">
                HEIC to JPG or PNG — iPhone Photos Made Universal
                <span className="text-slate-500 group-open:rotate-180 transition-transform duration-200">▼</span>
              </summary>
              <div className="py-4 text-slate-600 text-sm leading-relaxed">
                HEIC is Apple's default photo format since iOS 11. It produces files roughly 50% smaller than JPEG at the same quality, making it great for storage but incompatible with many platforms. Convert HEIC to JPG for maximum compatibility (works everywhere), or HEIC to PNG when you need lossless quality. All processing happens locally — your photos never leave your device.
              </div>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium text-slate-800 py-3 border-b border-slate-100 flex justify-between items-center list-none marker:content-none">
                Merge Images into a Single PDF
                <span className="text-slate-500 group-open:rotate-180 transition-transform duration-200">▼</span>
              </summary>
              <div className="py-4 text-slate-600 text-sm leading-relaxed">
                Select multiple images and choose PDF as your output format. A "Merge to PDF" button will appear — click it to combine all your images into a single PDF document. Each image becomes a separate page. Perfect for sending contracts, portfolios, or photo albums as one file. Our service does this entirely in your browser with no uploads.
              </div>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium text-slate-800 py-3 border-b border-slate-100 flex justify-between items-center list-none marker:content-none">
                JPG to PDF — Image to Document in One Click
                <span className="text-slate-500 group-open:rotate-180 transition-transform duration-200">▼</span>
              </summary>
              <div className="py-4 text-slate-600 text-sm leading-relaxed">
                Drop any JPG, PNG, or WebP image into the converter and select PDF as the output format. The image is placed onto a correctly-sized PDF page. Drag multiple files to merge them into a multi-page PDF. All processing runs in your browser — nothing is uploaded.
                </div>
              </details>
          </div>
          </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
          Why Choose Secure Converter?
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 pr-4 font-semibold text-slate-900">Feature</th>
                <th className="py-3 pr-4 font-semibold text-green-700">Secure Converter</th>
                <th className="py-3 font-semibold text-slate-500">Cloud Converters</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 text-slate-700">Your Files</td>
                <td className="py-3 pr-4 text-green-700">Stay on your device</td>
                <td className="py-3 text-slate-500">Uploaded to remote servers</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 text-slate-700">Privacy</td>
                <td className="py-3 pr-4 text-green-700">100% private, no tracking</td>
                <td className="py-3 text-slate-500">Data retention &amp; analytics</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 text-slate-700">File Size Limit</td>
                <td className="py-3 pr-4 text-green-700">50MB per file</td>
                <td className="py-3 text-slate-500">10-25MB typical</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 text-slate-700">Batch Processing</td>
                <td className="py-3 pr-4 text-green-700">Unlimited, parallel</td>
                <td className="py-3 text-slate-500">Limited or paid</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-4 text-slate-700">Cost</td>
                <td className="py-3 pr-4 text-green-700">Free &amp; open source</td>
                <td className="py-3 text-slate-500">Ads, freemium, or paid plans</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-700">Formats</td>
                <td className="py-3 pr-4 text-green-700">JPG, PNG, WebP, SVG, HEIC, PDF</td>
                <td className="py-3 text-slate-500">Varies, often limited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">
          Ready to convert?
        </h2>
        <p className="text-slate-600 leading-7 mb-4">
          Drag and drop your files above. No signup, no uploads, no limits. Just fast, private conversion right in your browser — your images never leave your device.
        </p>
      </section>

    </article>
  )
}
