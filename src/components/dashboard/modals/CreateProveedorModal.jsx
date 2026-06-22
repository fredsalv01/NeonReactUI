import { useState, useEffect } from 'react'
import { Modal, Button, InputField, Icon, useToast } from '../../ui'
import { useProveedoresStore } from '../../../stores/proveedoresStore'

const EMPTY_FORM = {
  nombre: '',
  ruc: '',
  razon_social: '',
  contacto: '',
  telefono: '',
  email: '',
  direccion: '',
  notas: '',
}

const inputClass =
  "w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20"

export const CreateProveedorModal = ({ open, onClose }) => {
  const { toast } = useToast()
  const crearProveedor = useProveedoresStore((s) => s.crearProveedor)

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM)
      setErrors({})
    }
  }, [open])

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Email inválido'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await crearProveedor(form)
      toast.success('Proveedor creado correctamente')
      onClose()
    } catch (err) {
      const msg = err.message || 'No se pudo crear el proveedor'
      if (msg.toLowerCase().includes('proveedores_ruc_unique')) {
        setErrors((p) => ({ ...p, ruc: 'Ya existe un proveedor con ese RUC' }))
      } else {
        toast.error('Error: ' + msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title="Nuevo Proveedor"
      subtitle="Sólo el nombre es obligatorio — los demás campos los puedes completar después"
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
                Crear Proveedor
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <InputField label="Nombre *" error={errors.nombre}>
          <input
            type="text"
            value={form.nombre}
            onChange={handleChange('nombre')}
            placeholder="Ej. Distribuidora Andina S.A.C."
            className={inputClass}
            disabled={isSubmitting}
          />
        </InputField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="RUC" error={errors.ruc}>
            <input
              type="text"
              value={form.ruc}
              onChange={handleChange('ruc')}
              placeholder="20123456789"
              className={inputClass}
              disabled={isSubmitting}
            />
          </InputField>

          <InputField label="Razón social">
            <input
              type="text"
              value={form.razon_social}
              onChange={handleChange('razon_social')}
              placeholder="Nombre legal"
              className={inputClass}
              disabled={isSubmitting}
            />
          </InputField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Contacto">
            <input
              type="text"
              value={form.contacto}
              onChange={handleChange('contacto')}
              placeholder="Persona de contacto"
              className={inputClass}
              disabled={isSubmitting}
            />
          </InputField>

          <InputField label="Teléfono">
            <input
              type="text"
              value={form.telefono}
              onChange={handleChange('telefono')}
              placeholder="+51 999 999 999"
              className={inputClass}
              disabled={isSubmitting}
            />
          </InputField>
        </div>

        <InputField label="Email" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="contacto@proveedor.com"
            className={inputClass}
            disabled={isSubmitting}
          />
        </InputField>

        <InputField label="Dirección">
          <input
            type="text"
            value={form.direccion}
            onChange={handleChange('direccion')}
            placeholder="Av. Principal 123, Lima"
            className={inputClass}
            disabled={isSubmitting}
          />
        </InputField>

        <InputField label="Notas">
          <textarea
            value={form.notas}
            onChange={handleChange('notas')}
            rows={3}
            placeholder="Información adicional, condiciones de pago, etc."
            className={inputClass + ' resize-none'}
            disabled={isSubmitting}
          />
        </InputField>
      </div>
    </Modal>
  )
}
