import { create } from 'zustand'
import { usuariosService } from '../lib/services/usuariosService'

const DEFAULT_FILTERS = {
  page: 1,
  pageSize: 10,
  search: '',
  rolId: null,
  status: 'all',
}

export const useUsuariosStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────
  usuarios: [],
  roles: [],
  total: 0,
  isLoading: false,
  isLoadingRoles: false,
  error: null,
  lastUpdated: null,
  filters: { ...DEFAULT_FILTERS },

  // ── Roles ──────────────────────────────────────────────────────
  fetchRoles: async () => {
    set({ isLoadingRoles: true })
    try {
      const roles = await usuariosService.fetchRoles()
      set({ roles, isLoadingRoles: false })
      return roles
    } catch (err) {
      set({ isLoadingRoles: false, error: err.message })
      throw err
    }
  },

  // ── Listado con filtros ────────────────────────────────────────
  setFilters: (patch) => {
    const current = get().filters
    const next = { ...current, ...patch }
    // Si cambia algún criterio (no la página), reseteamos a página 1
    if (Object.keys(patch).some((k) => k !== 'page' && k !== 'pageSize')) {
      next.page = 1
    }
    set({ filters: next })
  },

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  fetchUsuarios: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters } = get()
      const { data, total } = await usuariosService.fetchUsuarios(filters)
      set({
        usuarios: (data || []).filter(Boolean),
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
  crearUsuario: async (payload) => {
    try {
      const created = await usuariosService.crearUsuario(payload)
      // Recargar la lista para reflejar el nuevo usuario respetando filtros/orden
      await get().fetchUsuarios()
      return created
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // ── Editar (datos del perfil) ──────────────────────────────────
  actualizarUsuario: async (payload) => {
    // Optimistic update sobre la fila visible
    const prev = get().usuarios
    set({
      usuarios: prev.map((u) =>
        u.id === payload.id ? { ...u, ...payload, _optimistic: true } : u
      ),
    })

    try {
      const updated = await usuariosService.actualizarUsuario(payload)
      // Reemplazar la fila optimista por la versión fresca (con rol enriquecido)
      set((state) => ({
        usuarios: state.usuarios.map((u) => (u.id === payload.id ? updated : u)),
        lastUpdated: new Date().toISOString(),
      }))
      return updated
    } catch (err) {
      set({ usuarios: prev, error: err.message })
      throw err
    }
  },

  // ── Cambio de contraseña ───────────────────────────────────────
  cambiarPassword: async ({ id, password }) => {
    try {
      await usuariosService.cambiarPassword({ id, password })
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  // ── Desactivar / Reactivar (optimistic) ────────────────────────
  desactivarUsuario: async (id) => {
    const prev = get().usuarios
    set({
      usuarios: prev.map((u) => (u.id === id ? { ...u, active: false } : u)),
    })
    try {
      await usuariosService.desactivarUsuario(id)
      // Si el filtro actual es 'active', el usuario debería desaparecer del listado
      const { filters } = get()
      if (filters.status === 'active') {
        set((state) => ({ usuarios: state.usuarios.filter((u) => u.id !== id) }))
      }
    } catch (err) {
      set({ usuarios: prev, error: err.message })
      throw err
    }
  },

  reactivarUsuario: async (id) => {
    const prev = get().usuarios
    set({
      usuarios: prev.map((u) => (u.id === id ? { ...u, active: true } : u)),
    })
    try {
      await usuariosService.reactivarUsuario(id)
      const { filters } = get()
      if (filters.status === 'inactive') {
        set((state) => ({ usuarios: state.usuarios.filter((u) => u.id !== id) }))
      }
    } catch (err) {
      set({ usuarios: prev, error: err.message })
      throw err
    }
  },

  // ── Helpers ────────────────────────────────────────────────────
  getUsuarioById: (id) => get().usuarios.find((u) => u.id === id),
  clearError: () => set({ error: null }),
  reset: () => set({
    usuarios: [],
    roles: [],
    total: 0,
    isLoading: false,
    error: null,
    lastUpdated: null,
    filters: { ...DEFAULT_FILTERS },
  }),
}))
