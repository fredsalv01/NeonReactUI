import { create } from 'zustand'
import { equipoService } from '../lib/services/equipoService'
import { kardexService } from '../lib/services/kardexService'
import { useAuthStore } from './authStore'

export const useInventoryStore = create((set, get) => ({
  // State
  equipos: [],
  isLoading: false,
  error: null,

  // Actions
  fetchEquipos: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await equipoService.getEquipos()
      set({ equipos: (data || []).filter(Boolean), isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  addEquipo: async (equipoData) => {
    try {
      const newEquipo = await equipoService.addEquipo(equipoData)
      if (newEquipo) {
        set(state => ({
          equipos: [newEquipo, ...state.equipos].filter(Boolean)
        }))

        // Registrar movimiento en kardex
        const usuarioId = useAuthStore.getState().user?.id
        if (usuarioId && newEquipo.stock > 0) {
          await kardexService.registrarMovimiento({
            equipo_id: newEquipo.id,
            tipo: 'entrada',
            cantidad: newEquipo.stock,
            descripcion: `Entrada inicial de ${newEquipo.nombre}`,
            usuario_id: usuarioId,
            referencia: `EQUIPO_${newEquipo.id}`,
          })
        }
      }
      return newEquipo
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateEquipo: async (id, equipoData) => {
    try {
      const updatedEquipo = await equipoService.updateEquipo(id, equipoData)
      set(state => ({
        equipos: state.equipos.map(e => e.id === id ? updatedEquipo : e).filter(Boolean)
      }))
      return updatedEquipo
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteEquipo: async (id) => {
    try {
      await equipoService.deleteEquipo(id)
      set(state => ({
        equipos: state.equipos.filter(e => e.id !== id)
      }))
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // Helper
  getEquipoById: (id) => {
    const { equipos } = get()
    return equipos.find(e => e.id === id)
  },

  clearError: () => set({ error: null }),
}))
