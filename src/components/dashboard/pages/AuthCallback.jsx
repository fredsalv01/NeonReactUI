import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../stores/authStore'
import { Spinner } from '../../ui'

export const AuthCallback = () => {
  const navigate = useNavigate()
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await initializeAuth()
        navigate('/dashboard', { replace: true })
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/login', { replace: true })
      }
    }

    handleCallback()
  }, [initializeAuth, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gs-bg">
      <div className="text-center">
        <Spinner />
        <p className="mt-4 text-gs-soft">Completing your sign-in...</p>
      </div>
    </div>
  )
}
