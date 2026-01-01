import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders button with text content', () => {
    render(<Button>Test Button</Button>)
    expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument()
  })
})
