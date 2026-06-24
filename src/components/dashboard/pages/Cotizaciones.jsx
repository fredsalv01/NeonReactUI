import { useEffect, useState } from 'react'
import { Button, Pagination, Select, SkeletonBlock, useToast } from '../../ui'
import { FiPlus, FiEye } from 'react-icons/fi'
import { useCotizacionStore } from '../../../stores/cotizacionStore'
import { cotizacionService } from '../../../lib/services/cotizacionService'
import { CreateCotizacionModal } from '../modals/CreateCotizacionModal'
import { CotizacionDetailsDrawer } from '../drawers/CotizacionDetailsDrawer'

const ESTADO_OPTIONS = [
  { value: '',           label: 'Todos los estados' },
  { value: 'borrador',   label: 'Borrador' },
  { value: 'enviada',    label: 'Enviada' },
  { value: 'aceptada',   label: 'Aceptada' },
  { value: 'rechazada',  label: 'Rechazada' },
  { value: 'convertida', label: 'Convertida' },
]

const ESTADO_STYLES = {
  borrador:   { bg: 'rgba(148, 163, 184, 0.15)', fg: '#94a3b8' },
  enviada:    { bg: 'rgba(59, 130, 246, 0.15)',  fg: '#60a5fa' },
  aceptada:   { bg: 'rgba(34, 197, 94, 0.15)',   fg: '#4ade80' },
  rechazada:  { bg: 'rgba(239, 68, 68, 0.15)',   fg: '#f87171' },
  convertida: { bg: 'rgba(0, 201, 167, 0.15)',   fg: '#00C9A7' },
}

const fmt = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(n) || 0)

export const Cotizaciones = () => {
  const { toast } = useToast()
  const {
    cotizaciones, total, page, pageSize, filterEstado, isLoading,
    setPage, setFilterEstado, fetchCotizaciones,
  } = useCotizacionStore()

  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchCotizaciones().catch((err) => toast?.error?.(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterEstado])

  const handleOpenDetails = async (cotResumida) => {
    setDetailOpen(true)
    setSelected(cotResumida) // muestra lo que ya tenemos, luego enriquece
    setDetailLoading(true)
    try {
      const full = await cotizacionService.getCotizacionById(cotResumida.id)
      setSelected(full)
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setDetailLoading(false)
    }
  }

  // Re-fetch la fila visible cuando el store cambia (estado, conversión, etc)
  useEffect(() => {
    if (!selected) return
    const fresh = cotizaciones.find(c => c.id === selected.id)
    if (fresh) setSelected(prev => ({ ...prev, ...fresh }))
  }, [cotizaciones, selected?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-2">
            Cotizaciones
          </h1>
          <p className="text-gs-soft">
            Total: <span className="font-semibold text-gs-text">{total}</span>
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 w-full md:w-auto h-fit"
        >
          <FiPlus size={18} /> Nueva Cotización
        </Button>
      </div>

      <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6 space-y-6">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            value={filterEstado}
            onChange={setFilterEstado}
            options={ESTADO_OPTIONS}
            placeholder="Filtrar por estado…"
          />
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div className="space-y-2">
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
        ) : cotizaciones.length === 0 ? (
          <div className="py-12 text-center text-gs-soft">
            <p>Sin cotizaciones {filterEstado ? `en estado "${filterEstado}"` : 'todavía'}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 600 }}>
              <thead>
                <tr className="border-b border-gs-border text-left">
                  <th className="py-2 px-2 text-gs-soft font-semibold">#</th>
                  <th className="py-2 px-2 text-gs-soft font-semibold">Cliente</th>
                  <th className="py-2 px-2 text-gs-soft font-semibold">Fecha</th>
                  <th className="py-2 px-2 text-gs-soft font-semibold">Estado</th>
                  <th className="py-2 px-2 text-gs-soft font-semibold text-right">Total</th>
                  <th className="py-2 px-2 text-gs-soft font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.map(c => {
                  const s = ESTADO_STYLES[c.estado] || ESTADO_STYLES.borrador
                  return (
                    <tr key={c.id} className="border-b border-gs-border hover:bg-gs-bg transition">
                      <td className="py-3 px-2 text-gs-text font-mono">#{c.id}</td>
                      <td className="py-3 px-2 text-gs-text">
                        {c.cliente || <span className="text-gs-muted italic">Sin cliente</span>}
                      </td>
                      <td className="py-3 px-2 text-gs-soft font-['DM_Mono'] text-xs">
                        {new Date(c.created_at).toLocaleDateString('es-PE')}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-['DM_Mono']"
                          style={{ background: s.bg, color: s.fg }}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-['DM_Mono'] font-bold text-gs-text">
                        {fmt(c.total)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => handleOpenDetails(c)}
                          className="p-2 text-gs-soft hover:text-gs-accent transition-colors cursor-pointer"
                          title="Ver detalles"
                        >
                          <FiEye size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Modals & Drawers */}
      <CreateCotizacionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <CotizacionDetailsDrawer
        open={detailOpen}
        cotizacion={selected}
        loading={detailLoading}
        onClose={() => { setDetailOpen(false); setSelected(null) }}
      />
    </div>
  )
}
