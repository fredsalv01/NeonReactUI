import { create } from 'zustand'
import { ventaService } from '../lib/services/ventaService'

export const useSalesStore = create((set, get) => ({
  // State
  ventas: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  // Actions - Fetch & Reload
  fetchVentas: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await ventaService.getVentas()
      set({
        ventas: (data || []).filter(Boolean),
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      })
      return data || []
    } catch (err) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  // Reload ventas after changes
  reloadVentas: async () => {
    try {
      const { fetchVentas } = get()
      await fetchVentas()
    } catch (err) {
      console.error('Error reloading ventas:', err)
      throw err
    }
  },

  // Add new sale — fn_registrar_venta hace TODO en una sola transacción:
  // insert ventas + venta_items + descuento de stock_almacen + escritura en kardex
  // (1 row de kardex por item).
  addVenta: async ({ venta, items }) => {
    try {
      const newVenta = await ventaService.addVenta({ venta, items })
      if (newVenta) {
        set(state => ({
          ventas: [newVenta, ...state.ventas].filter(Boolean),
          lastUpdated: new Date().toISOString(),
        }))
      }
      return newVenta
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // Anular (no se edita ni se borra): la venta queda registrada como 'anulada'
  // y el stock vuelve al almacén. Reemplaza la fila con la versión actualizada.
  anularVenta: async (id, motivo) => {
    try {
      const anulada = await ventaService.anularVenta(id, motivo)
      set(state => ({
        ventas: state.ventas.map(v => v.id === id ? anulada : v).filter(Boolean),
        lastUpdated: new Date().toISOString(),
        error: null,
      }))
      return anulada
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    ventas: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  }),
}))
