import { create } from 'zustand'
import { proveedorService } from '../lib/services/proveedorService'

const DEFAULT_FILTERS = {
  page: 1,
  pageSize: 10,
  search: '',
  status: 'all',
}

export const useProveedoresStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────
  proveedores: [],
  total: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
  filters: { ...DEFAULT_FILTERS },

  // ── Filters ────────────────────────────────────────────────────
  setFilters: (patch) => {
    const current = get().filters
    const next = { ...current, ...patch }
    if (Object.keys(patch).some((k) => k !== 'page' && k !== 'pageSize')) {
      next.page = 1
    }
    set({ filters: next })
  },

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  fetchProveedores: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters } = get()
      const { data, total } = await proveedorService.fetchProveedores(filters)
      set({
        proveedores: data || [],
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

  // ── Crear ──────────────────────────────────────────────────────
  crearProveedor: async (payload) => {
    try {
      const created = await proveedorService.crearProveedor(payload)
      await get().fetchProveedores()
      return created
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // ── Editar (optimistic) ────────────────────────────────────────
  actualizarProveedor: async (payload) => {
    const prev = get().proveedores
    set({
      proveedores: prev.map((p) =>
        p.id === payload.id ? { ...p, ...payload, _optimistic: true } : p
      ),
    })
    try {
      const updated = await proveedorService.actualizarProveedor(payload)
      set((state) => ({
        proveedores: state.proveedores.map((p) =>
          p.id === payload.id ? updated : p
        ),
        lastUpdated: new Date().toISOString(),
      }))
      return updated
    } catch (err) {
      set({ proveedores: prev, error: err.message })
      throw err
    }
  },

  // ── Soft delete / reactivar (optimistic) ───────────────────────
  desactivarProveedor: async (id) => {
    const prev = get().proveedores
    set({
      proveedores: prev.map((p) => (p.id === id ? { ...p, active: false } : p)),
    })
    try {
      await proveedorService.desactivarProveedor(id)
      const { filters } = get()
      if (filters.status === 'active') {
        set((state) => ({
          proveedores: state.proveedores.filter((p) => p.id !== id),
        }))
      }
    } catch (err) {
      set({ proveedores: prev, error: err.message })
      throw err
    }
  },

  reactivarProveedor: async (id) => {
    const prev = get().proveedores
    set({
      proveedores: prev.map((p) => (p.id === id ? { ...p, active: true } : p)),
    })
    try {
      await proveedorService.reactivarProveedor(id)
      const { filters } = get()
      if (filters.status === 'inactive') {
        set((state) => ({
          proveedores: state.proveedores.filter((p) => p.id !== id),
        }))
      }
    } catch (err) {
      set({ proveedores: prev, error: err.message })
      throw err
    }
  },

  // ── Helpers ────────────────────────────────────────────────────
  getProveedorById: (id) => get().proveedores.find((p) => p.id === id),
  clearError: () => set({ error: null }),
  reset: () => set({
    proveedores: [],
    total: 0,
    isLoading: false,
    error: null,
    lastUpdated: null,
    filters: { ...DEFAULT_FILTERS },
  }),
}))
