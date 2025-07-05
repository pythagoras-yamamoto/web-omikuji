import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home', () => {
  it('renders heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Web Omikuji')
  })
})