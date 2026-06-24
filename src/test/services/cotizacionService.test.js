import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeQuery } from '../_helpers/mockSupabase'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

import { supabase } from '../../lib/supabase'
import { cotizacionService } from '../../lib/services/cotizacionService'

describe('cotizacionService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('fetchCotizaciones', () => {
    it('devuelve { data, total } con count', async () => {
      const rows = [{ id: 1, estado: 'borrador' }]
      supabase.from.mockReturnValue(makeQuery({ data: rows, error: null, count: 1 }))
      const result = await cotizacionService.fetchCotizaciones()
      expect(result).toEqual({ data: rows, total: 1 })
    })

    it('filtra por estado cuando se da', async () => {
      const q = makeQuery({ data: [], error: null, count: 0 })
      supabase.from.mockReturnValue(q)
      await cotizacionService.fetchCotizaciones({ estado: 'aceptada' })
      expect(q.eq).toHaveBeenCalledWith('estado', 'aceptada')
    })

    it('lanza con mensaje cuando hay error', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'fail' } }))
      await expect(cotizacionService.fetchCotizaciones()).rejects.toThrow('fail')
    })
  })

  describe('getCotizacionById', () => {
    it('devuelve la cotización completa', async () => {
      const cot = { id: 5, total: 100 }
      supabase.from.mockReturnValue(makeQuery({ data: cot, error: null }))
      expect(await cotizacionService.getCotizacionById(5)).toEqual(cot)
    })

    it('lanza si no existe', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'not found' } }))
      await expect(cotizacionService.getCotizacionById(99)).rejects.toThrow('not found')
    })
  })

  describe('crearCotizacion (RPC fn_registrar_cotizacion)', () => {
    it('llama al RPC y re-fetchea', async () => {
      supabase.rpc.mockResolvedValue({ data: 42, error: null })
      supabase.from.mockReturnValue(makeQuery({
        data: { id: 42, total: 500, estado: 'borrador' },
        error: null,
      }))

      const result = await cotizacionService.crearCotizacion({
        cotizacion: { cliente_id: 'c1', usuario_id: 'u1', notas: 'hola' },
        items: [{ equipo_id: 'e1', cantidad: 2, precio_unitario: 250 }],
      })

      expect(supabase.rpc).toHaveBeenCalledWith('fn_registrar_cotizacion', {
        p_cotizacion: expect.objectContaining({
          cliente_id: 'c1',
          usuario_id: 'u1',
          notas: 'hola',
        }),
        p_items: [{ equipo_id: 'e1', cantidad: 2, precio_unitario: 250 }],
      })
      expect(result).toEqual({ id: 42, total: 500, estado: 'borrador' })
    })

    it('lanza si el RPC falla', async () => {
      supabase.rpc.mockResolvedValue({ data: null, error: { message: 'sin items' } })
      await expect(cotizacionService.crearCotizacion({
        cotizacion: {},
        items: [],
      })).rejects.toThrow('sin items')
    })
  })

  describe('actualizarEstado', () => {
    it('actualiza con estado válido', async () => {
      const q = makeQuery({ data: { id: 1, estado: 'enviada' }, error: null })
      supabase.from.mockReturnValue(q)
      await cotizacionService.actualizarEstado(1, 'enviada')
      expect(q.update).toHaveBeenCalledWith(expect.objectContaining({ estado: 'enviada' }))
    })

    it('rechaza estado inválido sin tocar BD', async () => {
      await expect(cotizacionService.actualizarEstado(1, 'invalido'))
        .rejects.toThrow(/Estado inválido/i)
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('no permite setear "convertida" desde aquí (solo el RPC)', async () => {
      await expect(cotizacionService.actualizarEstado(1, 'convertida'))
        .rejects.toThrow(/Estado inválido/i)
    })
  })

  describe('actualizarNotas', () => {
    it('actualiza notas y devuelve la fila', async () => {
      const q = makeQuery({ data: { id: 5, notas: 'nuevo' }, error: null })
      supabase.from.mockReturnValue(q)
      const result = await cotizacionService.actualizarNotas(5, 'nuevo')
      expect(q.update).toHaveBeenCalledWith(expect.objectContaining({ notas: 'nuevo' }))
      expect(result.notas).toBe('nuevo')
    })

    it('manda null si notas viene vacío', async () => {
      const q = makeQuery({ data: { id: 5, notas: null }, error: null })
      supabase.from.mockReturnValue(q)
      await cotizacionService.actualizarNotas(5, '')
      expect(q.update).toHaveBeenCalledWith(expect.objectContaining({ notas: null }))
    })
  })

  describe('convertirAVenta', () => {
    it('llama al RPC con cotizacion_id + almacen_id, devuelve venta_id', async () => {
      supabase.rpc.mockResolvedValue({ data: 77, error: null })
      const ventaId = await cotizacionService.convertirAVenta(5, 'alm-1')
      expect(supabase.rpc).toHaveBeenCalledWith('fn_convertir_cotizacion_a_venta', {
        p_cotizacion_id: 5,
        p_almacen_id: 'alm-1',
      })
      expect(ventaId).toBe(77)
    })

    it('exige almacenId', async () => {
      await expect(cotizacionService.convertirAVenta(5, null))
        .rejects.toThrow(/almacén/i)
      expect(supabase.rpc).not.toHaveBeenCalled()
    })

    it('lanza si el RPC falla', async () => {
      supabase.rpc.mockResolvedValue({ data: null, error: { message: 'stock insuficiente' } })
      await expect(cotizacionService.convertirAVenta(5, 'alm-1'))
        .rejects.toThrow('stock insuficiente')
    })
  })

  describe('eliminarCotizacion', () => {
    it('borra por id', async () => {
      const q = makeQuery({ data: null, error: null })
      supabase.from.mockReturnValue(q)
      await cotizacionService.eliminarCotizacion(7)
      expect(q.delete).toHaveBeenCalled()
      expect(q.eq).toHaveBeenCalledWith('id', 7)
    })

    it('lanza con mensaje', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'fk' } }))
      await expect(cotizacionService.eliminarCotizacion(7)).rejects.toThrow('fk')
    })
  })
})
