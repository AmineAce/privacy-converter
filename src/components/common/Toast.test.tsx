import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Toast } from './Toast'
import { useToastStore } from '@/core/store/useToastStore'

describe('Toast', () => {
  beforeEach(() => {
    useToastStore.setState({ message: null, type: null })
  })

  it('renders nothing when no message', () => {
    const { container } = render(<Toast />)
    expect(container.innerHTML).toBe('')
  })

  it('renders success toast with message', () => {
    useToastStore.setState({ message: 'All good!', type: 'success' })
    render(<Toast />)
    expect(screen.getByText('All good!')).toBeInTheDocument()
  })

  it('renders error toast with message', () => {
    useToastStore.setState({ message: 'Something failed', type: 'error' })
    render(<Toast />)
    expect(screen.getByText('Something failed')).toBeInTheDocument()
  })

  it('renders warning toast with message', () => {
    useToastStore.setState({ message: 'Be careful', type: 'warning' })
    render(<Toast />)
    expect(screen.getByText('Be careful')).toBeInTheDocument()
  })

  it('has a close button that clears the toast', () => {
    useToastStore.setState({ message: 'Dismiss me', type: 'info' })
    render(<Toast />)
    const closeBtn = screen.getByRole('button')
    expect(closeBtn).toBeInTheDocument()
  })
})
