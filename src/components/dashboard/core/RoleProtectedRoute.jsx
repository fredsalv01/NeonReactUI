import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { Spinner } from '../../ui'

export const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, userRole } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gs-bg">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user has one of the allowed roles (case-sensitive match)
  const hasPermission = allowedRoles.length === 0 || allowedRoles.includes(userRole)

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gs-bg">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gs-danger mb-4">Acceso Denegado</h1>
          <p className="text-gs-soft mb-6">Tu rol ('{userRole}') no tiene permiso para acceder a esta página.</p>
          <p className="text-sm text-gs-muted mb-6">Roles permitidos: {allowedRoles.join(', ')}</p>
          <a href="/dashboard" className="text-gs-accent hover:underline">Volver al dashboard</a>
        </div>
      </div>
    )
  }

  return children
}
