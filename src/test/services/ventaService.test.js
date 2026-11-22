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
    it('renombra total → monto_total, vendido_por → usuario_id, notas → descripcion', async () => {
      const row = {
        id: 1,
        total: 200,
        vendido_por: 'u1',
        notas: 'hola',
        venta_items: [{ equipo_id: 'e1', cantidad: 2, precio_unitario: 100 }],
      }
      const q = makeQuery({ data: [row], error: null })
      supabase.from.mockReturnValue(q)

      const [mapped] = await ventaService.getVentas()
      // sin embed de equipos por ventas.equipo_id (columna legacy eliminada)
      expect(q.select.mock.calls[0][0]).not.toMatch(/equipos!inner/)
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
        data: { id: 5, total: 99 },
        error: null,
      }))
      const result = await ventaService.getVentaById(5)
      expect(result.monto_total).toBe(99)
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
        data: { id: 77, total: 500 },
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
    it('solo escribe cabecera: ignora ítems y `total` (lo calcula el trigger)', async () => {
      const q = makeQuery({ data: { id: 5, total: 100 }, error: null })
      supabase.from.mockReturnValue(q)

      await ventaService.updateVenta(5, {
        cantidad: 2,          // ítems no se editan desde aquí
        precio_unitario: 50,
        monto_total: 99999,
        descripcion: 'cambiada',
        cliente: 'ACME',
        cliente_direccion: 'Av. Larco 123',
      })

      expect(q.update.mock.calls[0][0]).toEqual({ notas: 'cambiada', cliente: 'ACME', cliente_direccion: 'Av. Larco 123' })
    })

    it('lanza cuando hay error', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'fail' } }))
      await expect(ventaService.updateVenta(1, { descripcion: 'x' })).rejects.toBeTruthy()
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
})
