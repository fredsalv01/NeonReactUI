import { useState, useEffect } from 'react'
import { Modal, Button, InputField, Select, Icon, useToast } from '../../ui'
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

export const CreateClienteModal = ({ open, onClose }) => {
  const { toast } = useToast()
  const crearCliente = useClientesStore((s) => s.crearCliente)

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
    // Si pone uno de los dos campos de doc, debe poner el otro
    const hasTipo = !!form.tipo_doc
    const hasNro  = !!form.nro_doc?.trim()
    if (hasTipo && !hasNro) e.nro_doc = 'Falta el número de documento'
    if (hasNro && !hasTipo) e.tipo_doc = 'Selecciona el tipo de documento'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await crearCliente(form)
      toast.success('Cliente creado correctamente')
      onClose()
    } catch (err) {
      const msg = err.message || 'No se pudo crear el cliente'
      if (msg.toLowerCase().includes('clientes_doc_unique')) {
        setErrors((p) => ({ ...p, nro_doc: 'Ya existe un cliente con ese documento' }))
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
      title="Nuevo Cliente"
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
                Crear Cliente
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
            placeholder="Ej. Juan Pérez"
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
              placeholder="12345678"
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
            placeholder="Nombre legal (si aplica)"
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
              placeholder="+51 999 999 999"
              className={inputClass}
              disabled={isSubmitting}
            />
          </InputField>

          <InputField label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="cliente@dominio.com"
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
            placeholder="Información adicional"
            className={inputClass + ' resize-none'}
            disabled={isSubmitting}
          />
        </InputField>
      </div>
    </Modal>
  )
}
