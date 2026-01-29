# Secure Converter

The privacy-first, client-side file manipulation tool.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React + Vite](https://img.shields.io/badge/React%20%2B%20Vite-18.2.0%20%2B%204.3.9-blue.svg)](https://reactjs.org/)
[![Privacy: 100%](https://img.shields.io/badge/Privacy-100%25-green.svg)](https://github.com/AmineAce/privacy-converter)

[View Live Demo](https://secure-jpg-to-png.pages.dev)

![App Screenshot](./public/og-image.png)

## Why

Modern file converters are privacy nightmares - they're bloated with ads, trackers, and upload your files to remote servers for processing, compromising your privacy and security. This tool was built to solve that problem by running 100% in your browser using WebAssembly and Canvas technology. Your files never leave your device, ensuring complete privacy and security.

## Features

- ✅ **Universal Conversion**: Support for JPG, PNG, WebP, SVG, and HEIC (iPhone).
- ✅ **PDF Tools**: Convert images to PDF and Merge multiple images into a single PDF document.
- ✅ **Zero Limits**: No file size limits (process 1GB+ files locally).
- ✅ **Batch Engine**: Parallel processing for unlimited files.
- ✅ **Progress Tracking**: Real-time progress bar shows conversion status for batch operations.
- ✅ **Web Worker Architecture**: Background processing keeps UI responsive during conversions.
- ✅ **Concurrent Processing**: Smart pool-based system processes up to 5 files simultaneously.
- ✅ **Memory Management**: Aggressive cleanup prevents RAM bloat during batch processing.
- ✅ **Strict Privacy**: No data collection, no server storage.

## ⚡ 100/100 Performance

![Perfect Lighthouse Score](./public/lighthouse-score.png)

Secure Converter is optimized for speed. By running entirely client-side and using lazy-loading for heavy modules (HEIC/PDF), we achieve perfect Lighthouse scores across Performance, Accessibility, Best Practices, and SEO.

### Performance Features

- **Web Worker Processing**: Image conversions run in background threads, keeping the UI responsive
- **Concurrent Pool**: Up to 5 files processed simultaneously for optimal throughput
- **Memory Management**: Explicit ImageBitmap cleanup and object reference clearing prevent memory leaks
- **Progress Visualization**: Real-time progress bar provides immediate feedback during batch operations
- **Smart Routing**: PDF and HEIC files use specialized services, while standard images use optimized Web Workers

## Tech Stack

- **Frontend**: React + TypeScript + Vite 6
- **State**: Zustand (with atomic selectors)
- **Engine**: HTML5 Canvas + jspdf + heic-to (lazy loaded)
- **Workers**: Web Worker architecture for background processing
- **Styling**: Tailwind CSS

## Architecture

### Web Worker Architecture
The application uses a sophisticated Web Worker system for optimal performance:
- **Main Thread**: Handles UI, PDF merging, and HEIC conversions (which require specialized libraries)
- **Background Workers**: Process standard image conversions (JPG, PNG, WebP) in parallel
- **Memory Management**: Explicit cleanup of ImageBitmap objects and object references

### Concurrency Pool
- **Pool Size**: Configurable concurrent processing (default: 5 simultaneous conversions)
- **Dynamic Scheduling**: Empty slots are immediately filled as files complete
- **Queue Management**: FIFO processing ensures fair resource allocation
- **Error Handling**: Failed conversions don't block the entire queue

### Memory Management
- **ImageBitmap Cleanup**: Explicit `.close()` calls release GPU/RAM memory immediately
- **Reference Clearing**: Local variables are nullified after use to assist garbage collection
- **Transferable Objects**: Blobs are transferred (not copied) to main thread via postMessage
- **Error Safety**: Memory cleanup occurs in both success and error scenarios

## Running Locally

```bash
git clone https://github.com/AmineAce/privacy-converter.git
cd privacy-converter
npm install
npm run dev
