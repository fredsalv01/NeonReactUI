import { useState, useEffect } from 'react'
import {
  Drawer,
  Button,
  InputField,
  Select,
  Icon,
  PasswordStrength,
  useToast,
} from '../../ui'
import { FiEye, FiEyeOff, FiRefreshCw, FiCopy, FiUserX, FiUserCheck } from 'react-icons/fi'
import { useUsuariosStore } from '../../../stores/usuariosStore'
import { useAuth } from '../../../hooks/useAuth'
import {
  ROLE_OPTIONS,
  generateSecurePassword,
  passwordChecks,
  PASSWORD_MIN_LENGTH,
} from '../../../lib/constants/userConstants'

export const EditUserDrawer = ({ open, onClose, usuario }) => {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const actualizarUsuario  = useUsuariosStore((s) => s.actualizarUsuario)
  const cambiarPassword    = useUsuariosStore((s) => s.cambiarPassword)
  const desactivarUsuario  = useUsuariosStore((s) => s.desactivarUsuario)
  const reactivarUsuario   = useUsuariosStore((s) => s.reactivarUsuario)

  const isSelf = currentUser?.id === usuario?.id

  const [form, setForm] = useState({ nombre: '', rol_id: '' })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre || '',
        rol_id: usuario.rol_id ?? '',
      })
      setPassword('')
      setShowPassword(false)
      setErrors({})
    }
  }, [usuario, open])

  if (!usuario) return null

  const isDirty =
    form.nombre !== (usuario.nombre || '') ||
    Number(form.rol_id) !== Number(usuario.rol_id)

  const validateInfo = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido'
    if (!form.rol_id) e.rol_id = 'Rol requerido'
    if (isSelf && Number(form.rol_id) !== Number(usuario.rol_id)) {
      e.rol_id = 'No puedes cambiar tu propio rol'
    }
    setErrors((prev) => ({ ...prev, ...e }))
    return Object.keys(e).length === 0
  }

  const validatePassword = () => {
    const c = passwordChecks(password)
    if (!c.length) return `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`
    if (!(c.uppercase && c.lowercase && c.number)) {
      return 'Debe incluir mayúscula, minúscula y número'
    }
    return null
  }

  const handleSaveInfo = async () => {
    if (!validateInfo()) return
    setIsSubmitting(true)
    try {
      await actualizarUsuario({
        id:     usuario.id,
        nombre: form.nombre.trim(),
        rol_id: Number(form.rol_id),
      })
      toast.success('Usuario actualizado')
      onClose()
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo actualizar'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerate = async () => {
    const pwd = generateSecurePassword(16)
    setPassword(pwd)
    setShowPassword(true)
    try {
      await navigator.clipboard.writeText(pwd)
      toast.success('Contraseña generada y copiada')
    } catch {
      toast.info('Contraseña generada')
    }
  }

  const handleCopy = async () => {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      toast.success('Contraseña copiada')
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  const handleChangePassword = async () => {
    const err = validatePassword()
    if (err) {
      setErrors((p) => ({ ...p, password: err }))
      return
    }
    setIsChangingPassword(true)
    try {
      await cambiarPassword({ id: usuario.id, password })
      toast.success('Contraseña actualizada')
      setPassword('')
      setShowPassword(false)
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo cambiar la contraseña'))
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleToggleStatus = async () => {
    if (isSelf) {
      toast.error('No puedes desactivar tu propia cuenta')
      return
    }
    setIsTogglingStatus(true)
    try {
      if (usuario.active) {
        await desactivarUsuario(usuario.id)
        toast.success('Usuario desactivado')
      } else {
        await reactivarUsuario(usuario.id)
        toast.success('Usuario reactivado')
      }
      onClose()
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo cambiar el estado'))
    } finally {
      setIsTogglingStatus(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title="Editar Usuario"
      subtitle={usuario.email}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cerrar
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveInfo}
            disabled={isSubmitting || !isDirty}
            className="min-w-[140px] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-gs-bg border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Icon name="check" size={16} />
                Guardar
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {isSelf && (
          <div className="text-xs text-gs-soft bg-gs-bg border border-gs-border rounded-lg px-3 py-2 font-['DM_Mono']">
            ⚠ Esta es tu propia cuenta. No puedes cambiar tu rol ni desactivarte.
          </div>
        )}

        {/* ─── Información ─────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gs-soft uppercase tracking-wider font-['DM_Mono']">
            Información
          </h3>

          <InputField label="Email">
            <input
              type="email"
              value={usuario.email}
              disabled
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20 opacity-60 cursor-not-allowed"
            />
            <p className="text-[10px] text-gs-muted mt-1 font-['DM_Mono']">
              El email no se puede editar (atado a la cuenta de autenticación)
            </p>
          </InputField>

          <InputField label="Nombre completo" error={errors.nombre}>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => {
                setForm((p) => ({ ...p, nombre: e.target.value }))
                if (errors.nombre) setErrors((p) => ({ ...p, nombre: '' }))
              }}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20"
              disabled={isSubmitting}
            />
          </InputField>

          <InputField label="Rol" error={errors.rol_id}>
            <Select
              value={form.rol_id}
              onChange={(v) => {
                setForm((p) => ({ ...p, rol_id: v }))
                if (errors.rol_id) setErrors((p) => ({ ...p, rol_id: '' }))
              }}
              options={ROLE_OPTIONS}
              placeholder="Selecciona un rol"
              disabled={isSelf || isSubmitting}
            />
          </InputField>
        </section>

        {/* ─── Seguridad ───────────────────────────────── */}
        <section className="space-y-3 pt-4 border-t border-gs-border">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gs-soft uppercase tracking-wider font-['DM_Mono']">
              Cambiar contraseña
            </h3>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isChangingPassword}
              className="flex items-center gap-1.5 text-xs text-gs-accent hover:text-gs-accent/80 transition-colors cursor-pointer"
            >
              <FiRefreshCw size={12} />
              Generar
            </button>
          </div>

          <InputField label="Nueva contraseña" error={errors.password}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((p) => ({ ...p, password: '' }))
                }}
                placeholder="Deja en blanco para no cambiar"
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20 pr-20"
                disabled={isChangingPassword}
                autoComplete="new-password"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {password && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 text-gs-muted hover:text-gs-text transition-colors cursor-pointer"
                    title="Copiar"
                  >
                    <FiCopy size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="p-1.5 text-gs-muted hover:text-gs-text transition-colors cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </div>
          </InputField>

          {password && <PasswordStrength password={password} />}

          <Button
            variant="ghost"
            onClick={handleChangePassword}
            disabled={!password || isChangingPassword}
            className="w-full flex items-center justify-center gap-2 border border-gs-border"
          >
            {isChangingPassword ? (
              <>
                <div className="w-4 h-4 border-2 border-gs-text border-t-transparent rounded-full animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Icon name="lock" size={14} />
                Actualizar contraseña
              </>
            )}
          </Button>
        </section>

        {/* ─── Zona peligrosa ──────────────────────────── */}
        <section className="space-y-3 pt-4 border-t border-gs-border">
          <h3 className="text-xs font-bold text-gs-danger uppercase tracking-wider font-['DM_Mono']">
            Estado de la cuenta
          </h3>
          <p className="text-xs text-gs-soft">
            {usuario.active
              ? 'Esta cuenta está activa. Desactivar impide el acceso al sistema sin eliminar los registros asociados.'
              : 'Esta cuenta está desactivada. Reactivar permite que el usuario vuelva a iniciar sesión.'}
          </p>
          <Button
            variant={usuario.active ? 'danger' : 'primary'}
            onClick={handleToggleStatus}
            disabled={isTogglingStatus || isSelf}
            className="w-full flex items-center justify-center gap-2"
          >
            {isTogglingStatus ? (
              <>
                <div className="w-4 h-4 border-2 border-gs-bg border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : usuario.active ? (
              <>
                <FiUserX size={14} />
                Desactivar usuario
              </>
            ) : (
              <>
                <FiUserCheck size={14} />
                Reactivar usuario
              </>
            )}
          </Button>
        </section>
      </div>
    </Drawer>
  )
}
