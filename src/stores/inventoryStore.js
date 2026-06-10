import { create } from 'zustand'
import { equipoService } from '../lib/services/equipoService'
import { kardexService } from '../lib/services/kardexService'
import { useAuthStore } from './authStore'

export const useInventoryStore = create((set, get) => ({
  // State
  equipos: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  // Actions - Fetch & Reload
  fetchEquipos: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await equipoService.getEquipos()
      set({
        equipos: (data || []).filter(Boolean),
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      })
      return data || []
    } catch (err) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  // Reload inventory after changes
  reloadEquipos: async () => {
    try {
      const { fetchEquipos } = get()
      await fetchEquipos()
    } catch (err) {
      console.error('Error reloading equipos:', err)
      throw err
    }
  },

  // Add new equipment
  addEquipo: async (equipoData) => {
    try {
      const newEquipo = await equipoService.addEquipo(equipoData)
      if (newEquipo) {
        set(state => ({
          equipos: [newEquipo, ...state.equipos].filter(Boolean),
          lastUpdated: new Date().toISOString(),
        }))

        // Registrar entrada de stock en kardex
        if (newEquipo.stock > 0) {
          try {
            await kardexService.entradaStock({
              equipo_id: newEquipo.id,
              cantidad: newEquipo.stock,
              motivo: `Entrada inicial de ${newEquipo.nombre}`,
            })
          } catch (kardexErr) {
            console.error('Error registering kardex entry:', kardexErr)
            // No throw - equipo was created successfully, kardex entry failure is non-critical
          }
        }
      }
      return newEquipo
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // Update existing equipment
  updateEquipo: async (id, equipoData) => {
    try {
      // Validate equipment exists
      const existingEquipo = get().getEquipoById(id)
      if (!existingEquipo) {
        throw new Error(`Equipo con ID ${id} no encontrado`)
      }

      // Update in database
      const updatedData = await equipoService.updateEquipo(id, equipoData)

      if (!updatedData) {
        throw new Error('Error actualizando equipo')
      }

      // Merge updated data with existing data to preserve all fields
      const mergedEquipo = { ...existingEquipo, ...updatedData }

      // Update in store
      set(state => ({
        equipos: state.equipos.map(e => e.id === id ? mergedEquipo : e).filter(Boolean),
        lastUpdated: new Date().toISOString(),
        error: null,
      }))

      return mergedEquipo
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // Delete equipment (soft delete)
  deleteEquipo: async (id) => {
    try {
      // Validate equipment exists
      const existingEquipo = get().getEquipoById(id)
      if (!existingEquipo) {
        throw new Error(`Equipo con ID ${id} no encontrado`)
      }

      // Perform soft delete in database
      await equipoService.deleteEquipo(id)

      // Update store (remove from list)
      set(state => ({
        equipos: state.equipos.filter(e => e.id !== id),
        lastUpdated: new Date().toISOString(),
        error: null,
      }))

      return { success: true, id }
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // Update equipment status (active/inactive)
  updateEquipoStatus: async (id, active) => {
    try {
      const existingEquipo = get().getEquipoById(id)
      if (!existingEquipo) {
        throw new Error(`Equipo con ID ${id} no encontrado`)
      }

      await equipoService.updateEquipoStatus(id, active)

      set(state => ({
        equipos: state.equipos
          .map(e => e.id === id ? { ...e, active } : e)
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
  getEquipoById: (id) => {
    const { equipos } = get()
    return equipos.find(e => e.id === id)
  },

  getLowStockEquipos: (threshold = 5) => {
    const { equipos } = get()
    return equipos.filter(e => e.stock <= threshold && e.stock > 0)
  },

  getOutOfStockEquipos: () => {
    const { equipos } = get()
    return equipos.filter(e => e.stock === 0)
  },

  getTotalInventoryValue: () => {
    const { equipos } = get()
    return equipos.reduce((total, e) => total + (e.precio_venta * e.stock), 0)
  },

  clearError: () => set({ error: null }),

  // Cleanup
  reset: () => set({
    equipos: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  }),
}))
