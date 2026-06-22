import { useState, useEffect } from 'react'
import { Drawer, Button, InputField, Icon, useToast } from '../../ui'
import { FiUserX, FiUserCheck } from 'react-icons/fi'
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

export const EditProveedorDrawer = ({ open, onClose, proveedor }) => {
  const { toast } = useToast()
  const actualizarProveedor = useProveedoresStore((s) => s.actualizarProveedor)
  const desactivarProveedor = useProveedoresStore((s) => s.desactivarProveedor)
  const reactivarProveedor  = useProveedoresStore((s) => s.reactivarProveedor)

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  useEffect(() => {
    if (proveedor) {
      setForm({
        nombre:       proveedor.nombre       || '',
        ruc:          proveedor.ruc          || '',
        razon_social: proveedor.razon_social || '',
        contacto:     proveedor.contacto     || '',
        telefono:     proveedor.telefono     || '',
        email:        proveedor.email        || '',
        direccion:    proveedor.direccion    || '',
        notas:        proveedor.notas        || '',
      })
      setErrors({})
    }
  }, [proveedor, open])

  if (!proveedor) return null

  const isDirty = Object.keys(form).some(
    (k) => (form[k] || '') !== (proveedor[k] || '')
  )

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

  const handleSave = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await actualizarProveedor({ id: proveedor.id, ...form })
      toast.success('Proveedor actualizado')
      onClose()
    } catch (err) {
      const msg = err.message || 'No se pudo actualizar'
      if (msg.toLowerCase().includes('proveedores_ruc_unique')) {
        setErrors((p) => ({ ...p, ruc: 'Ya existe un proveedor con ese RUC' }))
      } else {
        toast.error('Error: ' + msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true)
    try {
      if (proveedor.active) {
        await desactivarProveedor(proveedor.id)
        toast.success('Proveedor desactivado')
      } else {
        await reactivarProveedor(proveedor.id)
        toast.success('Proveedor reactivado')
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
      title="Editar Proveedor"
      subtitle={proveedor.nombre}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cerrar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
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
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gs-soft uppercase tracking-wider font-['DM_Mono']">
            Datos del proveedor
          </h3>

          <InputField label="Nombre *" error={errors.nombre}>
            <input
              type="text"
              value={form.nombre}
              onChange={handleChange('nombre')}
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
                className={inputClass}
                disabled={isSubmitting}
              />
            </InputField>

            <InputField label="Razón social">
              <input
                type="text"
                value={form.razon_social}
                onChange={handleChange('razon_social')}
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
                className={inputClass}
                disabled={isSubmitting}
              />
            </InputField>

            <InputField label="Teléfono">
              <input
                type="text"
                value={form.telefono}
                onChange={handleChange('telefono')}
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
              className={inputClass}
              disabled={isSubmitting}
            />
          </InputField>

          <InputField label="Dirección">
            <input
              type="text"
              value={form.direccion}
              onChange={handleChange('direccion')}
              className={inputClass}
              disabled={isSubmitting}
            />
          </InputField>

          <InputField label="Notas">
            <textarea
              value={form.notas}
              onChange={handleChange('notas')}
              rows={3}
              className={inputClass + ' resize-none'}
              disabled={isSubmitting}
            />
          </InputField>
        </section>

        <section className="space-y-3 pt-4 border-t border-gs-border">
          <h3 className="text-xs font-bold text-gs-danger uppercase tracking-wider font-['DM_Mono']">
            Estado
          </h3>
          <p className="text-xs text-gs-soft">
            {proveedor.active
              ? 'El proveedor está activo y aparece en las listas de selección. Desactivarlo lo oculta pero conserva el historial de compras.'
              : 'El proveedor está desactivado. Reactívalo para que vuelva a aparecer en las listas.'}
          </p>
          <Button
            variant={proveedor.active ? 'danger' : 'primary'}
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
            className="w-full flex items-center justify-center gap-2"
          >
            {isTogglingStatus ? (
              <>
                <div className="w-4 h-4 border-2 border-gs-bg border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : proveedor.active ? (
              <>
                <FiUserX size={14} />
                Desactivar proveedor
              </>
            ) : (
              <>
                <FiUserCheck size={14} />
                Reactivar proveedor
              </>
            )}
          </Button>
        </section>
      </div>
    </Drawer>
  )
}
