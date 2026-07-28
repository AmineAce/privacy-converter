import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

describe('Header', () => {
  it('renders the app name', () => {
    render(<Header />)
    expect(screen.getByText('Secure Converter')).toBeInTheDocument()
  })

  it('renders feedback and share buttons', () => {
    render(<Header />)
    expect(screen.getByText('Feedback')).toBeInTheDocument()
    expect(screen.getByText('Share')).toBeInTheDocument()
  })
})
