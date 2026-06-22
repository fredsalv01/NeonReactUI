import { create } from 'zustand'
import { clienteService } from '../lib/services/clienteService'

const DEFAULT_FILTERS = {
  page: 1,
  pageSize: 10,
  search: '',
  status: 'all',
}

export const useClientesStore = create((set, get) => ({
  clientes: [],
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

  fetchClientes: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters } = get()
      const { data, total } = await clienteService.fetchClientes(filters)
      set({
        clientes: data || [],
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

  crearCliente: async (payload) => {
    try {
      const created = await clienteService.crearCliente(payload)
      await get().fetchClientes()
      return created
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  actualizarCliente: async (payload) => {
    const prev = get().clientes
    set({
      clientes: prev.map((c) =>
        c.id === payload.id ? { ...c, ...payload, _optimistic: true } : c
      ),
    })
    try {
      const updated = await clienteService.actualizarCliente(payload)
      set((state) => ({
        clientes: state.clientes.map((c) =>
          c.id === payload.id ? updated : c
        ),
        lastUpdated: new Date().toISOString(),
      }))
      return updated
    } catch (err) {
      set({ clientes: prev, error: err.message })
      throw err
    }
  },

  desactivarCliente: async (id) => {
    const prev = get().clientes
    set({
      clientes: prev.map((c) => (c.id === id ? { ...c, active: false } : c)),
    })
    try {
      await clienteService.desactivarCliente(id)
      const { filters } = get()
      if (filters.status === 'active') {
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
        }))
      }
    } catch (err) {
      set({ clientes: prev, error: err.message })
      throw err
    }
  },

  reactivarCliente: async (id) => {
    const prev = get().clientes
    set({
      clientes: prev.map((c) => (c.id === id ? { ...c, active: true } : c)),
    })
    try {
      await clienteService.reactivarCliente(id)
      const { filters } = get()
      if (filters.status === 'inactive') {
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
        }))
      }
    } catch (err) {
      set({ clientes: prev, error: err.message })
      throw err
    }
  },

  getClienteById: (id) => get().clientes.find((c) => c.id === id),
  clearError: () => set({ error: null }),
  reset: () => set({
    clientes: [],
    total: 0,
    isLoading: false,
    error: null,
    lastUpdated: null,
    filters: { ...DEFAULT_FILTERS },
  }),
}))
