import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeQuery } from '../_helpers/mockSupabase'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '../../lib/supabase'
import { reportService } from '../../lib/services/reportService'

describe('reportService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getSalesByDateRange', () => {
    it('mapea total → monto_total (parsea string numeric)', async () => {
      supabase.from.mockReturnValue(makeQuery({
        data: [{ total: '150.50', cantidad: 2, created_at: '2026-06-01' }],
        error: null,
      }))
      const [row] = await reportService.getSalesByDateRange('2026-01-01', '2026-12-31')
      expect(row.monto_total).toBe(150.5)
    })

    it('lanza si hay error', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'fail' } }))
      await expect(reportService.getSalesByDateRange('a', 'b')).rejects.toBeTruthy()
    })
  })

  describe('countLowStock', () => {
    it('devuelve count del head', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: null, count: 7 }))
      expect(await reportService.countLowStock(6)).toBe(7)
    })

    it('devuelve 0 cuando count es null', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: null, count: null }))
      expect(await reportService.countLowStock()).toBe(0)
    })

    it('usa la vista v_equipos_con_stock', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: null, count: 0 }))
      await reportService.countLowStock(10)
      expect(supabase.from).toHaveBeenCalledWith('v_equipos_con_stock')
    })

    it('lanza si hay error', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: { message: 'fail' }, count: null }))
      await expect(reportService.countLowStock()).rejects.toBeTruthy()
    })
  })

  describe('getLowStockProducts', () => {
    it('devuelve filas de la vista', async () => {
      const rows = [{ id: 1, stock_total: 2 }, { id: 2, stock_total: 5 }]
      supabase.from.mockReturnValue(makeQuery({ data: rows, error: null }))
      expect(await reportService.getLowStockProducts()).toEqual(rows)
    })

    it('devuelve [] cuando data es null', async () => {
      supabase.from.mockReturnValue(makeQuery({ data: null, error: null }))
      expect(await reportService.getLowStockProducts()).toEqual([])
    })
  })

  describe('getTopSellingProducts', () => {
    it('agrupa por equipo_id y ordena por cantidad desc', async () => {
      // A: 3+1=4, B: 7 → B primero
      const ventas = [
        { equipo_id: 'A', cantidad: 3 },
        { equipo_id: 'A', cantidad: 1 },
        { equipo_id: 'B', cantidad: 7 },
      ]
      const equipos = [
        { id: 'A', nombre: 'GPS', tipo: 't1', imagen_url: null },
        { id: 'B', nombre: 'Nivel', tipo: 't2', imagen_url: null },
      ]
      supabase.from
        .mockReturnValueOnce(makeQuery({ data: ventas, error: null }))
        .mockReturnValueOnce(makeQuery({ data: equipos, error: null }))

      const result = await reportService.getTopSellingProducts()
      expect(result[0].equipo_id).toBe('B')
      expect(result[0].total_cantidad).toBe(7)
      expect(result[1].equipo_id).toBe('A')
      expect(result[1].total_cantidad).toBe(4)
      expect(result[1].total_ventas).toBe(2)
    })

    it('respeta el limit', async () => {
      supabase.from
        .mockReturnValueOnce(makeQuery({
          data: [
            { equipo_id: 'A', cantidad: 1 },
            { equipo_id: 'B', cantidad: 2 },
            { equipo_id: 'C', cantidad: 3 },
          ],
          error: null,
        }))
        .mockReturnValueOnce(makeQuery({ data: [], error: null }))

      const result = await reportService.getTopSellingProducts(2)
      expect(result).toHaveLength(2)
    })
  })

  describe('getSalesStatistics', () => {
    it('agrega ventas + inventario', async () => {
      supabase.from
        .mockReturnValueOnce(makeQuery({
          data: [
            { total: '100', cantidad: 2, created_at: '2026-01-01' },
            { total: '50',  cantidad: 1, created_at: '2026-01-02' },
          ],
          error: null,
        })) // ventas
        .mockReturnValueOnce(makeQuery({
          data: [
            { stock_total: 5, precio_venta: '10' },
            { stock_total: 3, precio_venta: '20' },
          ],
          error: null,
        })) // inventario

      const stats = await reportService.getSalesStatistics()
      expect(stats.totalVentas).toBe(2)
      expect(stats.totalMontoVentas).toBe(150)
      expect(stats.totalCantidad).toBe(3)
      expect(stats.promedioVenta).toBe(75)
      expect(stats.totalInventarioValue).toBe(110) // 5*10 + 3*20
      expect(stats.totalStock).toBe(8)
    })

    it('promedioVenta = 0 cuando no hay ventas', async () => {
      supabase.from
        .mockReturnValueOnce(makeQuery({ data: [], error: null }))
        .mockReturnValueOnce(makeQuery({ data: [], error: null }))
      const stats = await reportService.getSalesStatistics()
      expect(stats.promedioVenta).toBe(0)
    })
  })

  describe('getCategoriesBreakdown', () => {
    it('agrupa montos por tipo de equipo', async () => {
      supabase.from
        .mockReturnValueOnce(makeQuery({
          data: [
            { total: '100', equipo_id: 'A' },
            { total: '200', equipo_id: 'B' },
            { total: '50',  equipo_id: 'A' },
          ],
          error: null,
        }))
        .mockReturnValueOnce(makeQuery({
          data: [{ id: 'A', tipo: 'GPS' }, { id: 'B', tipo: 'Nivel' }],
          error: null,
        }))

      const breakdown = await reportService.getCategoriesBreakdown()
      const gps = breakdown.find(b => b.name === 'GPS')
      const nivel = breakdown.find(b => b.name === 'Nivel')
      expect(gps.value).toBe(150)
      expect(nivel.value).toBe(200)
    })
  })

  describe('getInventoryStatusBreakdown', () => {
    it('agrupa por disponibilidad de stock segun umbrales BAJO=6 / MEDIO=12', async () => {
      supabase.from.mockReturnValue(makeQuery({
        data: [
          { id: 'EQ-1', stock_total: 0 },   // Sin Stock
          { id: 'EQ-2', stock_total: 3 },   // Stock Bajo
          { id: 'EQ-3', stock_total: 6 },   // Stock Bajo (<=6)
          { id: 'EQ-4', stock_total: 10 },  // Stock Medio
          { id: 'EQ-5', stock_total: 12 },  // Stock Medio (<=12)
          { id: 'EQ-6', stock_total: 20 },  // Disponible
        ],
        error: null,
      }))
      const result = await reportService.getInventoryStatusBreakdown()
      const byName = Object.fromEntries(result.map(r => [r.name, r]))
      expect(byName['Sin Stock'].value).toBe(1)
      expect(byName['Stock Bajo'].value).toBe(2)
      expect(byName['Stock Medio'].value).toBe(2)
      expect(byName['Disponible'].value).toBe(1)
    })

    it('incluye porcentaje calculado sobre el total de equipos activos', async () => {
      supabase.from.mockReturnValue(makeQuery({
        data: [
          { id: 'EQ-1', stock_total: 0 },
          { id: 'EQ-2', stock_total: 0 },
          { id: 'EQ-3', stock_total: 20 },
          { id: 'EQ-4', stock_total: 20 },
        ],
        error: null,
      }))
      const result = await reportService.getInventoryStatusBreakdown()
      const sinStock = result.find(r => r.name === 'Sin Stock')
      const disp = result.find(r => r.name === 'Disponible')
      expect(sinStock.percent).toBe(50)
      expect(disp.percent).toBe(50)
    })
  })
})
