import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSalesStore } from './salesStore'

// Mock the services
vi.mock('../lib/services/ventaService', () => ({
  ventaService: {
    getVentas: vi.fn(),
    getVentaById: vi.fn(),
    addVenta: vi.fn(),
    updateVenta: vi.fn(),
    deleteVenta: vi.fn(),
    updateVentaStatus: vi.fn(),
  },
}))

vi.mock('../lib/services/kardexService', () => ({
  kardexService: {
    registrarMovimiento: vi.fn(),
  },
}))

describe('useSalesStore', () => {
  beforeEach(() => {
    // Reset store state
    useSalesStore.setState({
      ventas: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useSalesStore.getState()
      expect(state.ventas).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.lastUpdated).toBeNull()
    })
  })

  describe('fetchVentas', () => {
    it('should set loading state while fetching', async () => {
      const { ventaService } = await import('../lib/services/ventaService')
      ventaService.getVentas.mockResolvedValue([])

      const store = useSalesStore.getState()
      expect(store.isLoading).toBe(false)
    })

    it('should clear error on successful fetch', async () => {
      const mockVentas = [
        {
          id: 'venta-1',
          cantidad: 5,
          monto_total: 500,
        },
      ]

      const { ventaService } = await import('../lib/services/ventaService')
      ventaService.getVentas.mockResolvedValue(mockVentas)

      const store = useSalesStore.getState()
      await store.fetchVentas()

      const newState = useSalesStore.getState()
      expect(newState.error).toBeNull()
    })
  })

  describe('getTotalVentas', () => {
    it('should calculate total sales amount', () => {
      useSalesStore.setState({
        ventas: [
          { id: '1', monto_total: 500 },
          { id: '2', monto_total: 300 },
          { id: '3', monto_total: 200 },
        ],
      })

      const store = useSalesStore.getState()
      const total = store.getTotalVentas()
      expect(total).toBe(1000)
    })

    it('should return 0 for empty ventas', () => {
      useSalesStore.setState({ ventas: [] })

      const store = useSalesStore.getState()
      const total = store.getTotalVentas()
      expect(total).toBe(0)
    })

    it('should handle undefined monto_total', () => {
      useSalesStore.setState({
        ventas: [
          { id: '1', monto_total: 500 },
          { id: '2' }, // undefined monto_total
        ],
      })

      const store = useSalesStore.getState()
      const total = store.getTotalVentas()
      expect(total).toBe(500)
    })
  })

  describe('getTotalQuantity', () => {
    it('should calculate total quantity sold', () => {
      useSalesStore.setState({
        ventas: [
          { id: '1', cantidad: 5 },
          { id: '2', cantidad: 3 },
          { id: '3', cantidad: 2 },
        ],
      })

      const store = useSalesStore.getState()
      const total = store.getTotalQuantity()
      expect(total).toBe(10)
    })

    it('should return 0 for empty ventas', () => {
      useSalesStore.setState({ ventas: [] })

      const store = useSalesStore.getState()
      const total = store.getTotalQuantity()
      expect(total).toBe(0)
    })
  })

  describe('getVentaById', () => {
    it('should find venta by id', () => {
      const venta = { id: 'venta-1', cantidad: 5 }
      useSalesStore.setState({
        ventas: [venta],
      })

      const store = useSalesStore.getState()
      const found = store.getVentaById('venta-1')
      expect(found).toEqual(venta)
    })

    it('should return undefined for non-existent id', () => {
      useSalesStore.setState({
        ventas: [{ id: 'venta-1', cantidad: 5 }],
      })

      const store = useSalesStore.getState()
      const found = store.getVentaById('non-existent')
      expect(found).toBeUndefined()
    })
  })

  describe('getVentasByEquipo', () => {
    it('should filter ventas by equipo_id', () => {
      useSalesStore.setState({
        ventas: [
          { id: '1', equipo_id: 'equipo-1', cantidad: 5 },
          { id: '2', equipo_id: 'equipo-2', cantidad: 3 },
          { id: '3', equipo_id: 'equipo-1', cantidad: 2 },
        ],
      })

      const store = useSalesStore.getState()
      const result = store.getVentasByEquipo('equipo-1')
      expect(result).toHaveLength(2)
      expect(result.every(v => v.equipo_id === 'equipo-1')).toBe(true)
    })

    it('should return empty array for non-existent equipo', () => {
      useSalesStore.setState({
        ventas: [{ id: '1', equipo_id: 'equipo-1', cantidad: 5 }],
      })

      const store = useSalesStore.getState()
      const result = store.getVentasByEquipo('non-existent')
      expect(result).toEqual([])
    })
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      useSalesStore.setState({
        error: 'Some error message',
      })

      const store = useSalesStore.getState()
      store.clearError()

      const newState = useSalesStore.getState()
      expect(newState.error).toBeNull()
    })
  })

  describe('reset', () => {
    it('should reset store to initial state', () => {
      useSalesStore.setState({
        ventas: [{ id: '1', cantidad: 5 }],
        isLoading: true,
        error: 'Some error',
        lastUpdated: '2024-01-01',
      })

      const store = useSalesStore.getState()
      store.reset()

      const newState = useSalesStore.getState()
      expect(newState.ventas).toEqual([])
      expect(newState.isLoading).toBe(false)
      expect(newState.error).toBeNull()
      expect(newState.lastUpdated).toBeNull()
    })
  })
})
