import { useAuthStore } from '../stores/authStore'

export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const logout = useAuthStore((state) => state.logout)
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const clearError = useAuthStore((state) => state.clearError)

  return {
    user,
    profile,
    isLoading,
    error,
    logout,
    initializeAuth,
    clearError,
    isAuthenticated: !!user,
    userRole: profile?.roles?.nombre || null,
  }
}
