import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

// Inline small CSS chunks into HTML to eliminate render-blocking requests.
function inlineCssPlugin(): Plugin {
  return {
    name: 'inline-css',
    closeBundle() {
      const htmlPath = path.resolve('dist/index.html')
      if (!fs.existsSync(htmlPath)) return
      let html = fs.readFileSync(htmlPath, 'utf-8')
      html = html.replace(
        /<link rel="stylesheet" crossorigin[^>]*href="([^"]+)"[^>]*>/g,
        (match, href: string) => {
          const cssPath = path.resolve('dist', href.replace(/^\//, ''))
          try {
            const css = fs.readFileSync(cssPath, 'utf-8')
            return `<style>${css}</style>`
          } catch {
            return match
          }
        }
      )
      fs.writeFileSync(htmlPath, html, 'utf-8')
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: false,
      chunkSizeWarningLimit: 3000
  },
  plugins: [
    react(),
    inlineCssPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  }
})
