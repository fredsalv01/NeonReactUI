import { useState, useEffect, useMemo } from 'react'
import { Modal, Button, InputField, NumberInput, Select, Icon, useToast } from '../../ui'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useComprasStore } from '../../../stores/comprasStore'
import { proveedorService } from '../../../lib/services/proveedorService'
import { almacenService } from '../../../lib/services/almacenService'
import { equipoService } from '../../../lib/services/equipoService'
import { ALMACEN_PRINCIPAL_ID } from '../../../lib/constants/almacenConstants'

const todayIso = () => new Date().toISOString().slice(0, 10)

const EMPTY_HEADER = {
  proveedor_id: '',
  almacen_id: ALMACEN_PRINCIPAL_ID,
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

export const CreateCompraModal = ({ open, onClose }) => {
  const { toast } = useToast()
  const crearCompra = useComprasStore((s) => s.crearCompra)

  const [header, setHeader] = useState(EMPTY_HEADER)
  const [items, setItems]   = useState([newItem()])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Catálogos
  const [proveedores, setProveedores] = useState([])
  const [almacenes,   setAlmacenes]   = useState([])
  const [equipos,     setEquipos]     = useState([])
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
        const [prov, alm, eq] = await Promise.all([
          proveedorService.fetchProveedores({ page: 1, pageSize: 500, status: 'active' }),
          almacenService.fetchAlmacenesActivos(),
          equipoService.getEquipos(),
        ])
        if (cancelled) return
        setProveedores(prov.data || [])
        setAlmacenes(alm || [])
        setEquipos(eq || [])
      } catch (err) {
        if (!cancelled) toast.error('Error cargando catálogos: ' + err.message)
      } finally {
        if (!cancelled) setIsLoadingCat(false)
      }
    }
    loadCatalogs()
    return () => { cancelled = true }
    // toast viene del context — no es estable, intencionalmente fuera de deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const updateHeader = (field) => (e) => {
    const value = e?.target ? e.target.value : e
    setHeader((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)))
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
    if (!header.almacen_id) e.almacen_id = 'Almacén requerido'
    if (!header.fecha)      e.fecha      = 'Fecha requerida'
    if (items.length === 0) e.items = 'Agrega al menos un item'
    for (const it of items) {
      if (!it.equipo_id) { e.items = 'Cada item necesita un equipo'; break }
      if (!(Number(it.cantidad) > 0)) { e.items = 'Las cantidades deben ser > 0'; break }
      if (!(Number(it.precio_unitario) >= 0)) { e.items = 'Los precios deben ser >= 0'; break }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await crearCompra({
        proveedor_id: header.proveedor_id || null,
        almacen_id:   header.almacen_id,
        fecha:        header.fecha,
        notas:        header.notas,
        items: items.map((it) => ({
          equipo_id: it.equipo_id,
          cantidad: Number(it.cantidad),
          precio_unitario: Number(it.precio_unitario),
        })),
      })
      toast.success('Compra registrada — stock actualizado')
      onClose()
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo registrar la compra'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const proveedorOptions = useMemo(() => [
    { value: '', label: 'Sin proveedor' },
    ...proveedores.map((p) => ({
      value: p.id,
      label: p.ruc ? `${p.nombre} · ${p.ruc}` : p.nombre,
    })),
  ], [proveedores])

  const almacenOptions = useMemo(
    () => almacenes.map((a) => ({ value: a.id, label: a.nombre })),
    [almacenes]
  )

  const equipoOptions = useMemo(() => [
    { value: '', label: 'Selecciona un equipo…' },
    ...equipos.map((e) => ({ value: e.id, label: `${e.id} · ${e.nombre}` })),
  ], [equipos])

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title="Nueva Compra"
      subtitle="Registra una entrada de mercadería. El stock y el kardex se actualizan automáticamente."
      size="xl"
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
                  Registrar Compra
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Proveedor">
            <Select
              value={header.proveedor_id}
              onChange={(v) => updateHeader('proveedor_id')(v)}
              options={proveedorOptions}
              placeholder="Selecciona proveedor…"
            />
          </InputField>

          <InputField label="Almacén *" error={errors.almacen_id}>
            <Select
              value={header.almacen_id}
              onChange={(v) => updateHeader('almacen_id')(v)}
              options={almacenOptions}
              placeholder="Selecciona almacén…"
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

          <InputField label="Notas">
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

        {/* Items */}
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

          {errors.items && (
            <div className="text-xs text-gs-danger">{errors.items}</div>
          )}

          {/* Header de columnas — sólo se renderiza una vez */}
          <div className="hidden md:grid md:grid-cols-12 gap-2 px-3 text-[11px] text-gs-soft font-['DM_Mono'] uppercase tracking-[0.8px]">
            <div className="md:col-span-5">Equipo</div>
            <div className="md:col-span-2">Cantidad</div>
            <div className="md:col-span-2">Precio unit.</div>
            <div className="md:col-span-2 text-right">Subtotal</div>
            <div className="md:col-span-1"></div>
          </div>

          <div className="space-y-2">
            {items.map((it, idx) => {
              const subtotal = (Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0)
              return (
                <div
                  key={it.key}
                  className="grid grid-cols-12 gap-2 items-center p-3 bg-gs-bg border border-gs-border rounded-lg"
                >
                  <div className="col-span-12 md:col-span-5">
                    <Select
                      value={it.equipo_id}
                      onChange={(v) => updateItem(idx, 'equipo_id', v)}
                      options={equipoOptions}
                      placeholder="Equipo…"
                    />
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <NumberInput
                      value={it.cantidad}
                      onChange={(v) => updateItem(idx, 'cantidad', v)}
                      min={1}
                      step={1}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <NumberInput
                      value={it.precio_unitario}
                      onChange={(v) => updateItem(idx, 'precio_unitario', v)}
                      min={0}
                      step={0.01}
                      prefix="S/"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="col-span-3 md:col-span-2 text-right text-sm text-gs-text font-['DM_Mono'] font-bold">
                    {formatCurrency(subtotal)}
                  </div>

                  <div className="col-span-1 flex justify-end">
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
