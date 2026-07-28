import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders the copyright notice', () => {
    render(<Footer />)
    expect(screen.getByText(/2026 Secure Converter/)).toBeInTheDocument()
  })

  it('renders the privacy message', () => {
    render(<Footer />)
    expect(screen.getByText(/files never leave your device/i)).toBeInTheDocument()
  })

  it('renders Github link', () => {
    render(<Footer />)
    expect(screen.getByText('Github')).toBeInTheDocument()
  })
})
