import { useState, useEffect, useMemo } from 'react'
import { Modal, Button, InputField, NumberInput, Select, Icon, useToast } from '../../ui'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useCotizacionStore } from '../../../stores/cotizacionStore'
import { useAuth } from '../../../hooks/useAuth'
import { clienteService } from '../../../lib/services/clienteService'
import { equipoService } from '../../../lib/services/equipoService'

const todayIso = () => new Date().toISOString().slice(0, 10)

const EMPTY_HEADER = {
  cliente_id: '',
  fecha: todayIso(),
  notas: '',
}

const newItem = () => ({
  key: crypto.randomUUID(),
  equipo_id: '',
  cantidad: 1,
  precio_unitario: 0,
})

const inputClass =
  "w-full px-3 py-2 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20"

const formatCurrency = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0)

export const CreateCotizacionModal = ({ open, onClose }) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const addCotizacion = useCotizacionStore((s) => s.addCotizacion)

  const [header, setHeader] = useState(EMPTY_HEADER)
  const [items, setItems]   = useState([newItem()])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [equipos,  setEquipos]  = useState([])
  const [clientes, setClientes] = useState([])
  const [isLoadingCat, setIsLoadingCat] = useState(false)

  useEffect(() => {
    if (!open) {
      setHeader(EMPTY_HEADER)
      setItems([newItem()])
      setErrors({})
      return
    }

    let cancelled = false
    const loadCatalogs = async () => {
      setIsLoadingCat(true)
      try {
        const [eq, cli] = await Promise.all([
          equipoService.getEquipos(),
          clienteService.fetchClientes({ page: 1, pageSize: 500, status: 'active' }),
        ])
        if (cancelled) return
        setEquipos(eq || [])
        setClientes(cli.data || [])
      } catch (err) {
        if (!cancelled) toast.error('Error cargando catálogos: ' + err.message)
      } finally {
        if (!cancelled) setIsLoadingCat(false)
      }
    }
    loadCatalogs()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const updateHeader = (field) => (e) => {
    const value = e?.target ? e.target.value : e
    setHeader((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const updateItem = (idx, patch) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
    if (errors.items) setErrors((p) => ({ ...p, items: '' }))
  }

  // Auto-rellena precio al elegir equipo (solo si está en 0)
  const onPickEquipo = (idx, equipoId) => {
    const eq = equipos.find((e) => e.id === equipoId)
    setItems((prev) => prev.map((it, i) => {
      if (i !== idx) return it
      const nuevo = { ...it, equipo_id: equipoId }
      if (eq && Number(it.precio_unitario) === 0) {
        nuevo.precio_unitario = Number(eq.precio_venta) || 0
      }
      return nuevo
    }))
    if (errors.items) setErrors((p) => ({ ...p, items: '' }))
  }

  const addItem = () => setItems((prev) => [...prev, newItem()])
  const removeItem = (idx) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)))

  const total = useMemo(
    () => items.reduce(
      (sum, it) => sum + (Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0),
      0
    ),
    [items]
  )

  const validate = () => {
    const e = {}
    if (!header.fecha) e.fecha = 'Fecha requerida'
    if (items.length === 0) e.items = 'Agrega al menos un item'

    for (const it of items) {
      if (!it.equipo_id) { e.items = 'Cada item necesita un equipo'; break }
      if (!(Number(it.cantidad) > 0)) { e.items = 'Las cantidades deben ser > 0'; break }
      if (!(Number(it.precio_unitario) > 0)) { e.items = 'Los precios deben ser > 0'; break }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await addCotizacion({
        cotizacion: {
          cliente_id: header.cliente_id || null,
          usuario_id: user?.id || null,
          fecha:      header.fecha,
          notas:      header.notas?.trim() || null,
        },
        items: items.map((it) => ({
          equipo_id: it.equipo_id,
          cantidad: Number(it.cantidad),
          precio_unitario: Number(it.precio_unitario),
        })),
      })
      toast.success(`Cotización registrada (${items.length} item${items.length === 1 ? '' : 's'})`)
      onClose()
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo registrar la cotización'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const equipoOptions = useMemo(() => [
    { value: '', label: 'Selecciona un equipo…' },
    ...equipos.map((e) => ({ value: e.id, label: `${e.id} · ${e.nombre}` })),
  ], [equipos])

  const clienteOptions = useMemo(() => [
    { value: '', label: 'Sin cliente' },
    ...clientes.map((c) => ({
      value: c.id,
      label: c.nro_doc ? `${c.nombre} · ${c.tipo_doc} ${c.nro_doc}` : c.nombre,
    })),
  ], [clientes])

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title="Nueva Cotización"
      subtitle="No descuenta stock — eso ocurre al convertir la cotización en venta."
      size="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-sm">
            <span className="text-gs-muted">Total: </span>
            <span className="text-gs-text font-bold font-['DM_Mono']">{formatCurrency(total)}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoadingCat}
              className="min-w-[180px] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gs-bg border-t-transparent rounded-full animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Icon name="check" size={16} />
                  Crear Cotización
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Cliente">
            <Select
              value={header.cliente_id}
              onChange={(v) => updateHeader('cliente_id')(v)}
              options={clienteOptions}
              placeholder="Sin cliente"
            />
          </InputField>

          <InputField label="Fecha *" error={errors.fecha}>
            <input
              type="date"
              value={header.fecha}
              onChange={updateHeader('fecha')}
              className={inputClass}
              disabled={isSubmitting}
            />
          </InputField>

          <InputField label="Notas" className="md:col-span-2">
            <input
              type="text"
              value={header.notas}
              onChange={updateHeader('notas')}
              placeholder="Información adicional"
              className={inputClass}
              disabled={isSubmitting}
            />
          </InputField>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gs-soft uppercase tracking-wider font-['DM_Mono']">
              Items {items.length > 0 && <span className="text-gs-muted">({items.length})</span>}
            </h3>
            <button
              type="button"
              onClick={addItem}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 text-xs text-gs-accent hover:text-gs-accent/80 transition-colors cursor-pointer"
            >
              <FiPlus size={12} /> Agregar item
            </button>
          </div>

          {errors.items && <div className="text-xs text-gs-danger">{errors.items}</div>}

          <div className="hidden md:grid md:grid-cols-12 gap-2 px-3 text-[11px] text-gs-soft font-['DM_Mono'] uppercase tracking-[0.8px]">
            <div className="md:col-span-4">Equipo</div>
            <div className="md:col-span-2">Cantidad</div>
            <div className="md:col-span-3">Precio unit.</div>
            <div className="md:col-span-2 text-right">Subtotal</div>
            <div className="md:col-span-1"></div>
          </div>

          <div className="space-y-2">
            {items.map((it, idx) => {
              const subtotal = (Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)
              return (
                <div
                  key={it.key}
                  className="grid grid-cols-12 gap-2 items-start p-3 bg-gs-bg border border-gs-border rounded-lg"
                >
                  <div className="col-span-12 md:col-span-4">
                    <Select
                      value={it.equipo_id}
                      onChange={(v) => onPickEquipo(idx, v)}
                      options={equipoOptions}
                      placeholder="Equipo…"
                    />
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <NumberInput
                      value={it.cantidad}
                      onChange={(v) => updateItem(idx, { cantidad: v })}
                      min={1}
                      step={1}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="col-span-6 md:col-span-3">
                    <NumberInput
                      value={it.precio_unitario}
                      onChange={(v) => updateItem(idx, { precio_unitario: v })}
                      min={0}
                      step={0.01}
                      prefix="S/"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="col-span-10 md:col-span-2 text-right text-sm text-gs-text font-['DM_Mono'] font-bold">
                    {formatCurrency(subtotal)}
                  </div>

                  <div className="col-span-2 md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1 || isSubmitting}
                      className="p-2 text-gs-muted hover:text-gs-danger transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title={items.length === 1 ? 'Debe haber al menos un item' : 'Eliminar item'}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </Modal>
  )
}
