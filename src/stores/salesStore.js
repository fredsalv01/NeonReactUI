import { create } from 'zustand'
import { ventaService } from '../lib/services/ventaService'
import { kardexService } from '../lib/services/kardexService'

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

  // Add new sale — la salida de stock se hace vía fn_salida_stock RPC
  // que actualiza stock_almacen + escribe en kardex en una sola transacción
  addVenta: async (ventaData) => {
    try {
      const newVenta = await ventaService.addVenta(ventaData)
      if (newVenta) {
        set(state => ({
          ventas: [newVenta, ...state.ventas].filter(Boolean),
          lastUpdated: new Date().toISOString(),
        }))

        await kardexService.salidaStock({
          equipo_id: ventaData.equipo_id,
          cantidad: ventaData.cantidad,
          motivo: `Venta ${newVenta.id}`,
          almacen_id: ventaData.almacen_id,
          referencia_tipo: 'venta',
          // ponytail: kardex.referencia_id is uuid, ventas.id is bigint — el id va en `motivo`
        })
      }
      return newVenta
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // Update existing sale
  updateVenta: async (id, ventaData) => {
    try {
      const existingVenta = get().getVentaById(id)
      if (!existingVenta) {
        throw new Error(`Venta con ID ${id} no encontrada`)
      }

      const updatedData = await ventaService.updateVenta(id, ventaData)

      if (!updatedData) {
        throw new Error('Error actualizando venta')
      }

      const mergedVenta = { ...existingVenta, ...updatedData }

      set(state => ({
        ventas: state.ventas.map(v => v.id === id ? mergedVenta : v).filter(Boolean),
        lastUpdated: new Date().toISOString(),
        error: null,
      }))

      return mergedVenta
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // Delete sale (soft delete)
  deleteVenta: async (id) => {
    try {
      const existingVenta = get().getVentaById(id)
      if (!existingVenta) {
        throw new Error(`Venta con ID ${id} no encontrada`)
      }

      await ventaService.deleteVenta(id)

      set(state => ({
        ventas: state.ventas.filter(v => v.id !== id),
        lastUpdated: new Date().toISOString(),
        error: null,
      }))

      return { success: true, id }
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // Update sale status (active/inactive)
  updateVentaStatus: async (id, active) => {
    try {
      const existingVenta = get().getVentaById(id)
      if (!existingVenta) {
        throw new Error(`Venta con ID ${id} no encontrada`)
      }

      await ventaService.updateVentaStatus(id, active)

      set(state => ({
        ventas: state.ventas
          .map(v => v.id === id ? { ...v, active } : v)
          .filter(Boolean),
        lastUpdated: new Date().toISOString(),
        error: null,
      }))

      return { success: true, id, active }
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // Helper methods
  getVentaById: (id) => {
    const { ventas } = get()
    return ventas.find(v => v.id === id)
  },

  getVentasByEquipo: (equipoId) => {
    const { ventas } = get()
    return ventas.filter(v => v.equipo_id === equipoId)
  },

  getTotalVentas: () => {
    const { ventas } = get()
    return ventas.reduce((total, v) => total + (v.monto_total || 0), 0)
  },

  getTotalQuantity: () => {
    const { ventas } = get()
    return ventas.reduce((total, v) => total + (v.cantidad || 0), 0)
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    ventas: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  }),
}))
