import { useState, useEffect, useMemo } from 'react'
import { Modal, Button, InputField, NumberInput, Select, Icon, useToast } from '../../ui'
import { useSalesStore } from '../../../stores/salesStore'
import { useInventoryStore } from '../../../stores/inventoryStore'
import { useAuth } from '../../../hooks/useAuth'
import { almacenService } from '../../../lib/services/almacenService'
import { clienteService } from '../../../lib/services/clienteService'
import { equipoService } from '../../../lib/services/equipoService'
import { ALMACEN_PRINCIPAL_ID } from '../../../lib/constants/almacenConstants'

const EMPTY_FORM = {
  equipo_id: '',
  almacen_id: ALMACEN_PRINCIPAL_ID,
  cantidad: 1,
  precio_unitario: 0,
  cliente_id: '',
  notas: '',
}

const inputClass =
  "w-full px-3 py-2 bg-gs-bg border border-gs-border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20"

const formatCurrency = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0)

export const CreateVentaModal = ({ open, onClose }) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const addVenta     = useSalesStore((s) => s.addVenta)
  const fetchEquipos = useInventoryStore((s) => s.fetchEquipos)

  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Catálogos
  const [equipos,   setEquipos]   = useState([])
  const [almacenes, setAlmacenes] = useState([])
  const [clientes,  setClientes]  = useState([])
  const [isLoadingCat, setIsLoadingCat] = useState(false)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM)
      setErrors({})
      return
    }

    let cancelled = false
    const loadCatalogs = async () => {
      setIsLoadingCat(true)
      try {
        const [eq, alm, cli] = await Promise.all([
          equipoService.getEquipos(),
          almacenService.fetchAlmacenesActivos(),
          clienteService.fetchClientes({ page: 1, pageSize: 500, status: 'active' }),
        ])
        if (cancelled) return
        setEquipos(eq || [])
        setAlmacenes(alm || [])
        setClientes(cli.data || [])
      } catch (err) {
        if (!cancelled) toast.error('Error cargando catálogos: ' + err.message)
      } finally {
        if (!cancelled) setIsLoadingCat(false)
      }
    }
    loadCatalogs()
    return () => { cancelled = true }
    // toast del context no es estable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Equipo seleccionado completo (para precio sugerido + stock por almacén)
  const equipoSeleccionado = useMemo(
    () => equipos.find((e) => e.id === form.equipo_id) || null,
    [equipos, form.equipo_id]
  )

  // Auto-rellenar precio_unitario al seleccionar equipo (sólo si está en 0)
  useEffect(() => {
    if (equipoSeleccionado && Number(form.precio_unitario) === 0) {
      setForm((p) => ({ ...p, precio_unitario: Number(equipoSeleccionado.precio_venta) || 0 }))
    }
    // No re-disparar cuando cambia precio manualmente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipoSeleccionado])

  // Stock disponible en el almacén seleccionado para el equipo elegido
  const stockDisponible = useMemo(() => {
    if (!equipoSeleccionado || !form.almacen_id) return null
    const breakdown = equipoSeleccionado.stock_por_almacen || []
    const row = breakdown.find((b) => b.almacen_id === form.almacen_id)
    return row?.cantidad ?? 0
  }, [equipoSeleccionado, form.almacen_id])

  const updateField = (field) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const total = (Number(form.cantidad) || 0) * (Number(form.precio_unitario) || 0)

  const validate = () => {
    const e = {}
    if (!form.equipo_id)  e.equipo_id  = 'Selecciona un equipo'
    if (!form.almacen_id) e.almacen_id = 'Selecciona un almacén'
    if (!(Number(form.cantidad) > 0)) e.cantidad = 'Cantidad debe ser > 0'
    if (!(Number(form.precio_unitario) > 0)) e.precio_unitario = 'Precio debe ser > 0'
    if (stockDisponible !== null && Number(form.cantidad) > stockDisponible) {
      e.cantidad = `Sólo hay ${stockDisponible} unidades en este almacén`
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await addVenta({
        equipo_id: form.equipo_id,
        cantidad: Number(form.cantidad),
        precio_unitario: Number(form.precio_unitario),
        monto_total: total,
        almacen_id: form.almacen_id,
        cliente_id: form.cliente_id || null,
        usuario_id: user?.id || null,
        descripcion: form.notas?.trim() || null,
      })
      toast.success('Venta registrada — stock descontado')
      // Refrescar inventario para que stock_total se actualice
      fetchEquipos().catch(() => {})
      onClose()
    } catch (err) {
      const msg = err.message || 'No se pudo registrar la venta'
      if (msg.toLowerCase().includes('stock insuficiente')) {
        setErrors((p) => ({ ...p, cantidad: 'Stock insuficiente en el almacén' }))
      } else {
        toast.error('Error: ' + msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const equipoOptions = useMemo(() => [
    { value: '', label: 'Selecciona un equipo…' },
    ...equipos.map((e) => ({
      value: e.id,
      label: `${e.id} · ${e.nombre}`,
    })),
  ], [equipos])

  const almacenOptions = useMemo(
    () => almacenes.map((a) => ({ value: a.id, label: a.nombre })),
    [almacenes]
  )

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
      title="Nueva Venta"
      subtitle="Registra una salida de stock — el kardex y el inventario se actualizan automáticamente."
      size="lg"
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
                  Registrar Venta
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <InputField label="Equipo *" error={errors.equipo_id}>
          <Select
            value={form.equipo_id}
            onChange={(v) => updateField('equipo_id')(v)}
            options={equipoOptions}
            placeholder="Selecciona equipo…"
          />
        </InputField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Almacén *" error={errors.almacen_id}>
            <Select
              value={form.almacen_id}
              onChange={(v) => updateField('almacen_id')(v)}
              options={almacenOptions}
              placeholder="Selecciona almacén…"
            />
            {stockDisponible !== null && (
              <p className={`text-[10px] mt-1 font-['DM_Mono'] ${
                stockDisponible === 0 ? 'text-gs-danger'
                : stockDisponible <= 5 ? 'text-yellow-400'
                : 'text-gs-muted'
              }`}>
                disponible: {stockDisponible} unidad{stockDisponible === 1 ? '' : 'es'}
              </p>
            )}
          </InputField>

          <InputField label="Cantidad *" error={errors.cantidad}>
            <NumberInput
              value={form.cantidad}
              onChange={(v) => updateField('cantidad')(v)}
              min={1}
              max={stockDisponible ?? undefined}
              step={1}
              disabled={isSubmitting}
            />
          </InputField>
        </div>

        <InputField label="Precio unitario *" error={errors.precio_unitario}>
          <NumberInput
            value={form.precio_unitario}
            onChange={(v) => updateField('precio_unitario')(v)}
            min={0}
            step={0.01}
            prefix="S/"
            disabled={isSubmitting}
          />
        </InputField>

        <InputField label="Cliente">
          <Select
            value={form.cliente_id}
            onChange={(v) => updateField('cliente_id')(v)}
            options={clienteOptions}
            placeholder="Sin cliente"
          />
        </InputField>

        <InputField label="Notas">
          <input
            type="text"
            value={form.notas}
            onChange={updateField('notas')}
            placeholder="Información adicional"
            className={inputClass}
            disabled={isSubmitting}
          />
        </InputField>
      </div>
    </Modal>
  )
}
