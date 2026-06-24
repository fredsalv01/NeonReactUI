import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeQuery } from '../_helpers/mockSupabase'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

import { supabase } from '../../lib/supabase'
import { ventaService } from '../../lib/services/ventaService'

describe('ventaService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('mapeo BD → UI', () => {
    it('renombra precio_venta → precio_unitario y total → monto_total', async () => {
      const row = {
        id: 1,
        precio_venta: 100,
        total: 200,
        vendido_por: 'u1',
        notas: 'hola',
        equipos: { nombre: 'GPS' },
      }
      supabase.from.mockReturnValue(makeQuery({ data: [row], error: null }))

      const [mapped] = await ventaService.getVentas()
      expect(mapped.precio_unitario).toBe(100)
      expect(mapped.monto_total).toBe(200)
      expect(mapped.usuario_id).toBe('u1')
      expect(mapped.descripcion).toBe('hola')
    })

    it('getVentas devuelve [] cuando data es null', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: null }))
      expect(await ventaService.getVentas()).toEqual([])
    })

    it('getVentas lanza cuando hay error', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'fail' } }))
      await expect(ventaService.getVentas()).rejects.toBeTruthy()
    })
  })

  describe('getVentaById', () => {
    it('devuelve la venta encontrada con mapeo', async () => {
      supabase.from.mockReturnValue(makeQuery({
        data: { id: 5, total: 99, precio_venta: 33 },
        error: null,
      }))
      const result = await ventaService.getVentaById(5)
      expect(result.monto_total).toBe(99)
      expect(result.precio_unitario).toBe(33)
    })

    it('devuelve null cuando data es null', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: null }))
      expect(await ventaService.getVentaById(99)).toBeNull()
    })
  })

  describe('addVenta (RPC fn_registrar_venta)', () => {
    it('llama al RPC con payload normalizado y re-fetchea', async () => {
      supabase.rpc.mockResolvedValue({ data: 77, error: null })
      supabase.from.mockReturnValue(makeQuery({
        data: { id: 77, total: 500, precio_venta: 250 },
        error: null,
      }))

      const result = await ventaService.addVenta({
        venta: { cliente_id: 'c1', almacen_id: 'a1', usuario_id: 'u1', descripcion: 'nota' },
        items: [{ equipo_id: 'e1', cantidad: 2, precio_unitario: 250 }],
      })

      expect(supabase.rpc).toHaveBeenCalledWith('fn_registrar_venta', {
        p_venta: expect.objectContaining({
          cliente_id: 'c1',
          almacen_id: 'a1',
          vendido_por: 'u1',
          notas: 'nota',
        }),
        p_items: [{ equipo_id: 'e1', cantidad: 2, precio_unitario: 250 }],
      })
      expect(result.monto_total).toBe(500)
    })

    it('lanza si el RPC falla', async () => {
      supabase.rpc.mockResolvedValue({ data: null, error: { message: 'stock insuficiente' } })
      await expect(ventaService.addVenta({
        venta: {},
        items: [{ equipo_id: 'e1', cantidad: 1, precio_unitario: 1 }],
      })).rejects.toBeTruthy()
    })
  })

  describe('updateVenta', () => {
    it('actualiza solo campos permitidos (no escribe `total` generado)', async () => {
      const q = makeQuery({ data: { id: 5, total: 100, precio_venta: 50 }, error: null })
      supabase.from.mockReturnValue(q)

      await ventaService.updateVenta(5, {
        cantidad: 2,
        precio_unitario: 50,
        monto_total: 99999, // debe ser ignorado
        descripcion: 'cambiada',
      })

      const updateArg = q.update.mock.calls[0][0]
      expect(updateArg).not.toHaveProperty('total')
      expect(updateArg).not.toHaveProperty('monto_total')
      expect(updateArg.precio_venta).toBe(50)
      expect(updateArg.notas).toBe('cambiada')
    })

    it('lanza cuando hay error', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'fail' } }))
      await expect(ventaService.updateVenta(1, { cantidad: 1 })).rejects.toBeTruthy()
    })
  })

  describe('deleteVenta', () => {
    it('borra por id', async () => {
      const q = makeQuery({ data: null, error: null })
      supabase.from.mockReturnValue(q)
      await ventaService.deleteVenta(5)
      expect(q.delete).toHaveBeenCalled()
      expect(q.eq).toHaveBeenCalledWith('id', 5)
    })
  })

  describe('updateVentaStatus', () => {
    it('es no-op (tabla ventas no tiene columna active)', async () => {
      const result = await ventaService.updateVentaStatus(1, false)
      expect(result).toBeUndefined()
      expect(supabase.from).not.toHaveBeenCalled()
    })
  })

  describe('getVentasFiltered', () => {
    it('aplica filtros opcionales', async () => {
      const q = makeQuery({ data: [], error: null })
      supabase.from.mockReturnValue(q)
      await ventaService.getVentasFiltered({
        equipoId: 'e1',
        usuarioId: 'u1',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      })
      expect(q.eq).toHaveBeenCalledWith('equipo_id', 'e1')
      expect(q.eq).toHaveBeenCalledWith('vendido_por', 'u1')
      expect(q.gte).toHaveBeenCalledWith('created_at', '2026-01-01')
      expect(q.lte).toHaveBeenCalledWith('created_at', '2026-12-31')
    })
  })

  describe('getVentasTotals', () => {
    it('agrega monto_total alias', async () => {
      supabase.from.mockReturnValue(makeQuery({
        data: [{ total: 100, cantidad: 1 }, { total: 50, cantidad: 2 }],
        error: null,
      }))
      const result = await ventaService.getVentasTotals()
      expect(result[0].monto_total).toBe(100)
      expect(result[1].monto_total).toBe(50)
    })
  })
})
