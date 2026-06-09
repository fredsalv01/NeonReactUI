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

  // Add new sale
  addVenta: async (ventaData) => {
    try {
      const newVenta = await ventaService.addVenta(ventaData)
      if (newVenta) {
        set(state => ({
          ventas: [newVenta, ...state.ventas].filter(Boolean),
          lastUpdated: new Date().toISOString(),
        }))

        // Registrar salida de stock en kardex
        try {
          await kardexService.registrarMovimiento({
            equipo_id: ventaData.equipo_id,
            tipo: 'salida',
            cantidad: ventaData.cantidad,
            descripcion: `Venta de ${ventaData.cantidad} unidades`,
            usuario_id: ventaData.usuario_id,
            referencia: newVenta.id,
          })
        } catch (kardexErr) {
          console.error('Error registering kardex entry:', kardexErr)
        }
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
