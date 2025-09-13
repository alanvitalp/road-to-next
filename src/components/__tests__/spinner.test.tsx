import { render, screen } from '@testing-library/react'
import { Spinner } from '../spinner'

describe('Spinner', () => {
  it('renders without crashing', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
  })

  it('displays the loading icon', () => {
    render(<Spinner />)
    const icon = screen.getByRole('status', { hidden: true }).querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('has the correct CSS classes for centering', () => {
    render(<Spinner />)
    const container = screen.getByRole('status', { hidden: true })
    
    expect(container).toHaveClass('flex-1')
    expect(container).toHaveClass('flex')
    expect(container).toHaveClass('flex-col')
    expect(container).toHaveClass('items-center')
    expect(container).toHaveClass('justify-center')
    expect(container).toHaveClass('self-center')
  })

  it('applies animation to the icon', () => {
    render(<Spinner />)
    const icon = screen.getByRole('status', { hidden: true }).querySelector('svg')
    expect(icon).toHaveClass('animate-spin')
  })

  it('has correct icon dimensions', () => {
    render(<Spinner />)
    const icon = screen.getByRole('status', { hidden: true }).querySelector('svg')
    expect(icon).toHaveClass('h-16')
    expect(icon).toHaveClass('w-16')
  })

  it('is accessible with proper ARIA attributes', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status', { hidden: true })
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
  })
})
