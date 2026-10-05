import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home (KOMONO top)', () => {
  it('renders wordmark and tool list heading', () => {
    render(<Home />)
    expect(screen.getAllByText('KOMONO').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ツール一覧')
  })

  it('links to omikuji', () => {
    render(<Home />)
    expect(screen.getByRole('link', { name: /おみくじ/ })).toHaveAttribute('href', '/omikuji')
  })
})
