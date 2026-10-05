import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Omikuji page', () => {
  it('renders heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('おみくじ')
  })
})