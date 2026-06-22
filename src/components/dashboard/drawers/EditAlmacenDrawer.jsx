import { useState, useEffect } from 'react'
import { Drawer, Button, InputField, Select, Icon, useToast } from '../../ui'
import { FiUserX, FiUserCheck } from 'react-icons/fi'
import { useAlmacenesStore } from '../../../stores/almacenesStore'
import { ALMACEN_PRINCIPAL_ID } from '../../../lib/constants/almacenConstants'

const EMPTY_FORM = {
  nombre: '',
  direccion: '',
  responsable_id: '',
}

const inputClass =
  "w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20"

export const EditAlmacenDrawer = ({ open, onClose, almacen }) => {
  const { toast } = useToast()
  const actualizarAlmacen = useAlmacenesStore((s) => s.actualizarAlmacen)
  const desactivarAlmacen = useAlmacenesStore((s) => s.desactivarAlmacen)
  const reactivarAlmacen  = useAlmacenesStore((s) => s.reactivarAlmacen)
  const perfiles          = useAlmacenesStore((s) => s.perfiles)
  const fetchPerfiles     = useAlmacenesStore((s) => s.fetchPerfiles)

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  useEffect(() => {
    if (almacen) {
      setForm({
        nombre:         almacen.nombre         || '',
        direccion:      almacen.direccion      || '',
        responsable_id: almacen.responsable_id || '',
      })
      setErrors({})
      if (perfiles.length === 0) fetchPerfiles().catch(() => {})
    }
  }, [almacen, open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!almacen) return null

  const isPrincipal = almacen.id === ALMACEN_PRINCIPAL_ID

  const isDirty =
    form.nombre !== (almacen.nombre || '') ||
    form.direccion !== (almacen.direccion || '') ||
    (form.responsable_id || '') !== (almacen.responsable_id || '')

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

  const handleSave = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await actualizarAlmacen({
        id: almacen.id,
        nombre: form.nombre,
        direccion: form.direccion,
        responsable_id: form.responsable_id || null,
      })
      toast.success('Almacén actualizado')
      onClose()
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo actualizar'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async () => {
    if (isPrincipal) {
      toast.error('No puedes desactivar el almacén Principal')
      return
    }
    setIsTogglingStatus(true)
    try {
      if (almacen.active) {
        await desactivarAlmacen(almacen.id)
        toast.success('Almacén desactivado')
      } else {
        await reactivarAlmacen(almacen.id)
        toast.success('Almacén reactivado')
      }
      onClose()
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo cambiar el estado'))
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const perfilesOptions = [
    { value: '', label: 'Sin asignar' },
    ...perfiles.map((p) => ({ value: p.id, label: p.nombre || p.email })),
  ]

  return (
    <Drawer
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title="Editar Almacén"
      subtitle={almacen.nombre}
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
        {isPrincipal && (
          <div className="text-xs text-gs-soft bg-gs-bg border border-gs-border rounded-lg px-3 py-2 font-['DM_Mono']">
            ⚠ Este es el almacén Principal del sistema. No puede desactivarse.
          </div>
        )}

        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gs-soft uppercase tracking-wider font-['DM_Mono']">
            Datos del almacén
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

          <InputField label="Dirección">
            <input
              type="text"
              value={form.direccion}
              onChange={handleChange('direccion')}
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
        </section>

        <section className="space-y-3 pt-4 border-t border-gs-border">
          <h3 className="text-xs font-bold text-gs-danger uppercase tracking-wider font-['DM_Mono']">
            Estado
          </h3>
          <p className="text-xs text-gs-soft">
            {almacen.active
              ? 'El almacén está activo. Desactivarlo lo oculta de las listas pero conserva el stock y movimientos históricos.'
              : 'El almacén está desactivado. Reactívalo para que vuelva a aparecer en las listas.'}
          </p>
          <Button
            variant={almacen.active ? 'danger' : 'primary'}
            onClick={handleToggleStatus}
            disabled={isTogglingStatus || isPrincipal}
            className="w-full flex items-center justify-center gap-2"
          >
            {isTogglingStatus ? (
              <>
                <div className="w-4 h-4 border-2 border-gs-bg border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : almacen.active ? (
              <>
                <FiUserX size={14} />
                Desactivar almacén
              </>
            ) : (
              <>
                <FiUserCheck size={14} />
                Reactivar almacén
              </>
            )}
          </Button>
        </section>
      </div>
    </Drawer>
  )
}
