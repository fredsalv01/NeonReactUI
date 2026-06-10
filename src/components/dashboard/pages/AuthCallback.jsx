import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../stores/authStore'
import { supabase } from '../../../lib/supabase'
import { Spinner, Alert, Button } from '../../ui'
import { MdError, MdCheckCircle } from 'react-icons/md'

const CALLBACK_TIMEOUT = 10000 // 10 seconds
const PROGRESS_STEPS = [
  { label: 'Verificando credenciales...', delay: 0 },
  { label: 'Inicializando sesión...', delay: 2000 },
  { label: 'Preparando tu espacio de trabajo...', delay: 5000 },
]

export const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const user = useAuthStore((state) => state.user)

  const [status, setStatus] = useState('loading') // loading, success, error, timeout
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [callbackProcessed, setCallbackProcessed] = useState(false)
  const timeoutRef = useRef(null)
  const stepRef = useRef(null)
  const processRef = useRef(false)

  // Check for OAuth error from Supabase
  const errorDescription = searchParams.get('error_description')
  const errorCode = searchParams.get('error')

  // Helper function to get redirect path
  const getRedirectPath = () => {
    const intendedRoute = localStorage.getItem('intended_route')
    if (intendedRoute) {
      localStorage.removeItem('intended_route')
      return intendedRoute
    }
    return '/dashboard'
  }

  useEffect(() => {
    // If user is already authenticated, skip callback processing
    if (user && !callbackProcessed) {
      navigate(getRedirectPath(), { replace: true })
      return
    }

    // If there was an OAuth error from Supabase, show it
    if (errorCode || errorDescription) {
      setStatus('error')
      setError(
        errorDescription ||
        'Ocurrió un error de OAuth. Por favor intenta iniciar sesión de nuevo.'
      )
      return
    }

    // Prevent double processing on refresh
    if (processRef.current) return
    processRef.current = true

    let isMounted = true

    const handleCallback = async () => {
      try {
        // Check if session already exists (handles page refresh during callback)
        const {
          data: { session: existingSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (existingSession && isMounted) {
          // Session already exists, initialize auth store and redirect
          await initializeAuth()
          setCallbackProcessed(true)
          setStatus('success')

          setTimeout(() => {
            if (isMounted) {
              navigate(getRedirectPath(), { replace: true })
            }
          }, 800)
          return
        }

        if (sessionError) {
          throw new Error('No se pudo verificar la sesión: ' + sessionError.message)
        }

        // Set timeout for auth process
        timeoutRef.current = setTimeout(() => {
          if (isMounted) {
            setStatus('timeout')
            setError('La autenticación tardó demasiado. Por favor intenta de nuevo.')
          }
        }, CALLBACK_TIMEOUT)

        // Progress indication
        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => {
            const next = prev + 1
            if (next >= PROGRESS_STEPS.length) {
              clearInterval(stepInterval)
            }
            return next
          })
        }, 2000)
        stepRef.current = stepInterval

        // Initialize auth with session verification
        await initializeAuth()

        if (isMounted) {
          clearTimeout(timeoutRef.current)
          clearInterval(stepInterval)
          setCallbackProcessed(true)
          setStatus('success')

          // Brief success state before navigation
          setTimeout(() => {
            if (isMounted) {
              navigate(getRedirectPath(), { replace: true })
            }
          }, 800)
        }
      } catch (error) {
        if (isMounted) {
          clearTimeout(timeoutRef.current)
          clearInterval(stepRef.current)

          console.error('Auth callback error:', error)

          // Determine error type
          if (error.message?.includes('session')) {
            setError('Tu sesión es inválida o ha expirado. Por favor inicia sesión de nuevo.')
          } else if (
            error.message?.includes('oauth') ||
            error.message?.includes('provider')
          ) {
            setError('Falló la autenticación OAuth. Intenta de nuevo o contacta a soporte.')
          } else {
            setError(
              error.message ||
              'Ocurrió un error durante la autenticación. Por favor intenta de nuevo.'
            )
          }

          setStatus('error')
        }
      }
    }

    handleCallback()

    // Cleanup
    return () => {
      isMounted = false
      clearTimeout(timeoutRef.current)
      clearInterval(stepRef.current)
    }
  }, [initializeAuth, navigate, user, errorCode, errorDescription, callbackProcessed])

  const handleRetry = () => {
    // Reset processing flag to allow retry
    processRef.current = false
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gs-bg">
      <div className="w-full max-w-md">
        {/* Loading State */}
        {status === 'loading' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Spinner size={48} />
            </div>

            {/* Progress message */}
            <div className="space-y-2">
              <p className="text-gs-text font-medium">
                {PROGRESS_STEPS[Math.min(currentStep, PROGRESS_STEPS.length - 1)]?.label}
              </p>

              {/* Progress bar */}
              <div className="h-1 bg-gs-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gs-accent to-gs-teal transition-all duration-500"
                  style={{
                    width: `${((currentStep + 1) / PROGRESS_STEPS.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <p className="text-gs-soft text-sm">
              Por favor no cierres esta ventana
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gs-card rounded-full flex items-center justify-center">
                <MdCheckCircle size={40} className="text-gs-accent" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gs-text">¡Bienvenido!</h2>
              <p className="text-gs-soft text-sm">
                Redirigiendo a tu panel...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gs-card rounded-full flex items-center justify-center">
                  <MdError size={40} className="text-gs-danger" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gs-text">
                  Autenticación fallida
                </h2>
                <p className="text-gs-soft text-sm">
                  No pudimos completar tu inicio de sesión
                </p>
              </div>
            </div>

            <Alert variant="danger" className="text-sm">
              {error}
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                variant="primary"
                className="w-full"
              >
                Intentar de nuevo
              </Button>

              <Button
                onClick={() => window.location.href = 'https://support.example.com'}
                variant="ghost"
                className="w-full border border-gs-border"
              >
                Obtener ayuda
              </Button>
            </div>

            <p className="text-xs text-gs-muted text-center">
              Los detalles del error han sido registrados. Si el problema persiste, contacta a soporte.
            </p>
          </div>
        )}

        {/* Timeout State */}
        {status === 'timeout' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gs-card rounded-full flex items-center justify-center">
                  <MdError size={40} className="text-gs-warn" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gs-text">
                  Tiempo de inicio de sesión agotado
                </h2>
                <p className="text-gs-soft text-sm">
                  La autenticación tardó más de lo esperado
                </p>
              </div>
            </div>

            <Alert variant="warn" className="text-sm">
              {error}
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                variant="primary"
                className="w-full"
              >
                Comenzar de nuevo
              </Button>

              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full border border-gs-border"
              >
                Volver al inicio
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
