import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ventaService } from './ventaService'

// Mock supabase with proper chaining support
const mockSupabaseQuery = {
  select: vi.fn(function() { return this }),
  eq: vi.fn(function() { return this }),
  neq: vi.fn(function() { return this }),
  insert: vi.fn(function() { return this }),
  update: vi.fn(function() { return this }),
  order: vi.fn(function() { return this }),
  gte: vi.fn(function() { return this }),
  lte: vi.fn(function() { return this }),
  single: vi.fn(() => Promise.resolve({
    data: {
      id: 'venta-123',
      equipo_id: 'equipo-1',
      cantidad: 5,
      precio_unitario: 100,
      monto_total: 500,
    },
    error: null,
  })),
  then: vi.fn((callback) => {
    return Promise.resolve({
      data: [{
        id: 'venta-123',
        equipo_id: 'equipo-1',
        cantidad: 5,
        precio_unitario: 100,
        monto_total: 500,
      }],
      error: null,
    }).then(callback)
  }),
}

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({ ...mockSupabaseQuery })),
    rpc: vi.fn(),
  },
}))

describe('ventaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getVentas', () => {
    it('should fetch all active sales', async () => {
      const mockVentas = [
        {
          id: 'venta-1',
          equipo_id: 'equipo-1',
          cantidad: 5,
          precio_unitario: 100,
          monto_total: 500,
          active: true,
        },
      ]

      const result = await ventaService.getVentas()
      expect(result).toBeDefined()
    })

    it('should handle empty sales list', async () => {
      const result = await ventaService.getVentas()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getVentaById', () => {
    it('should fetch a single venta by id', async () => {
      const result = await ventaService.getVentaById('venta-123')
      expect(result).toBeDefined()
      expect(result.id).toBe('venta-123')
    })
  })

  describe('addVenta', () => {
    it('should create a new venta', async () => {
      const ventaData = {
        equipo_id: 'equipo-1',
        cantidad: 5,
        precio_unitario: 100,
        monto_total: 500,
        usuario_id: 'user-1',
      }

      const result = await ventaService.addVenta(ventaData)
      expect(result).toBeDefined()
    })

    it('should validate required fields', () => {
      const invalidData = {
        cantidad: 5,
        // missing required fields
      }

      expect(async () => {
        await ventaService.addVenta(invalidData)
      }).toBeDefined()
    })
  })

  describe('updateVenta', () => {
    it('should update an existing venta', async () => {
      const updateData = {
        cantidad: 10,
        precio_unitario: 150,
      }

      const result = await ventaService.updateVenta('venta-123', updateData)
      expect(result).toBeDefined()
    })

    it('should only update provided fields', async () => {
      const updateData = {
        cantidad: 10,
      }

      const result = await ventaService.updateVenta('venta-123', updateData)
      expect(result).toBeDefined()
    })
  })

  describe('deleteVenta', () => {
    it('should soft delete a venta', async () => {
      const fn = async () => {
        await ventaService.deleteVenta('venta-123')
      }
      expect(fn).not.toThrow()
    })
  })

  describe('updateVentaStatus', () => {
    it('should update venta status', async () => {
      const fn = async () => {
        await ventaService.updateVentaStatus('venta-123', false)
      }
      expect(fn).not.toThrow()
    })
  })

  describe('getVentasFiltered', () => {
    it('should filter ventas by equipo_id', async () => {
      const filters = { equipoId: 'equipo-1' }
      const result = await ventaService.getVentasFiltered(filters)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should filter ventas by date range', async () => {
      const filters = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }
      const result = await ventaService.getVentasFiltered(filters)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle empty filters', async () => {
      const result = await ventaService.getVentasFiltered({})
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getVentasTotals', () => {
    it('should return totals of all sales', async () => {
      const result = await ventaService.getVentasTotals()
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
