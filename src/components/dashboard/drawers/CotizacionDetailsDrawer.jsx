import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import html2pdf from 'html2pdf.js'
import { Drawer, SkeletonBlock, Button, Select, useToast } from '../../ui'
import { FiDownload, FiCheckCircle, FiXCircle, FiSend, FiRepeat, FiTrash2 } from 'react-icons/fi'
import { BoletaPdf } from '../pdf/BoletaPdf'
import { useCotizacionStore } from '../../../stores/cotizacionStore'
import { almacenService } from '../../../lib/services/almacenService'
import { configService } from '../../../lib/services/configService'

const fmt = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(n) || 0)

const ESTADO_STYLES = {
  borrador:   { bg: 'rgba(148, 163, 184, 0.15)', fg: '#94a3b8', label: 'Borrador' },
  enviada:    { bg: 'rgba(59, 130, 246, 0.15)',  fg: '#60a5fa', label: 'Enviada' },
  aceptada:   { bg: 'rgba(34, 197, 94, 0.15)',   fg: '#4ade80', label: 'Aceptada' },
  rechazada:  { bg: 'rgba(239, 68, 68, 0.15)',   fg: '#f87171', label: 'Rechazada' },
  convertida: { bg: 'rgba(0, 201, 167, 0.15)',   fg: '#00C9A7', label: 'Convertida' },
}

const InfoRow = ({ label, value, mono = false }) => (
  <div>
    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">{label}</p>
    <p className={`text-sm font-semibold text-gs-text ${mono ? "font-['DM_Mono']" : ''}`}>{value}</p>
  </div>
)

const EstadoBadge = ({ estado }) => {
  const s = ESTADO_STYLES[estado] || ESTADO_STYLES.borrador
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold font-['DM_Mono'] uppercase"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  )
}

