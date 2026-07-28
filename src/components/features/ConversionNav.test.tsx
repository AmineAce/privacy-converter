import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConversionNav } from './ConversionNav'

describe('ConversionNav', () => {
  it('renders all conversion mode buttons', () => {
    render(<ConversionNav />)
    expect(screen.getByText('JPG to PNG')).toBeInTheDocument()
    expect(screen.getByText('PNG to JPG')).toBeInTheDocument()
    expect(screen.getByText('WebP to JPG')).toBeInTheDocument()
    expect(screen.getByText('JPG to WebP')).toBeInTheDocument()
    expect(screen.getByText('PNG to WebP')).toBeInTheDocument()
    expect(screen.getByText('SVG to PNG')).toBeInTheDocument()
    expect(screen.getByText('SVG to JPG')).toBeInTheDocument()
    expect(screen.getByText('HEIC to JPG')).toBeInTheDocument()
    expect(screen.getByText('HEIC to PNG')).toBeInTheDocument()
    expect(screen.getByText('JPG to PDF')).toBeInTheDocument()
    expect(screen.getByText('PNG to PDF')).toBeInTheDocument()
    expect(screen.getByText('WebP to PDF')).toBeInTheDocument()
  })
})
