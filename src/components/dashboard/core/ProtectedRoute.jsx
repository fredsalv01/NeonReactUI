import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { Spinner } from '../../ui'

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gs-bg">
        <Spinner />
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}
