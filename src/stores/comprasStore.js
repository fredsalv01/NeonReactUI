import { create } from 'zustand'
import { compraService } from '../lib/services/compraService'

const DEFAULT_FILTERS = {
  page: 1,
  pageSize: 10,
  proveedorId: null,
  almacenId: null,
  startDate: null,
  endDate: null,
}

export const useComprasStore = create((set, get) => ({
  compras: [],
  total: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
  filters: { ...DEFAULT_FILTERS },

  setFilters: (patch) => {
    const current = get().filters
    const next = { ...current, ...patch }
    if (Object.keys(patch).some((k) => k !== 'page' && k !== 'pageSize')) {
      next.page = 1
    }
    set({ filters: next })
  },

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  fetchCompras: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters } = get()
      const { data, total } = await compraService.fetchCompras(filters)
      set({
        compras: data || [],
        total: total ?? 0,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      })
      return data
    } catch (err) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  crearCompra: async (payload) => {
    try {
      const created = await compraService.crearCompra(payload)
      await get().fetchCompras()
      return created
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({
    compras: [],
    total: 0,
    isLoading: false,
    error: null,
    lastUpdated: null,
    filters: { ...DEFAULT_FILTERS },
  }),
}))
