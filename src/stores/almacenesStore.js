import { create } from 'zustand'
import { almacenService } from '../lib/services/almacenService'

const DEFAULT_FILTERS = {
  page: 1,
  pageSize: 10,
  search: '',
  status: 'all',
}

export const useAlmacenesStore = create((set, get) => ({
  almacenes: [],
  perfiles: [],
  total: 0,
  isLoading: false,
  isLoadingPerfiles: false,
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

  fetchAlmacenes: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters } = get()
      const { data, total } = await almacenService.fetchAlmacenes(filters)
      set({
        almacenes: data || [],
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

  fetchPerfiles: async () => {
    set({ isLoadingPerfiles: true })
    try {
      const perfiles = await almacenService.fetchPerfilesActivos()
      set({ perfiles, isLoadingPerfiles: false })
      return perfiles
    } catch (err) {
      set({ isLoadingPerfiles: false, error: err.message })
      throw err
    }
  },

  crearAlmacen: async (payload) => {
    try {
      const created = await almacenService.crearAlmacen(payload)
      await get().fetchAlmacenes()
      return created
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  actualizarAlmacen: async (payload) => {
    const prev = get().almacenes
    set({
      almacenes: prev.map((a) =>
        a.id === payload.id ? { ...a, ...payload, _optimistic: true } : a
      ),
    })
    try {
      const updated = await almacenService.actualizarAlmacen(payload)
      set((state) => ({
        almacenes: state.almacenes.map((a) =>
          a.id === payload.id ? updated : a
        ),
        lastUpdated: new Date().toISOString(),
      }))
      return updated
    } catch (err) {
      set({ almacenes: prev, error: err.message })
      throw err
    }
  },

  desactivarAlmacen: async (id) => {
    const prev = get().almacenes
    set({
      almacenes: prev.map((a) => (a.id === id ? { ...a, active: false } : a)),
    })
    try {
      await almacenService.desactivarAlmacen(id)
      const { filters } = get()
      if (filters.status === 'active') {
        set((state) => ({
          almacenes: state.almacenes.filter((a) => a.id !== id),
        }))
      }
    } catch (err) {
      set({ almacenes: prev, error: err.message })
      throw err
    }
  },

  reactivarAlmacen: async (id) => {
    const prev = get().almacenes
    set({
      almacenes: prev.map((a) => (a.id === id ? { ...a, active: true } : a)),
    })
    try {
      await almacenService.reactivarAlmacen(id)
      const { filters } = get()
      if (filters.status === 'inactive') {
        set((state) => ({
          almacenes: state.almacenes.filter((a) => a.id !== id),
        }))
      }
    } catch (err) {
      set({ almacenes: prev, error: err.message })
      throw err
    }
  },

  getAlmacenById: (id) => get().almacenes.find((a) => a.id === id),
  clearError: () => set({ error: null }),
  reset: () => set({
    almacenes: [],
    perfiles: [],
    total: 0,
    isLoading: false,
    isLoadingPerfiles: false,
    error: null,
    lastUpdated: null,
    filters: { ...DEFAULT_FILTERS },
  }),
}))
