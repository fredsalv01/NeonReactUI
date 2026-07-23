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
    // ponytail: auto-redirect al landing del rol. El toast del useEffect
    // ya informa al usuario; mostrar una pantalla intermedia es fricción.
    return <Navigate to={ROLE_LANDING[userRole] || '/dashboard/inventory'} replace />
  }

  return children
}
