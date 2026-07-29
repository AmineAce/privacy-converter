import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ShareModal } from './ShareModal'

describe('ShareModal', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ShareModal isOpen={false} onClose={onClose} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders content when isOpen is true', () => {
    render(<ShareModal isOpen={true} onClose={onClose} />)
    expect(screen.getByText('Share Secure Converter')).toBeDefined()
    expect(screen.getByText('Post on X')).toBeDefined()
    expect(screen.getByText('Share via WhatsApp')).toBeDefined()
    expect(screen.getByText('Copy Link')).toBeDefined()
  })

  it('calls onClose when clicking backdrop', () => {
    render(<ShareModal isOpen={true} onClose={onClose} />)
    const backdrop = screen.getByText('Share Secure Converter').closest('.fixed.inset-0')!
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when clicking modal content', () => {
    render(<ShareModal isOpen={true} onClose={onClose} />)
    const modalContent = screen.getByText('Share Secure Converter').closest('.bg-white')!
    fireEvent.click(modalContent)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when clicking X button', () => {
    render(<ShareModal isOpen={true} onClose={onClose} />)
    // The X button doesn't have visible text, find by role
    const closeBtn = screen.getByRole('button', { name: '' })
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('opens X share URL on Post on X click', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<ShareModal isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('Post on X'))
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'noopener,noreferrer',
    )
    openSpy.mockRestore()
  })

  it('opens WhatsApp share URL on Share via WhatsApp click', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<ShareModal isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('Share via WhatsApp'))
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'),
      '_blank',
      'noopener,noreferrer',
    )
    openSpy.mockRestore()
  })

  it('copies link to clipboard on Copy Link click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<ShareModal isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('Copy Link'))
    expect(writeText).toHaveBeenCalledWith('https://secure-converter-s.vercel.app/')
  })

  it('shows "Copied!" after copying link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<ShareModal isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('Copy Link'))
    await screen.findByText('Copied!')
  })
})
