import { useState, useEffect, useMemo } from 'react'
import {
  Button,
  DataTable,
  Icon,
  Pagination,
  Select,
  SkeletonRow,
  useToast,
} from '../../ui'
import { FiPlus, FiEye } from 'react-icons/fi'
import { useComprasStore } from '../../../stores/comprasStore'
import { CreateCompraModal } from '../modals/CreateCompraModal'
import { CompraDetailDrawer } from '../drawers/CompraDetailDrawer'
import { proveedorService } from '../../../lib/services/proveedorService'
import { almacenService } from '../../../lib/services/almacenService'

const PAGE_SIZE = 10

const formatCurrency = (n) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0)

export const Compras = () => {
  const { toast } = useToast()

  const compras       = useComprasStore((s) => s.compras)
  const total         = useComprasStore((s) => s.total)
  const isLoading     = useComprasStore((s) => s.isLoading)
  const error         = useComprasStore((s) => s.error)
  const filters       = useComprasStore((s) => s.filters)
  const setFilters    = useComprasStore((s) => s.setFilters)
  const fetchCompras  = useComprasStore((s) => s.fetchCompras)

  const [createOpen, setCreateOpen] = useState(false)
  const [detail, setDetail] = useState(null)

  // Filter catalogs
  const [proveedores, setProveedores] = useState([])
  const [almacenes, setAlmacenes]     = useState([])

  useEffect(() => {
    fetchCompras()
  }, [fetchCompras, filters])

  useEffect(() => {
    if (filters.pageSize !== PAGE_SIZE) setFilters({ pageSize: PAGE_SIZE })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false
    const loadCatalogs = async () => {
      try {
        const [prov, alm] = await Promise.all([
          proveedorService.fetchProveedores({ page: 1, pageSize: 500, status: 'active' }),
          almacenService.fetchAlmacenesActivos(),
        ])
        if (cancelled) return
        setProveedores(prov.data || [])
        setAlmacenes(alm || [])
      } catch (err) {
        if (!cancelled) toast.error('Error cargando filtros: ' + err.message)
      }
    }
    loadCatalogs()
    return () => { cancelled = true }
    // toast viene del context — no es estable, intencionalmente fuera de deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const columns = useMemo(() => getTableColumns(), [])

  const proveedorOptions = [
    { value: '', label: 'Todos los proveedores' },
    ...proveedores.map((p) => ({ value: p.id, label: p.nombre })),
  ]
  const almacenOptions = [
    { value: '', label: 'Todos los almacenes' },
    ...almacenes.map((a) => ({ value: a.id, label: a.nombre })),
  ]

  const hasFilters =
    !!filters.proveedorId || !!filters.almacenId || !!filters.startDate || !!filters.endDate

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gs-text">Compras</h1>
          <p className="text-gs-soft text-sm mt-1">
            Registro de entradas de mercadería — el stock y el kardex se actualizan automáticamente
            {total > 0 && (
              <span className="ml-2 text-gs-muted">· {total} {total === 1 ? 'compra' : 'compras'}</span>
            )}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2"
        >
          <FiPlus size={16} />
          Nueva Compra
        </Button>
      </div>

      {error && (
        <div className="bg-gs-danger/10 border border-gs-danger/25 rounded-lg p-3 text-sm text-gs-danger mb-6">
          {error}
        </div>
      )}

      <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select
            value={filters.proveedorId || ''}
            onChange={(v) => setFilters({ proveedorId: v || null })}
            options={proveedorOptions}
            placeholder="Proveedor"
          />
          <Select
            value={filters.almacenId || ''}
            onChange={(v) => setFilters({ almacenId: v || null })}
            options={almacenOptions}
            placeholder="Almacén"
          />
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters({ startDate: e.target.value || null })}
            placeholder="Desde"
            className="px-3 py-2 bg-gs-bg border border-gs-border rounded-lg text-gs-text text-sm"
          />
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({ endDate: e.target.value || null })}
            placeholder="Hasta"
            className="px-3 py-2 bg-gs-bg border border-gs-border rounded-lg text-gs-text text-sm"
          />
        </div>

        {isLoading ? (
          <ComprasSkeleton />
        ) : compras.length === 0 ? (
          <EmptyCompras hasFilters={hasFilters} />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={compras}
              emptyMessage="No hay compras"
              actions={(row) => (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDetail(row)}
                    className="p-1.5 text-gs-muted hover:text-gs-accent transition-colors cursor-pointer"
                    title="Ver detalle"
                  >
                    <FiEye size={15} />
                  </button>
                </div>
              )}
            />

            <Pagination
              page={filters.page}
              totalPages={totalPages}
              total={total}
              onPageChange={(p) => setFilters({ page: p })}
            />
          </>
        )}
      </div>

      <CreateCompraModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <CompraDetailDrawer
        open={!!detail}
        onClose={() => setDetail(null)}
        compra={detail}
      />
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

const getTableColumns = () => [
  {
    key: 'fecha',
    label: 'Fecha',
    sortable: true,
    render: (v) => (
      <span className="text-sm font-['DM_Mono'] text-gs-soft">
        {v ? new Date(v).toLocaleDateString('es-PE') : '—'}
      </span>
    ),
  },
  {
    key: 'proveedor',
    label: 'Proveedor',
    render: (_, row) => (
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gs-text truncate">
          {row.proveedores?.nombre || 'Sin proveedor'}
        </p>
        {row.proveedores?.ruc && (
          <p className="text-xs text-gs-muted font-['DM_Mono'] truncate">
            {row.proveedores.ruc}
          </p>
        )}
      </div>
    ),
  },
  {
    key: 'almacen',
    label: 'Almacén',
    render: (_, row) => (
      <span className="text-sm text-gs-soft">{row.almacenes?.nombre || '—'}</span>
    ),
  },
  {
    key: 'total',
    label: 'Total',
    sortable: true,
    render: (v) => (
      <span className="text-sm font-['DM_Mono'] font-bold text-gs-text">
        {formatCurrency(v)}
      </span>
    ),
  },
  {
    key: 'usuario',
    label: 'Registrado por',
    render: (_, row) => (
      <span className="text-sm text-gs-soft truncate">
        {row.perfiles?.nombre || row.perfiles?.email || '—'}
      </span>
    ),
  },
]

const ComprasSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
)

const EmptyCompras = ({ hasFilters }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gs-bg border border-gs-border mb-3">
      <Icon name="cart" size={20} color="var(--gs-muted)" />
    </div>
    <p className="text-gs-soft text-sm mb-1">
      {hasFilters ? 'No se encontraron compras con esos filtros' : 'Aún no hay compras registradas'}
    </p>
    <p className="text-gs-muted text-xs">
      {hasFilters ? 'Prueba ajustando o limpiando los filtros' : 'Registra la primera con "Nueva Compra"'}
    </p>
  </div>
)
