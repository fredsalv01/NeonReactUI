import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  initializeAuth: async () => {
    try {
      set({ isLoading: true, error: null })

      const { data: { session }, error: authError } = await supabase.auth.getSession()

      if (authError) throw authError

      set({ user: session?.user ?? null })

      if (session?.user?.id) {
        const { data, error: profileError } = await supabase
          .from('perfiles')
          .select('*, roles(nombre)')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        set({ profile: data ?? null })
      }
    } catch (error) {
      set({ error: error.message, user: null, profile: null })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, profile: null, error: null })
    } catch (error) {
      set({ error: error.message })
    }
  },

  clearError: () => set({ error: null }),
}))
