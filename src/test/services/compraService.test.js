import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeQuery } from '../_helpers/mockSupabase'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  },
}))

import { supabase } from '../../lib/supabase'
import { compraService } from '../../lib/services/compraService'

describe('compraService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  describe('fetchCompras', () => {
    it('devuelve { data, total } con count', async () => {
      const rows = [{ id: 1 }, { id: 2 }]
      supabase.from.mockReturnValue(makeQuery({ data: rows, error: null, count: 25 }))

      const result = await compraService.fetchCompras({ page: 2, pageSize: 10 })
      expect(result).toEqual({ data: rows, total: 25 })
    })

    it('aplica filtros opcionales cuando se dan', async () => {
      const q = makeQuery({ data: [], error: null, count: 0 })
      supabase.from.mockReturnValue(q)

      await compraService.fetchCompras({
        proveedorId: 'p1',
        almacenId: 'a1',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      })
      expect(q.eq).toHaveBeenCalledWith('proveedor_id', 'p1')
      expect(q.eq).toHaveBeenCalledWith('almacen_id', 'a1')
      expect(q.gte).toHaveBeenCalledWith('fecha', '2026-01-01')
      expect(q.lte).toHaveBeenCalledWith('fecha', '2026-12-31')
    })

    it('cae a length cuando count viene null', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: [{ id: 1 }], error: null, count: null }))
      const result = await compraService.fetchCompras()
      expect(result.total).toBe(1)
    })

    it('lanza si supabase devuelve error', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'fail' } }))
      await expect(compraService.fetchCompras()).rejects.toThrow('fail')
    })
  })

  describe('fetchCompraById', () => {
    it('devuelve la compra', async () => {
      const c = { id: 7, total: 500 }
      supabase.from.mockReturnValue(makeQuery({ data: c, error: null }))
      expect(await compraService.fetchCompraById(7)).toEqual(c)
    })

    it('lanza con mensaje del error', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'not found' } }))
      await expect(compraService.fetchCompraById(99)).rejects.toThrow('not found')
    })
  })

  describe('fetchCompraItems', () => {
    it('devuelve [] cuando data es null', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: null }))
      expect(await compraService.fetchCompraItems(1)).toEqual([])
    })
  })

  describe('crearCompra (validaciones)', () => {
    it('exige almacen_id', async () => {
      await expect(compraService.crearCompra({
        items: [{ equipo_id: 'e1', cantidad: 1, precio_unitario: 10 }],
      })).rejects.toThrow(/almacén/i)
    })

    it('exige al menos un item', async () => {
      await expect(compraService.crearCompra({ almacen_id: 'a1', items: [] }))
        .rejects.toThrow(/al menos un item/i)
    })

    it('rechaza item sin equipo_id', async () => {
      await expect(compraService.crearCompra({
        almacen_id: 'a1',
        items: [{ cantidad: 1, precio_unitario: 10 }],
      })).rejects.toThrow(/equipo/i)
    })

    it('rechaza cantidad <= 0', async () => {
      await expect(compraService.crearCompra({
        almacen_id: 'a1',
        items: [{ equipo_id: 'e1', cantidad: 0, precio_unitario: 10 }],
      })).rejects.toThrow(/cantidad/i)
    })

    it('rechaza precio_unitario negativo', async () => {
      await expect(compraService.crearCompra({
        almacen_id: 'a1',
        items: [{ equipo_id: 'e1', cantidad: 1, precio_unitario: -5 }],
      })).rejects.toThrow(/precio/i)
    })
  })

  describe('crearCompra (happy + rollback)', () => {
    it('inserta cabecera + items y re-fetchea la compra final', async () => {
      // 1) insert en 'compras' → devuelve { id: 10 }
      // 2) insert en 'compra_items' → OK
      // 3) fetchCompraById → devuelve compra con total recalculado por trigger
      const headerInsert = makeQuery({ data: { id: 10 }, error: null })
      const itemsInsert  = makeQuery({ data: null, error: null })
      const refetched    = makeQuery({ data: { id: 10, total: 1500 }, error: null })

      supabase.from
        .mockReturnValueOnce(headerInsert)
        .mockReturnValueOnce(itemsInsert)
        .mockReturnValueOnce(refetched)

      const result = await compraService.crearCompra({
        almacen_id: 'a1',
        items: [{ equipo_id: 'e1', cantidad: 3, precio_unitario: 500 }],
      })

      expect(result).toEqual({ id: 10, total: 1500 })
      expect(supabase.from).toHaveBeenNthCalledWith(1, 'compras')
      expect(supabase.from).toHaveBeenNthCalledWith(2, 'compra_items')
      // items mapeados con compra_id
      const itemsArg = itemsInsert.insert.mock.calls[0][0]
      expect(itemsArg[0]).toMatchObject({
        compra_id: 10,
        equipo_id: 'e1',
        cantidad: 3,
        precio_unitario: 500,
      })
    })

    it('hace rollback de la cabecera si los items fallan', async () => {
      const headerInsert = makeQuery({ data: { id: 11 }, error: null })
      const itemsInsert  = makeQuery({ data: null, error: { message: 'item fail' } })
      const cleanupDel   = makeQuery({ data: null, error: null })

      supabase.from
        .mockReturnValueOnce(headerInsert)
        .mockReturnValueOnce(itemsInsert)
        .mockReturnValueOnce(cleanupDel)

      await expect(compraService.crearCompra({
        almacen_id: 'a1',
        items: [{ equipo_id: 'e1', cantidad: 1, precio_unitario: 10 }],
      })).rejects.toThrow('item fail')

      // Tercera llamada: delete sobre compras con id=11
      expect(supabase.from).toHaveBeenNthCalledWith(3, 'compras')
      expect(cleanupDel.delete).toHaveBeenCalled()
      expect(cleanupDel.eq).toHaveBeenCalledWith('id', 11)
    })

    it('lanza con mensaje cuando falla el insert de cabecera', async () => {
      supabase.from.mockReturnValueOnce(makeQuery({ data: null, error: { message: 'header fail' } }))
      await expect(compraService.crearCompra({
        almacen_id: 'a1',
        items: [{ equipo_id: 'e1', cantidad: 1, precio_unitario: 10 }],
      })).rejects.toThrow('header fail')
    })
  })
})
