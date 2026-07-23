import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { Spinner, useToast } from '../../ui'
import { ROLE_LANDING } from '../../../lib/constants/permissions'

export const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, userRole } = useAuth()
  const location = useLocation()
  const { toast } = useToast()
  const deniedToastFiredRef = useRef(false)

  const hasPermission = allowedRoles.length === 0 || allowedRoles.includes(userRole)

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasPermission && !deniedToastFiredRef.current) {
      toast.error(
        `No tienes permiso para acceder a esta página. Rol requerido: ${allowedRoles.join(', ')}`
      )
      localStorage.removeItem('intended_route')
      deniedToastFiredRef.current = true
    }
  }, [isLoading, isAuthenticated, hasPermission, allowedRoles, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gs-bg">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    if (location.pathname && location.pathname !== '/login') {
      localStorage.setItem('intended_route', location.pathname + location.search)
    }
    return <Navigate to="/login" replace />
  }

  if (!hasPermission) {
    const landing = ROLE_LANDING[userRole] || '/dashboard/inventory'
    return (
      <div className="min-h-screen flex items-center justify-center bg-gs-bg">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gs-danger mb-4">Acceso Denegado</h1>
          <p className="text-gs-soft mb-6">Tu rol ('{userRole}') no tiene permiso para acceder a esta página.</p>
          <p className="text-sm text-gs-muted mb-6">Roles permitidos: {allowedRoles.join(', ')}</p>
          <a href={landing} className="text-gs-accent hover:underline">Volver a mi inicio</a>
        </div>
      </div>
    )
  }

  return children
}
