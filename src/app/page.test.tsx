import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home (KOMONO top)', () => {
  it('renders KOMONO heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('KOMONO')
  })

  it('links to omikuji', () => {
    render(<Home />)
    expect(screen.getByRole('link', { name: /おみくじ/ })).toHaveAttribute('href', '/omikuji')
  })
})
