import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import ClearFiltersButton from '../../components/ui/ClearFiltersButton'

const Search = () => <span data-testid="search">{useLocation().search}</span>

const setup = (active, url = '/dashboard/inventory?selected=EQ-001&q=gps') => {
  const onClear = vi.fn()
  render(
    <MemoryRouter initialEntries={[url]}>
      <ClearFiltersButton active={active} onClear={onClear} />
      <Search />
    </MemoryRouter>
  )
  return { onClear, button: screen.getByRole('button', { name: /limpiar filtros/i }) }
}

describe('ClearFiltersButton', () => {
  it('resetea los filtros de la página y limpia la query de la URL', () => {
    const { onClear, button } = setup(true)
    fireEvent.click(button)
    expect(onClear).toHaveBeenCalledOnce()
    expect(screen.getByTestId('search').textContent).toBe('')
  })

  it('deshabilitado cuando no hay filtros activos', () => {
    const { onClear, button } = setup(false)
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onClear).not.toHaveBeenCalled()
  })
})
