import { describe, it, expect, beforeEach, vi } from 'vitest'

// --- jsPDF mock ---
const mockAddImage = vi.fn()
const mockAddPage = vi.fn()
const mockOutput = vi.fn(() => new Blob(['pdf-data'], { type: 'application/pdf' }))
const mockGetWidth = vi.fn(() => 210) // A4 width in mm
const mockGetHeight = vi.fn(() => 297) // A4 height in mm

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(function () {
    return {
      internal: {
        pageSize: {
          getWidth: mockGetWidth,
          getHeight: mockGetHeight,
        },
      },
      addImage: mockAddImage,
      addPage: mockAddPage,
      output: mockOutput,
    }
  }),
}))

// --- Browser API stubs ---
vi.stubGlobal('createImageBitmap', vi.fn(() =>
  Promise.resolve({ width: 800, height: 600 }),
))

const pdfService = await import('./pdfService')

describe('pdfService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOutput.mockReturnValue(new Blob(['pdf-data'], { type: 'application/pdf' }))
  })

  describe('convertToPdf', () => {
    it('returns a Blob', async () => {
      const file = new File([''], 'photo.png', { type: 'image/png' })
      const result = await pdfService.convertToPdf(file)
      expect(result).toBeInstanceOf(Blob)
    })

    it('creates a jsPDF with portrait orientation for tall images', async () => {
      const { jsPDF } = await import('jspdf')
      vi.mocked(createImageBitmap).mockResolvedValueOnce({ width: 600, height: 800 } as ImageBitmap)
      const file = new File([''], 'photo.png', { type: 'image/png' })
      await pdfService.convertToPdf(file)
      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
    })

    it('creates a jsPDF with landscape orientation for wide images', async () => {
      const { jsPDF } = await import('jspdf')
      vi.mocked(createImageBitmap).mockResolvedValueOnce({ width: 800, height: 600 } as ImageBitmap)
      const file = new File([''], 'photo.png', { type: 'image/png' })
      await pdfService.convertToPdf(file)
      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })
    })

    it('adds the image to the document', async () => {
      const file = new File([''], 'photo.png', { type: 'image/png' })
      await pdfService.convertToPdf(file)
      expect(mockAddImage).toHaveBeenCalledTimes(1)
    })

    it('outputs as blob', async () => {
      const file = new File([''], 'photo.png', { type: 'image/png' })
      await pdfService.convertToPdf(file)
      expect(mockOutput).toHaveBeenCalledWith('blob')
    })
  })

  describe('mergeImagesToPdf', () => {
    it('throws for empty file list', async () => {
      await expect(pdfService.mergeImagesToPdf([])).rejects.toThrow(
        'No files provided for PDF merging',
      )
    })

    it('creates a single-page PDF for one file', async () => {
      const files = [new File([''], 'a.png', { type: 'image/png' })]
      await pdfService.mergeImagesToPdf(files)
      expect(mockAddPage).not.toHaveBeenCalled()
      expect(mockAddImage).toHaveBeenCalledTimes(1)
    })

    it('adds pages for subsequent files', async () => {
      const files = [
        new File([''], 'a.png', { type: 'image/png' }),
        new File([''], 'b.jpg', { type: 'image/jpeg' }),
      ]
      await pdfService.mergeImagesToPdf(files)
      // First image uses the initial page, second triggers addPage
      expect(mockAddPage).toHaveBeenCalledTimes(1)
      expect(mockAddImage).toHaveBeenCalledTimes(2)
    })
  })
})
