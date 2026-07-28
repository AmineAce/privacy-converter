import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Hello World</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders fallback UI when a child throws', () => {
    const Bomb = () => {
      throw new Error('💥')
    }

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('💥')).toBeInTheDocument()
    expect(screen.getByText('Reload page')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const Bomb = () => {
      throw new Error('kaboom')
    }

    render(
      <ErrorBoundary fallback={<div>Custom Error UI</div>}>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument()
  })
})