export const CotizacionDetailsDrawer = ({ open, cotizacion, onClose, loading }) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const pdfRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)
  const [config, setConfig] = useState(null)
  const [almacenes, setAlmacenes] = useState([])
  const [showConvert, setShowConvert] = useState(false)
  const [almacenId, setAlmacenId] = useState('')
  const [isWorking, setIsWorking] = useState(false)

  const actualizarEstado = useCotizacionStore(s => s.actualizarEstado)
  const convertirAVenta = useCotizacionStore(s => s.convertirAVenta)
  const eliminarCotizacion = useCotizacionStore(s => s.eliminarCotizacion)

  useEffect(() => {
    if (!open) return
    let alive = true
    Promise.all([
      configService.getAll().then(c => c.map).catch(() => null),
      almacenService.fetchAlmacenesActivos().catch(() => []),
    ]).then(([cfg, alm]) => {
      if (!alive) return
      setConfig(cfg)
      setAlmacenes(alm)
      if (alm.length === 1) setAlmacenId(alm[0].id)
    })
    return () => { alive = false }
  }, [open])

  useEffect(() => {
    if (!open) {
      setShowConvert(false)
      setAlmacenId('')
    }
  }, [open])

  if (!cotizacion) return null

  const items = cotizacion.cotizaciones_items || []
  const total = Number(cotizacion.total) || items.reduce(
    (s, it) => s + Number(it.subtotal ?? (it.cantidad * it.precio_unitario) ?? 0), 0
  )
  const clienteNombre = cotizacion.cliente || 'Sin cliente'
  const docCliente = cotizacion.cliente_tipo_doc && cotizacion.cliente_nro_doc
    ? `${cotizacion.cliente_tipo_doc} ${cotizacion.cliente_nro_doc}`
    : null
  const asesor = cotizacion.perfiles?.nombre || 'Sistema'

  // Datos en shape que BoletaPdf entiende (alias venta_items + alias campos)
  const pdfData = {
    id: cotizacion.id,
    created_at: cotizacion.created_at,
    venta_items: items,
    monto_total: total,
    total,
    cliente: clienteNombre,
    cliente_tipo_doc: cotizacion.cliente_tipo_doc,
    cliente_nro_doc: cotizacion.cliente_nro_doc,
    perfiles: cotizacion.perfiles,
    descripcion: cotizacion.notas,
  }

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return
    setIsExporting(true)
    try {
      await html2pdf().set({
        margin: 0,
        filename: `cotizacion-${cotizacion.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }).from(pdfRef.current).save()
    } finally {
      setIsExporting(false)
    }
  }

  const handleEstado = async (nuevoEstado) => {
    setIsWorking(true)
    try {
      await actualizarEstado(cotizacion.id, nuevoEstado)
      toast.success(`Cotización marcada como ${nuevoEstado}`)
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo actualizar'))
    } finally {
      setIsWorking(false)
    }
  }

  const handleConvertir = async () => {
    if (!almacenId) {
      toast.error('Selecciona el almacén de origen del stock')
      return
    }
    setIsWorking(true)
    try {
      const ventaId = await convertirAVenta(cotizacion.id, almacenId)
      toast.success(`Cotización convertida a venta #${ventaId}`)
      onClose()
      navigate('/dashboard/sales')
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo convertir'))
    } finally {
      setIsWorking(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta cotización? No se puede deshacer.')) return
    setIsWorking(true)
    try {
      await eliminarCotizacion(cotizacion.id)
      toast.success('Cotización eliminada')
      onClose()
    } catch (err) {
      toast.error('Error: ' + (err.message || 'No se pudo eliminar'))
    } finally {
      setIsWorking(false)
    }
  }

  const estado = cotizacion.estado
  const isTerminal = estado === 'convertida' || estado === 'rechazada'
  const almacenOptions = almacenes.map(a => ({ value: a.id, label: a.nombre }))

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Cotización"
      subtitle={`#${cotizacion.id}`}
      side="right"
      size="md"
    >
      {loading ? (
        <div className="space-y-4">
          <SkeletonBlock className="w-full h-32 rounded-lg" />
          <SkeletonBlock className="h-8 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Estado + fecha */}
          <div className="flex items-center justify-between">
            <EstadoBadge estado={estado} />
            <span className="text-[12px] text-gs-soft font-['DM_Mono']">
              {new Date(cotizacion.created_at).toLocaleString('es-PE')}
            </span>
          </div>

          {/* Master info */}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Cliente" value={clienteNombre} />
            {docCliente && <InfoRow label="Documento" value={docCliente} mono />}
            <InfoRow label="Asesor" value={asesor} />
            {cotizacion.venta_id && (
              <InfoRow label="Venta generada" value={`#${cotizacion.venta_id}`} mono />
            )}
            {cotizacion.notas && (
              <div className="col-span-2">
                <InfoRow label="Notas" value={cotizacion.notas} />
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
                    <img src={it.equipos.imagen_url} alt={it.equipos?.nombre} className="w-12 h-12 object-cover rounded" />
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
            <span className="text-xl font-bold text-green-400 font-['DM_Mono']">{fmt(total)}</span>
          </div>

          {/* Acciones por estado */}
          {!isTerminal && (
            <div className="space-y-2 pt-2 border-t border-gs-border">
              {estado === 'borrador' && (
                <Button
                  variant="primary"
                  onClick={() => handleEstado('enviada')}
                  disabled={isWorking}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <FiSend size={16} /> Marcar como enviada
                </Button>
              )}

              {estado === 'enviada' && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleEstado('aceptada')}
                    disabled={isWorking}
                    className="flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle size={16} /> Aceptada
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleEstado('rechazada')}
                    disabled={isWorking}
                    className="flex items-center justify-center gap-2"
                  >
                    <FiXCircle size={16} /> Rechazada
                  </Button>
                </div>
              )}

              {estado === 'aceptada' && !showConvert && (
                <Button
                  variant="primary"
                  onClick={() => setShowConvert(true)}
                  disabled={isWorking}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <FiRepeat size={16} /> Convertir a venta
                </Button>
              )}

              {estado === 'aceptada' && showConvert && (
                <div className="space-y-2 p-3 bg-gs-bg border border-gs-accent/30 rounded-lg">
                  <p className="text-[12px] text-gs-soft">
                    Almacén de origen del stock:
                  </p>
                  <Select
                    value={almacenId}
                    onChange={(v) => setAlmacenId(v)}
                    options={almacenOptions}
                    placeholder="Selecciona almacén…"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowConvert(false)}
                      disabled={isWorking}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleConvertir}
                      disabled={isWorking || !almacenId}
                      className="flex-1"
                    >
                      {isWorking ? 'Convirtiendo…' : 'Confirmar conversión'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Acciones secundarias */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center justify-center gap-2"
            >
              <FiDownload size={14} />
              {isExporting ? 'Generando…' : 'PDF'}
            </Button>
            {(estado === 'borrador' || estado === 'rechazada') && (
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isWorking}
                className="flex items-center justify-center gap-2"
              >
                <FiTrash2 size={14} /> Eliminar
              </Button>
            )}
          </div>

          {/* PDF off-screen */}
          <div style={{ position: 'fixed', left: '-10000px', top: 0, pointerEvents: 'none' }} aria-hidden>
            <BoletaPdf ref={pdfRef} venta={pdfData} config={config} documento="COTIZACIÓN" />
          </div>
        </div>
      )}
    </Drawer>
  )
}
