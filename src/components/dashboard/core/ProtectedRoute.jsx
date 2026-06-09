import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { Spinner } from '../../ui'

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gs-bg">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Guardar la ruta intended en localStorage antes de redirigir a login
    if (location.pathname && location.pathname !== '/login') {
      localStorage.setItem('intended_route', location.pathname + location.search)
    }
    return <Navigate to="/login" replace />
  }

  return children
}
