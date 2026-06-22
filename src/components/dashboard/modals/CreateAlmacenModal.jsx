import { useState, useEffect } from 'react'
import { Modal, Button, InputField, Select, Icon, useToast } from '../../ui'
import { useAlmacenesStore } from '../../../stores/almacenesStore'

const EMPTY_FORM = {
  nombre: '',
  direccion: '',
  responsable_id: '',
}

const inputClass =
  "w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20"

export const CreateAlmacenModal = ({ open, onClose }) => {
  const { toast } = useToast()
  const crearAlmacen  = useAlmacenesStore((s) => s.crearAlmacen)
  const perfiles      = useAlmacenesStore((s) => s.perfiles)
  const fetchPerfiles = useAlmacenesStore((s) => s.fetchPerfiles)

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (perfiles.length === 0) fetchPerfiles().catch(() => {})
    } else {
      setForm(EMPTY_FORM)
      setErrors({})
    }
  }, [open, perfiles.length, fetchPerfiles])

  const handleChange = (field) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await crearAlmacen({
        nombre: form.nombre,
        direccion: form.direccion,
        responsable_id: form.responsable_id || null,
      })
      toast.success('Almacén creado correctamente')
      onClose()
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo crear el almacén'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const perfilesOptions = [
    { value: '', label: 'Sin asignar' },
    ...perfiles.map((p) => ({ value: p.id, label: p.nombre || p.email })),
  ]

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title="Nuevo Almacén"
      subtitle="Define un punto físico donde se almacena inventario"
      size="md"
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
                Crear Almacén
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
            placeholder="Ej. Sucursal Lima Centro"
            className={inputClass}
            disabled={isSubmitting}
          />
        </InputField>

        <InputField label="Dirección">
          <input
            type="text"
            value={form.direccion}
            onChange={handleChange('direccion')}
            placeholder="Av. Principal 123"
            className={inputClass}
            disabled={isSubmitting}
          />
        </InputField>

        <InputField label="Responsable">
          <Select
            value={form.responsable_id}
            onChange={(v) => handleChange('responsable_id')(v)}
            options={perfilesOptions}
            placeholder="Selecciona un responsable…"
          />
        </InputField>
      </div>
    </Modal>
  )
}
