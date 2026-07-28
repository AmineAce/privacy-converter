import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockHeicTo = vi.fn()
vi.mock('heic-to', () => ({
  heicTo: mockHeicTo,
}))

// Import after mock so the dynamic import inside the service picks up the mock
const heicService = await import('./heicService')

describe('heicService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('processHeicFile', () => {
    it('throws for non-HEIC file', async () => {
      const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })
      await expect(heicService.processHeicFile(file, 'image/png')).rejects.toThrow(
        'File is not HEIC format',
      )
      expect(mockHeicTo).not.toHaveBeenCalled()
    })

    it('accepts .heic extension', async () => {
      const file = new File([''], 'photo.heic', { type: 'image/heic' })
      mockHeicTo.mockResolvedValue(new Blob())
      const result = await heicService.processHeicFile(file, 'image/png')
      expect(result).toBeInstanceOf(Blob)
      expect(mockHeicTo).toHaveBeenCalledWith({
        blob: file,
        type: 'image/png',
        quality: 0.85,
      })
    })

    it('accepts .heif extension', async () => {
      const file = new File([''], 'photo.heif', { type: 'image/heic' })
      mockHeicTo.mockResolvedValue(new Blob())
      const result = await heicService.processHeicFile(file, 'image/jpeg')
      expect(result).toBeInstanceOf(Blob)
    })

    it('passes the correct output format', async () => {
      const file = new File([''], 'photo.heic', { type: 'image/heic' })
      mockHeicTo.mockResolvedValue(new Blob())
      await heicService.processHeicFile(file, 'image/webp')
      expect(mockHeicTo).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'image/webp' }),
      )
    })

    it('re-throws heic-to errors', async () => {
      const file = new File([''], 'photo.heic', { type: 'image/heic' })
      mockHeicTo.mockRejectedValue(new Error('corrupt file'))
      await expect(heicService.processHeicFile(file, 'image/png')).rejects.toThrow(
        'HEIC conversion failed',
      )
    })
  })

  describe('preloadHeicTo', () => {
    it('loads the module without error', async () => {
      await expect(heicService.preloadHeicTo()).resolves.toBeUndefined()
    })
  })
})
