import { useState, useEffect } from 'react'
import {
  Modal,
  Button,
  InputField,
  Select,
  Icon,
  PasswordStrength,
  useToast,
} from '../../ui'
import { FiEye, FiEyeOff, FiCopy, FiRefreshCw } from 'react-icons/fi'
import { useUsuariosStore } from '../../../stores/usuariosStore'
import {
  ROLE_OPTIONS,
  generateSecurePassword,
  passwordChecks,
  PASSWORD_MIN_LENGTH,
} from '../../../lib/constants/userConstants'

const EMPTY_FORM = {
  nombre: '',
  email: '',
  password: '',
  passwordConfirm: '',
  rol_id: '',
}

export const CreateUserModal = ({ open, onClose }) => {
  const { toast } = useToast()
  const crearUsuario = useUsuariosStore((s) => s.crearUsuario)

  const [formData, setFormData]   = useState(EMPTY_FORM)
  const [errors, setErrors]       = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setFormData(EMPTY_FORM)
      setErrors({})
      setShowPassword(false)
      setShowConfirm(false)
    }
  }, [open])

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e
    setFormData((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const handleGenerate = async () => {
    const pwd = generateSecurePassword(16)
    setFormData((p) => ({ ...p, password: pwd, passwordConfirm: pwd }))
    setShowPassword(true)
    setShowConfirm(true)
    try {
      await navigator.clipboard.writeText(pwd)
      toast.success('Contraseña generada y copiada al portapapeles')
    } catch {
      toast.info('Contraseña generada (no se pudo copiar al portapapeles)')
    }
  }

  const handleCopy = async () => {
    if (!formData.password) return
    try {
      await navigator.clipboard.writeText(formData.password)
      toast.success('Contraseña copiada')
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  const validate = () => {
    const e = {}
    if (!formData.nombre.trim()) e.nombre = 'Nombre requerido'
    if (!formData.email.trim()) e.email = 'Email requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email inválido'

    const c = passwordChecks(formData.password)
    if (!formData.password) e.password = 'Contraseña requerida'
    else if (!c.length) e.password = `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`
    else if (!(c.uppercase && c.lowercase && c.number)) {
      e.password = 'Debe incluir mayúscula, minúscula y número'
    }

    if (formData.password !== formData.passwordConfirm) {
      e.passwordConfirm = 'Las contraseñas no coinciden'
    }
    if (!formData.rol_id) e.rol_id = 'Selecciona un rol'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await crearUsuario({
        nombre:   formData.nombre.trim(),
        email:    formData.email.trim().toLowerCase(),
        password: formData.password,
        rol_id:   Number(formData.rol_id),
      })
      toast.success('Usuario creado correctamente')
      onClose()
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo crear el usuario'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title="Nuevo Usuario"
      subtitle="Crea una cuenta y asigna un rol"
      size="lg"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[160px] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-gs-bg border-t-transparent rounded-full animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Icon name="check" size={16} />
                Crear Usuario
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Datos personales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Nombre completo" error={errors.nombre}>
            <input
              type="text"
              value={formData.nombre}
              onChange={handleChange('nombre')}
              placeholder="Ej. Juan Pérez"
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20"
              disabled={isSubmitting}
            />
          </InputField>

          <InputField label="Email" error={errors.email}>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="usuario@dominio.com"
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20"
              disabled={isSubmitting}
              autoComplete="off"
            />
          </InputField>
        </div>

        {/* Rol */}
        <InputField label="Rol" error={errors.rol_id}>
          <Select
            value={formData.rol_id}
            onChange={(v) => handleChange('rol_id')(v)}
            options={ROLE_OPTIONS}
            placeholder="Selecciona un rol"
          />
        </InputField>

        {/* Sección contraseña */}
        <div className="space-y-3 pt-2 border-t border-gs-border">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gs-soft uppercase tracking-wider font-['DM_Mono']">
              Contraseña
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 text-xs text-gs-accent hover:text-gs-accent/80 transition-colors cursor-pointer"
            >
              <FiRefreshCw size={12} />
              Generar segura
            </button>
          </div>

          <InputField label="Contraseña" error={errors.password}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="Mínimo 8 caracteres, mayúscula, minúscula y número"
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20 pr-20"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {formData.password && (
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
                  title={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </div>
          </InputField>

          {formData.password && <PasswordStrength password={formData.password} />}

          <InputField label="Confirmar contraseña" error={errors.passwordConfirm}>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={formData.passwordConfirm}
                onChange={handleChange('passwordConfirm')}
                placeholder="Repite la contraseña"
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20 pr-10"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gs-muted hover:text-gs-text transition-colors cursor-pointer"
              >
                {showConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </InputField>
        </div>
      </div>
    </Modal>
  )
}
