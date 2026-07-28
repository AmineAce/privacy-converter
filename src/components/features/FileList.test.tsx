import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileList } from './FileList'
import type { ImageJob } from '@/core/types/core'

const mockStartConversion = vi.fn()
const mockClearFiles = vi.fn()
const mockMergeToPdf = vi.fn()

function createMockFileSet(files: Partial<ImageJob>[] = []) {
  const defaultFiles: ImageJob[] = files.map((f, i) => ({
    id: f.id ?? `file-${i}`,
    originalFile: new File([''], f.originalFile?.name ?? `pic-${i}.png`, {
      type: f.originalFile?.type ?? 'image/png',
    }),
    originalPreview: f.originalPreview ?? '',
    status: f.status ?? ('idle' as const),
    result: f.result ?? null,
  }))

  return {
    files: defaultFiles,
    isProcessing: false,
    outputFormat: 'image/png' as const,
    totalProgress: 0,
    startConversion: mockStartConversion,
    clearFiles: mockClearFiles,
    mergeToPdf: mockMergeToPdf,
  }
}

let mockFileState = createMockFileSet()

vi.mock('@/core/store/useFileStore', () => ({
  useFileStore: (selector: unknown) => {
    const state = mockFileState
    return typeof selector === 'function'
      ? (selector as (s: typeof state) => unknown)(state)
      : state
  },
}))

// stub Audio for jsdom
vi.stubGlobal('Audio', vi.fn(function () {
  return { play: vi.fn(() => Promise.resolve()) }
}))

describe('FileList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFileState = createMockFileSet()
  })

  it('renders nothing when file list is empty', () => {
    const { container } = render(<FileList />)
    expect(container.innerHTML).toBe('')
  })

  it('shows file count', () => {
    mockFileState = createMockFileSet([
      { id: '1' },
      { id: '2' },
    ])
    render(<FileList />)
    expect(screen.getByText('2 Images Uploaded')).toBeDefined()
  })

  it('shows Convert button enabled when outputFormat is set', () => {
    mockFileState = createMockFileSet([{ id: '1' }])
    render(<FileList />)
    const btn = screen.getByText('Convert')
    expect(btn).toBeDefined()
    expect((btn as HTMLButtonElement).disabled).toBe(false)
  })

  it('calls startConversion on Convert click', () => {
    mockFileState = createMockFileSet([{ id: '1' }])
    render(<FileList />)
    fireEvent.click(screen.getByText('Convert'))
    expect(mockStartConversion).toHaveBeenCalledTimes(1)
  })

  it('disables Convert button when isProcessing', () => {
    mockFileState = {
      ...createMockFileSet([{ id: '1' }]),
      isProcessing: true,
    }
    render(<FileList />)
    const btn = screen.getByText('Converting...') as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('shows Clear All button and toggles to Confirm Clear on click', () => {
    mockFileState = createMockFileSet([{ id: '1' }])
    render(<FileList />)
    expect(screen.getByText('Clear All')).toBeDefined()
    fireEvent.click(screen.getByText('Clear All'))
    expect(screen.getByText('Confirm Clear?')).toBeDefined()
  })

  it('calls clearFiles after confirming clear', () => {
    mockFileState = createMockFileSet([{ id: '1' }])
    render(<FileList />)
    fireEvent.click(screen.getByText('Clear All'))
    fireEvent.click(screen.getByText('Confirm Clear?'))
    expect(mockClearFiles).toHaveBeenCalledTimes(1)
  })

  it('shows Merge to PDF button when outputFormat is PDF and files > 1', () => {
    mockFileState = {
      ...createMockFileSet([{ id: '1' }, { id: '2' }]),
      outputFormat: 'application/pdf' as const,
    }
    render(<FileList />)
    expect(screen.getByText('Merge to One PDF')).toBeDefined()
  })

  it('calls mergeToPdf on Merge button click', () => {
    mockFileState = {
      ...createMockFileSet([{ id: '1' }, { id: '2' }]),
      outputFormat: 'application/pdf' as const,
    }
    render(<FileList />)
    fireEvent.click(screen.getByText('Merge to One PDF'))
    expect(mockMergeToPdf).toHaveBeenCalledTimes(1)
  })

  it('shows progress bar during processing', () => {
    mockFileState = {
      ...createMockFileSet([{ id: '1' }]),
      isProcessing: true,
      totalProgress: 50,
    }
    render(<FileList />)
    const progressBar = document.querySelector('.bg-black.h-1')
    expect(progressBar).not.toBeNull()
  })

  it('shows "Show all N files" when more than 10 files', () => {
    const manyFiles = Array.from({ length: 15 }, (_, i) => ({ id: `f${i}` }))
    mockFileState = createMockFileSet(manyFiles)
    render(<FileList />)
    expect(screen.getByText('Show all 15 files')).toBeDefined()
  })
})
