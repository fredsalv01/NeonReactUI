import { Drawer, SkeletonBlock } from '../../ui'

const InfoRow = ({ label, value, mono = false, valueClassName = '' }) => (
  <div>
    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">{label}</p>
    <p className={`text-sm font-semibold text-gs-text ${mono ? "font-['DM_Mono']" : ''} ${valueClassName}`}>
      {value}
    </p>
  </div>
)

const fmt = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(n) || 0)

export const SalesDetailsDrawer = ({ open, venta, onClose, loading }) => {
  if (!venta) return null

  // Items: nuevos vienen en venta_items[], ventas viejas solo tienen las columnas legacy
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

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Detalles de Venta"
      subtitle={`#${venta.id}`}
      side="right"
      size="md"
    >
      {loading ? (
        <div className="space-y-4">
          <SkeletonBlock className="w-full h-32 rounded-lg" />
          <SkeletonBlock className="h-8 w-full" />
          <SkeletonBlock className="h-6 w-3/4" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Master info */}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="ID Venta" value={`#${venta.id}`} mono />
            <InfoRow
              label="Fecha"
              value={new Date(venta.created_at).toLocaleString('es-PE')}
            />
            <InfoRow label="Cliente" value={venta.cliente || venta.clientes?.nombre || 'Sin cliente'} />
            {venta.perfiles && (
              <InfoRow label="Vendedor" value={venta.perfiles.nombre || 'Sistema'} />
            )}
            {venta.descripcion && (
              <div className="col-span-2">
                <InfoRow label="Notas" value={venta.descripcion} />
              </div>
            )}
          </div>

          {/* Items */}
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
                  {it.equipos?.imagen_url ? (
                    <img
                      src={it.equipos.imagen_url}
                      alt={it.equipos?.nombre}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gs-border rounded" />
                  )}
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
          </div>

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-gs-surface border border-gs-border rounded-lg">
            <span className="text-sm text-gs-soft font-['DM_Mono'] uppercase">Total</span>
            <span className="text-xl font-bold text-green-400 font-['DM_Mono']">
              {fmt(venta.monto_total ?? venta.total)}
            </span>
          </div>
        </div>
      )}
    </Drawer>
  )
}
