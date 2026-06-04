import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../stores/authStore'
import { Spinner, Alert, Button } from '../../ui'
import { MdError, MdCheckCircle } from 'react-icons/md'

const CALLBACK_TIMEOUT = 10000 // 10 seconds
const PROGRESS_STEPS = [
  { label: 'Verifying credentials...', delay: 0 },
  { label: 'Initializing session...', delay: 2000 },
  { label: 'Setting up your workspace...', delay: 5000 },
]

export const AuthCallback = () => {
  const navigate = useNavigate()
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  const [status, setStatus] = useState('loading') // loading, success, error, timeout
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const timeoutRef = useRef(null)
  const stepRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const handleCallback = async () => {
      try {
        // Set timeout for auth process
        timeoutRef.current = setTimeout(() => {
          if (isMounted) {
            setStatus('timeout')
            setError('Authentication took too long. Please try again.')
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
          setStatus('success')

          // Brief success state before navigation
          setTimeout(() => {
            if (isMounted) {
              navigate('/dashboard', { replace: true })
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
            setError('Your session is invalid or expired. Please sign in again.')
          } else if (error.message?.includes('oauth') || error.message?.includes('provider')) {
            setError('OAuth authentication failed. Please try again or contact support.')
          } else {
            setError(error.message || 'An error occurred during authentication. Please try again.')
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
  }, [initializeAuth, navigate])

  const handleRetry = () => {
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
              Please don't close this window
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
              <h2 className="text-xl font-semibold text-gs-text">Welcome!</h2>
              <p className="text-gs-soft text-sm">
                Redirecting to your dashboard...
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
                  Authentication Failed
                </h2>
                <p className="text-gs-soft text-sm">
                  We couldn't complete your sign-in
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
                Try Again
              </Button>

              <Button
                onClick={() => window.location.href = 'https://support.example.com'}
                variant="ghost"
                className="w-full border border-gs-border"
              >
                Get Help
              </Button>
            </div>

            <p className="text-xs text-gs-muted text-center">
              Error details have been logged. If the problem persists, contact support.
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
                  Sign-in Timeout
                </h2>
                <p className="text-gs-soft text-sm">
                  The authentication took longer than expected
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
                Start Over
              </Button>

              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full border border-gs-border"
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
