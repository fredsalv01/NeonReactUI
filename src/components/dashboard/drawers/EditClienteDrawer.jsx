import { useState, useEffect } from 'react'
import { Drawer, Button, InputField, Select, Icon, useToast } from '../../ui'
import { FiUserX, FiUserCheck } from 'react-icons/fi'
import { useClientesStore } from '../../../stores/clientesStore'
import { TIPOS_DOCUMENTO } from '../../../lib/constants/clienteConstants'

const EMPTY_FORM = {
  nombre: '',
  tipo_doc: '',
  nro_doc: '',
  razon_social: '',
  telefono: '',
  email: '',
  direccion: '',
  notas: '',
}

const inputClass =
  "w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20"

export const EditClienteDrawer = ({ open, onClose, cliente }) => {
  const { toast } = useToast()
  const actualizarCliente = useClientesStore((s) => s.actualizarCliente)
  const desactivarCliente = useClientesStore((s) => s.desactivarCliente)
  const reactivarCliente  = useClientesStore((s) => s.reactivarCliente)

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  useEffect(() => {
    if (cliente) {
      setForm({
        nombre:       cliente.nombre       || '',
        tipo_doc:     cliente.tipo_doc     || '',
        nro_doc:      cliente.nro_doc      || '',
        razon_social: cliente.razon_social || '',
        telefono:     cliente.telefono     || '',
        email:        cliente.email        || '',
        direccion:    cliente.direccion    || '',
        notas:        cliente.notas        || '',
      })
      setErrors({})
    }
  }, [cliente, open])

  if (!cliente) return null

  const isDirty = Object.keys(form).some(
    (k) => (form[k] || '') !== (cliente[k] || '')
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
    const hasTipo = !!form.tipo_doc
    const hasNro  = !!form.nro_doc?.trim()
    if (hasTipo && !hasNro) e.nro_doc = 'Falta el número de documento'
    if (hasNro && !hasTipo) e.tipo_doc = 'Selecciona el tipo de documento'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await actualizarCliente({ id: cliente.id, ...form })
      toast.success('Cliente actualizado')
      onClose()
    } catch (err) {
      const msg = err.message || 'No se pudo actualizar'
      if (msg.toLowerCase().includes('clientes_doc_unique')) {
        setErrors((p) => ({ ...p, nro_doc: 'Ya existe un cliente con ese documento' }))
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
      if (cliente.active) {
        await desactivarCliente(cliente.id)
        toast.success('Cliente desactivado')
      } else {
        await reactivarCliente(cliente.id)
        toast.success('Cliente reactivado')
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
      title="Editar Cliente"
      subtitle={cliente.nombre}
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
            Datos del cliente
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
            <InputField label="Tipo de documento" error={errors.tipo_doc}>
              <Select
                value={form.tipo_doc}
                onChange={(v) => handleChange('tipo_doc')(v)}
                options={[{ value: '', label: '—' }, ...TIPOS_DOCUMENTO]}
                placeholder="Selecciona…"
              />
            </InputField>

            <InputField label="N° de documento" error={errors.nro_doc}>
              <input
                type="text"
                value={form.nro_doc}
                onChange={handleChange('nro_doc')}
                className={inputClass}
                disabled={isSubmitting}
              />
            </InputField>
          </div>

          <InputField label="Razón social">
            <input
              type="text"
              value={form.razon_social}
              onChange={handleChange('razon_social')}
              className={inputClass}
              disabled={isSubmitting}
            />
          </InputField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Teléfono">
              <input
                type="text"
                value={form.telefono}
                onChange={handleChange('telefono')}
                className={inputClass}
                disabled={isSubmitting}
              />
            </InputField>

            <InputField label="Email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                className={inputClass}
                disabled={isSubmitting}
              />
            </InputField>
          </div>

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
            {cliente.active
              ? 'El cliente está activo y aparece en las listas de selección. Desactivarlo lo oculta pero conserva el historial de ventas.'
              : 'El cliente está desactivado. Reactívalo para que vuelva a aparecer en las listas.'}
          </p>
          <Button
            variant={cliente.active ? 'danger' : 'primary'}
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
            className="w-full flex items-center justify-center gap-2"
          >
            {isTogglingStatus ? (
              <>
                <div className="w-4 h-4 border-2 border-gs-bg border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : cliente.active ? (
              <>
                <FiUserX size={14} />
                Desactivar cliente
              </>
            ) : (
              <>
                <FiUserCheck size={14} />
                Reactivar cliente
              </>
            )}
          </Button>
        </section>
      </div>
    </Drawer>
  )
}
