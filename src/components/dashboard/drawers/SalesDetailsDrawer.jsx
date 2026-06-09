import { Drawer, SkeletonBlock } from '../../ui'

const InfoRow = ({ label, value, mono = false, valueClassName = '' }) => (
  <div>
    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">{label}</p>
    <p className={`text-sm font-semibold text-gs-text ${mono ? "font-['DM_Mono']" : ''} ${valueClassName}`}>
      {value}
    </p>
  </div>
)

export const SalesDetailsDrawer = ({ open, venta, onClose, loading }) => {
  if (!venta) {
    return null
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Detalles de Venta"
      subtitle={`${venta.id}`}
      side="right"
      size="md"
    >
      {loading ? (
        <div className="space-y-4">
          <SkeletonBlock className="w-full h-32 rounded-lg" />
          <SkeletonBlock className="h-8 w-full" />
          <SkeletonBlock className="h-6 w-3/4" />
          <SkeletonBlock className="h-6 w-2/3" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Equipo Image */}
          {venta.equipos?.imagen_url && (
            <div className="flex justify-center p-4 bg-gs-bg rounded-lg">
              <img
                src={venta.equipos.imagen_url}
                alt={venta.equipos.nombre}
                className="max-w-xs max-h-48 object-cover rounded"
              />
            </div>
          )}

          {/* Venta Info */}
          <div className="space-y-4">
            <InfoRow label="ID Venta" value={venta.id} mono />
            <InfoRow label="Equipo" value={venta.equipos?.nombre || 'N/A'} />
            <InfoRow label="Tipo" value={venta.equipos?.tipo || 'N/A'} />
            <InfoRow label="Cantidad" value={`${venta.cantidad} unidades`} valueClassName="text-gs-accent" />
            <InfoRow
              label="Precio Unitario"
              value={`$${parseFloat(venta.precio_unitario).toFixed(2)}`}
            />
            <InfoRow
              label="Monto Total"
              value={`$${parseFloat(venta.monto_total).toFixed(2)}`}
              valueClassName="text-green-400 text-base font-bold"
            />

            {venta.descripcion && (
              <InfoRow label="Descripción" value={venta.descripcion} />
            )}

            {venta.perfiles && (
              <InfoRow label="Vendedor" value={venta.perfiles.nombre || 'Sistema'} />
            )}

            <InfoRow
              label="Fecha"
              value={new Date(venta.created_at).toLocaleString('es-MX')}
            />
          </div>
        </div>
      )}
    </Drawer>
  )
}
