import { useState, useEffect } from 'react'
import { Drawer, Button, Icon, useToast } from '../../ui'
import { compraService } from '../../../lib/services/compraService'

const formatCurrency = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0)

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export const CompraDetailDrawer = ({ open, onClose, compra }) => {
  const { toast } = useToast()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open || !compra?.id) {
      setItems([])
      return
    }
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const rows = await compraService.fetchCompraItems(compra.id)
        if (!cancelled) setItems(rows)
      } catch (err) {
        if (!cancelled) toast.error('Error: ' + err.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [open, compra?.id, toast])

  if (!compra) return null

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Detalle de Compra"
      subtitle={formatDate(compra.fecha)}
      size="md"
      footer={
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gs-soft uppercase tracking-wider font-['DM_Mono']">
            Información
          </h3>
          <Field label="Proveedor" value={compra.proveedores?.nombre || 'Sin proveedor'} />
          <Field label="Almacén" value={compra.almacenes?.nombre || '—'} />
          <Field label="Registrado por" value={compra.perfiles?.nombre || compra.perfiles?.email || '—'} />
          {compra.notas && <Field label="Notas" value={compra.notas} />}
        </section>

        <section className="space-y-3 pt-4 border-t border-gs-border">
          <h3 className="text-xs font-bold text-gs-soft uppercase tracking-wider font-['DM_Mono']">
            Items {items.length > 0 && <span className="text-gs-muted">({items.length})</span>}
          </h3>

          {isLoading ? (
            <div className="text-sm text-gs-muted py-4 text-center">Cargando items…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gs-muted py-4 text-center">Sin items</div>
          ) : (
            <div className="space-y-2">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="grid grid-cols-12 gap-2 items-center p-3 bg-gs-bg border border-gs-border rounded-lg text-sm"
                >
                  <div className="col-span-6 min-w-0">
                    <p className="font-semibold text-gs-text truncate">
                      {it.equipos?.nombre || it.equipo_id}
                    </p>
                    <p className="text-xs text-gs-muted font-['DM_Mono']">{it.equipo_id}</p>
                  </div>
                  <div className="col-span-2 text-right font-['DM_Mono'] text-gs-soft">
                    {it.cantidad}×
                  </div>
                  <div className="col-span-2 text-right font-['DM_Mono'] text-gs-soft">
                    {formatCurrency(it.precio_unitario)}
                  </div>
                  <div className="col-span-2 text-right font-['DM_Mono'] font-bold text-gs-text">
                    {formatCurrency(it.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="pt-4 border-t border-gs-border">
          <div className="flex items-center justify-between bg-gs-bg border border-gs-border rounded-lg px-4 py-3">
            <span className="text-xs font-bold text-gs-soft uppercase tracking-wider font-['DM_Mono']">
              Total
            </span>
            <span className="text-lg font-bold text-gs-accent font-['DM_Mono']">
              {formatCurrency(compra.total)}
            </span>
          </div>
        </section>
      </div>
    </Drawer>
  )
}

const Field = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-gs-muted uppercase font-['DM_Mono'] mb-0.5">{label}</p>
    <p className="text-sm text-gs-text">{value}</p>
  </div>
)
