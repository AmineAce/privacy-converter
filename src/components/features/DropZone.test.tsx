import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DropZone } from './DropZone'

// react-dropzone calls createObjectUrl internally
vi.stubGlobal('URL.createObjectURL', vi.fn(() => 'blob:mock'))

const mockAddFiles = vi.fn()
const mockSetSuggestedModes = vi.fn()
const mockShowToast = vi.fn()

vi.mock('@/core/store/useFileStore', () => ({
  useFileStore: (selector: unknown) => {
    const state = {
      files: [],
      addFiles: mockAddFiles,
      setSuggestedModes: mockSetSuggestedModes,
    }
    return typeof selector === 'function'
      ? (selector as (s: typeof state) => unknown)(state)
      : state
  },
}))

vi.mock('@/core/store/useToastStore', () => ({
  useToastStore: () => ({
    showToast: mockShowToast,
  }),
}))

// heicService preload is fire-and-forget, just silence the dynamic import
vi.mock('@/core/services/heicService', () => ({
  preloadHeicTo: vi.fn(() => Promise.resolve()),
}))

describe('DropZone', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the drop zone with instructions', () => {
    render(<DropZone />)
    expect(screen.getByText('Drag & drop images here')).toBeDefined()
    expect(screen.getByLabelText('Upload images')).toBeDefined()
  })

  it('applies custom className', () => {
    const { container } = render(<DropZone className="custom-class" />)
    const zone = container.firstChild as HTMLElement
    expect(zone.className).toContain('custom-class')
  })
})
