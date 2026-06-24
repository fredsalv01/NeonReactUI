import { useEffect, useState } from 'react'
import { useSalesStore } from '../../../stores/salesStore'
import { Drawer, Button, useToast } from '../../ui'
import { FiAlertCircle } from 'react-icons/fi'

const fmt = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(n) || 0)

// ponytail: solo edita notas + snapshot legacy de cliente. Editar items toca kardex
// + stock_almacen y necesita una RPC `fn_actualizar_venta` con transacción.
// Ceiling: si necesitan corregir cantidades, construir la RPC; mientras tanto,
// el flujo es "anular venta + reemitir" (ya soportado por deleteVenta + addVenta).
const EDITABLE = [
  { key: 'descripcion',      label: 'Notas',           textarea: true },
  { key: 'cliente',          label: 'Cliente (nombre)' },
  { key: 'cliente_tipo_doc', label: 'Tipo doc',        placeholder: 'DNI / RUC' },
  { key: 'cliente_nro_doc',  label: 'N° doc' },
  { key: 'cliente_telefono', label: 'Teléfono' },
  { key: 'cliente_email',    label: 'Email',           type: 'email' },
]

const emptyForm = () =>
  EDITABLE.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {})

const fromVenta = (venta) => {
  const out = {}
  for (const f of EDITABLE) out[f.key] = venta?.[f.key] ?? ''
  return out
}

export const EditVentaDrawer = ({ open, venta, onClose, onSuccess }) => {
  const { toast } = useToast()
  const updateVenta = useSalesStore(state => state.updateVenta)
  const [form, setForm] = useState(emptyForm)
  const [initial, setInitial] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (venta && open) {
      const f = fromVenta(venta)
      setForm(f)
      setInitial(f)
    }
  }, [venta, open])

  if (!venta) return null

  const items = (venta.venta_items && venta.venta_items.length > 0)
    ? venta.venta_items
    : [{
        id: 'legacy',
        equipo_id: venta.equipo_id,
        equipos: venta.equipos,
        cantidad: venta.cantidad,
        precio_unitario: venta.precio_unitario,
        subtotal: venta.monto_total ?? venta.total,
      }]

  const total = items.reduce(
    (s, it) => s + Number(it.subtotal ?? (it.cantidad * it.precio_unitario) ?? 0), 0
  )

  const dirty = EDITABLE.some(f => (form[f.key] ?? '') !== (initial[f.key] ?? ''))

  const onChange = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const onSave = async () => {
    if (!dirty) return
    setSaving(true)
    try {
      const payload = {}
      for (const f of EDITABLE) {
        if ((form[f.key] ?? '') !== (initial[f.key] ?? '')) {
          payload[f.key] = form[f.key] === '' ? null : form[f.key]
        }
      }
      await updateVenta(venta.id, payload)
      toast.success('Venta actualizada')
      onSuccess?.()
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Editar Venta"
      subtitle={`#${venta.id}`}
      side="right"
      size="md"
    >
      <div className="space-y-6">
        {/* Aviso */}
        <div className="flex gap-2 p-3 rounded-lg bg-gs-bg border border-gs-border text-[12px] text-gs-soft">
          <FiAlertCircle className="shrink-0 mt-0.5 text-gs-accent" size={14} />
          <div>
            Items y montos son inmutables. Para corregir cantidades o precios,
            anula la venta y emite una nueva.
          </div>
        </div>

        {/* Items readonly */}
        <div>
          <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase mb-2">
            Productos ({items.length})
          </p>
          <div className="space-y-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-3 p-3 bg-gs-bg border border-gs-border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gs-text truncate">
                    {it.equipos?.nombre || it.equipo_id || 'Equipo'}
                  </p>
                  <p className="text-[11px] text-gs-muted font-['DM_Mono']">
                    {it.cantidad} × {fmt(it.precio_unitario)}
                  </p>
                </div>
                <p className="text-sm font-bold text-green-400 font-['DM_Mono']">
                  {fmt(it.subtotal ?? (it.cantidad * it.precio_unitario))}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-3 p-3 bg-gs-surface border border-gs-border rounded-lg">
            <span className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">Total</span>
            <span className="text-base font-bold text-green-400 font-['DM_Mono']">
              {fmt(total)}
            </span>
          </div>
        </div>

        {/* Form editable */}
        <div className="space-y-4">
          {EDITABLE.map(f => (
            <div key={f.key}>
              <label className="block text-[11px] text-gs-soft font-mono uppercase tracking-[0.8px] mb-2">
                {f.label}
              </label>
              {f.textarea ? (
                <textarea
                  rows={3}
                  value={form[f.key] ?? ''}
                  onChange={onChange(f.key)}
                  placeholder={f.placeholder || ''}
                  className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text focus:outline-none focus:border-gs-accent"
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  value={form[f.key] ?? ''}
                  onChange={onChange(f.key)}
                  placeholder={f.placeholder || ''}
                  className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text focus:outline-none focus:border-gs-accent"
                />
              )}
            </div>
          ))}
        </div>

        {/* Acciones */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gs-border">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={saving || !dirty}
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
