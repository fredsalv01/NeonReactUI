import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { makeQuery } from '../_helpers/mockSupabase'

vi.mock('../../lib/supabase', () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() },
}))

import { supabase } from '../../lib/supabase'
import { PublicEquipoPage } from '../../pages/PublicEquipoPage'

// ponytail: la garantía real está en SQL (fn_equipo_publico + REVOKE a anon).
// Esto solo evita que alguien vuelva a leer la vista de stock desde la ficha pública.
describe('PublicEquipoPage', () => {
  it('usa la RPC pública y no muestra stock aunque llegue en la respuesta', async () => {
    supabase.rpc.mockReturnValue(makeQuery({
      data: { id: 'EQ-001', nombre: 'Estación Total', tipo: 'Topografía', imagen_url: null, stock_total: 99 },
      error: null,
    }))

    render(
      <MemoryRouter initialEntries={['/p/equipo/EQ-001']}>
        <Routes><Route path="/p/equipo/:id" element={<PublicEquipoPage />} /></Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Estación Total')).toBeInTheDocument()
    expect(supabase.rpc).toHaveBeenCalledWith('fn_equipo_publico', { p_id: 'EQ-001' })
    expect(supabase.from).not.toHaveBeenCalled()
    expect(screen.queryByText(/stock disponible|unid|almac/i)).toBeNull()
    expect(screen.queryByText('99')).toBeNull()
  })
})
