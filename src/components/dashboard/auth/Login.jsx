import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../stores/authStore'
import { supabase } from '../../../lib/supabase'
import { useToast } from '../../ui'
import { Button, InputField, Alert, Spinner } from '../../ui'
import Icon from '../../ui/Icon'
import { FiMail, FiEye, FiEyeOff } from 'react-icons/fi'
import { ROLE_LANDING } from '../../../lib/constants/permissions'
import { humanizeError } from '../../../lib/utils/errors'

// ponytail: solo aceptamos paths internos del dashboard. Bloquea
// open-redirect via localStorage envenenado.
const isSafeInternalPath = (p) => typeof p === 'string' && /^\/dashboard(\/|$|\?)/.test(p)

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
  const [showPassword, setShowPassword] = useState(false)

  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)

  useEffect(() => {
    if (!user) return
    const intendedRoute = localStorage.getItem('intended_route')
    localStorage.removeItem('intended_route')
    const role = profile?.roles?.nombre
    const fallback = ROLE_LANDING[role] || '/dashboard/inventory'
    // ponytail: landing por rol. intended_route solo si pasa whitelist interna.
    navigate(isSafeInternalPath(intendedRoute) ? intendedRoute : fallback, { replace: true })
  }, [user, profile, navigate])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'El correo es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Por favor ingresa un correo válido'
    }

    // ponytail: en login solo exigimos presencia. La política de fortaleza
    // (8+ chars, mayúscula, número) vive en CreateUserModal/EditUserDrawer
    // donde se SETEA la contraseña. Reforzarla aquí filtraría info del
    // formato exacto y bloquearía a usuarios legítimos con passwords legacy.
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
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
      toast.success('¡Bienvenido!')
      // No navegar aquí, dejar que el useEffect se encargue
      // Esto permite que use la ruta intended si existe
    } catch (error) {
      const friendly = humanizeError(error, 'No se pudo iniciar sesión')
      setServerError(friendly)
      toast.error(friendly)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    setServerError(null)
    setIsLoading(true)

    try {
      // Validate callback URL
      const callbackUrl = `${window.location.origin}/auth/callback`
      if (!callbackUrl.startsWith('http')) {
        throw new Error('URL de callback inválida')
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          // Required scopes for getting user email and profile
          scopes: 'openid profile email',
          redirectTo: callbackUrl,
          queryParams: {
            // Ensure prompt for account selection if multiple accounts
            prompt: 'select_account',
            // Force refresh to get email claim
            response_type: 'code',
          },
        },
      })

      if (error) throw error

      // Note: isLoading state will persist during OAuth redirect
      // The callback page handles the actual auth completion
    } catch (error) {
      setServerError(
        error.message ||
        'No se pudo iniciar sesión con Microsoft. Intenta de nuevo o usa el inicio con correo.'
      )
      toast.error('Falló el inicio de sesión con Microsoft. Intenta de nuevo.')
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

          <InputField label="Correo electrónico" error={errors.email}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@ejemplo.com"
              className="w-full px-4 py-2.5 bg-gs-surface border border-gs-border rounded-lg
                       focus:outline-none focus:border-gs-accent focus:ring-1 focus:ring-gs-accent
                       text-gs-text placeholder-gs-muted transition-colors"
              disabled={isLoading}
            />
          </InputField>

          <InputField label="Contraseña" error={errors.password}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-2.5 bg-gs-surface border border-gs-border rounded-lg
                         focus:outline-none focus:border-gs-accent focus:ring-1 focus:ring-gs-accent
                         text-gs-text placeholder-gs-muted transition-colors"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gs-soft
                         hover:text-gs-text transition-colors focus:outline-none
                         focus-visible:text-gs-accent disabled:cursor-not-allowed"
                tabIndex={0}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
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
                Iniciando sesión...
              </>
            ) : (
              <>
                <FiMail size={18} />
                Iniciar sesión con Correo
              </>
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gs-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gs-bg text-gs-soft">O continúa con</span>
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
          ¿No tienes una cuenta?{' '}
          <span className="text-gs-accent cursor-not-allowed">
            Contacta al administrador
          </span>
        </p>
      </div>
    </div>
  )
}
