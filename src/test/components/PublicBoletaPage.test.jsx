import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

vi.mock('../../lib/supabase', () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() },
}))

import { supabase } from '../../lib/supabase'
import { PublicBoletaPage } from '../../pages/PublicBoletaPage'

const TOKEN = '3f2b8c1e-9a4d-4e6f-b1c2-7d8e9f0a1b2c'

const renderAt = (token = TOKEN) => render(
  <MemoryRouter initialEntries={[`/p/boleta/${token}`]}>
    <Routes><Route path="/p/boleta/:token" element={<PublicBoletaPage />} /></Routes>
  </MemoryRouter>
)

// ponytail: la garantía real es SQL (fn_boleta_publica, token uuid). Esto evita que la
// vista pública vuelva a leer ventas directo con la anon key.
describe('PublicBoletaPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('carga la boleta solo vía RPC por token', async () => {
    supabase.rpc.mockResolvedValue({
      data: {
        venta: {
          id: 7, token: TOKEN, fecha: '2026-11-21', total: 100,
          cliente: 'John Doe', cliente_direccion: 'Av. Larco 123',
          venta_items: [{ id: 'a', cantidad: 1, precio_unitario: 100, subtotal: 100, equipos: { nombre: 'Nivel', tipo: 'NIVEL' } }],
        },
        config: { lugar_emision: 'Lima, Perú', igv_pct: '18' },
      },
      error: null,
    })

    renderAt()

    expect(await screen.findByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Av. Larco 123')).toBeInTheDocument()
    expect(screen.getByText('21/11/2026')).toBeInTheDocument()     // DATE sin corrimiento UTC
    expect(screen.getByText(/CIENTO DIECIOCHO CON 00\/100 SOLES/)).toBeInTheDocument()
    expect(supabase.rpc).toHaveBeenCalledWith('fn_boleta_publica', { p_token: TOKEN })
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('token inexistente o mal formado → no encontrado', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { code: '22P02', message: 'invalid input syntax for type uuid' } })
    renderAt('123')
    expect(await screen.findByText('Comprobante no encontrado')).toBeInTheDocument()
  })
})
