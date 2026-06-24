import { create } from 'zustand'
import { cotizacionService } from '../lib/services/cotizacionService'

export const useCotizacionStore = create((set, get) => ({
  cotizaciones: [],
  total: 0,
  page: 1,
  pageSize: 10,
  filterEstado: '',
  isLoading: false,
  error: null,

  setPage:        (page)        => set({ page }),
  setPageSize:    (pageSize)    => set({ pageSize, page: 1 }),
  setFilterEstado:(filterEstado)=> set({ filterEstado, page: 1 }),

  fetchCotizaciones: async () => {
    set({ isLoading: true, error: null })
    try {
      const { page, pageSize, filterEstado } = get()
      const { data, total } = await cotizacionService.fetchCotizaciones({
        page, pageSize, estado: filterEstado || null,
      })
      set({ cotizaciones: data, total, isLoading: false })
      return data
    } catch (err) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  addCotizacion: async ({ cotizacion, items }) => {
    const created = await cotizacionService.crearCotizacion({ cotizacion, items })
    // Refresca la primera página para mantener consistencia con el filtro/orden
    await get().fetchCotizaciones()
    return created
  },

  actualizarEstado: async (id, estado) => {
    const updated = await cotizacionService.actualizarEstado(id, estado)
    set(state => ({
      cotizaciones: state.cotizaciones.map(c => c.id === id ? { ...c, ...updated } : c),
    }))
    return updated
  },

  actualizarNotas: async (id, notas) => {
    const updated = await cotizacionService.actualizarNotas(id, notas)
    set(state => ({
      cotizaciones: state.cotizaciones.map(c => c.id === id ? { ...c, ...updated } : c),
    }))
    return updated
  },

  convertirAVenta: async (id, almacenId) => {
    const ventaId = await cotizacionService.convertirAVenta(id, almacenId)
    // Después de convertir, la cotización pasa a 'convertida'. Refrescamos.
    await get().fetchCotizaciones()
    return ventaId
  },

  eliminarCotizacion: async (id) => {
    await cotizacionService.eliminarCotizacion(id)
    set(state => ({
      cotizaciones: state.cotizaciones.filter(c => c.id !== id),
      total: Math.max(0, state.total - 1),
    }))
  },

  clearError: () => set({ error: null }),
}))
