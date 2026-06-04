import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../stores/authStore'
import { supabase } from '../../../lib/supabase'
import { useToast } from '../../ui'
import { Button, InputField, Alert, Spinner } from '../../ui'
import Icon from '../../ui/Icon'
import { FiMail } from 'react-icons/fi'

const MicrosoftLogo = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1"  y="1"  width="9" height="9" fill="#F25022" />
    <rect x="11" y="1"  width="9" height="9" fill="#7FBA00" />
    <rect x="1"  y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
)

export const Login = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setServerError(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      await initializeAuth()
      toast.success('Welcome back!')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setServerError(error.message)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    setServerError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email profile openid',
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      setServerError(error.message)
      toast.error(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gs-bg">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00C9A7, #0EA5E9)' }}
            >
              <Icon name="compass" size={20} color="#0D0F14" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Geo<span className="text-gs-accent">Stock</span>
            </span>
          </div>
          <p className="text-gs-soft text-[13px]">Sistema de Control de Inventarios</p>
          <p className="text-gs-muted text-[11px] font-mono mt-1">GEOTOP SAC — v1.0</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          {serverError && (
            <Alert
              variant="danger"
              onDismiss={() => setServerError(null)}
            >
              {serverError}
            </Alert>
          )}

          <InputField label="Email" error={errors.email}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-gs-surface border border-gs-border rounded-lg
                       focus:outline-none focus:border-gs-accent focus:ring-1 focus:ring-gs-accent
                       text-gs-text placeholder-gs-muted transition-colors"
              disabled={isLoading}
            />
          </InputField>

          <InputField label="Password" error={errors.password}>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-gs-surface border border-gs-border rounded-lg
                       focus:outline-none focus:border-gs-accent focus:ring-1 focus:ring-gs-accent
                       text-gs-text placeholder-gs-muted transition-colors"
              disabled={isLoading}
            />
          </InputField>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full h-10 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Spinner size={16} />
                Signing in...
              </>
            ) : (
              <>
                <FiMail size={18} />
                Sign in with Email
              </>
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gs-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gs-bg text-gs-soft">Or continue with</span>
          </div>
        </div>

        <Button
          onClick={handleMicrosoftLogin}
          disabled={isLoading}
          variant="ghost"
          className="w-full h-10 flex items-center justify-center gap-2 border border-gs-border"
        >
          <MicrosoftLogo />
          Microsoft
        </Button>

        <p className="text-center text-gs-soft text-sm mt-6">
          Don't have an account?{' '}
          <span className="text-gs-accent cursor-not-allowed">
            Contact administrator
          </span>
        </p>
      </div>
    </div>
  )
}
