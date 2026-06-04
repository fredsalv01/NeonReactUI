import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { MdErrorOutline } from 'react-icons/md'

export const NotFound = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Log 404 for debugging
    console.warn(`404: User navigated to ${window.location.pathname}`)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gs-bg">
      <div className="w-full max-w-md">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gs-card rounded-full flex items-center justify-center">
              <MdErrorOutline size={48} className="text-gs-warn" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h1 className="text-5xl font-bold text-gs-accent">404</h1>
              <p className="text-xs text-gs-muted uppercase tracking-widest">
                Page Not Found
              </p>
            </div>

            <p className="text-gs-soft text-sm">
              The page you're looking for doesn't exist or may have been moved.
            </p>
          </div>

          {/* Path Info */}
          <div className="bg-gs-surface border border-gs-border rounded-lg p-4 text-left">
            <p className="text-xs text-gs-muted font-mono mb-2">Requested Path:</p>
            <p className="text-sm text-gs-text font-mono break-all">
              {window.location.pathname}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => navigate('/dashboard', { replace: true })}
              variant="primary"
              className="w-full"
            >
              Go to Dashboard
            </Button>

            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="w-full border border-gs-border"
            >
              Go Back
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gs-muted">
            If you believe this is a mistake, please{' '}
            <button
              onClick={() => window.location.href = 'mailto:support@example.com'}
              className="text-gs-accent hover:underline"
            >
              contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
