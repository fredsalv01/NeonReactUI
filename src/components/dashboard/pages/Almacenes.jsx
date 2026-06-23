import { useState, useEffect, useMemo } from 'react'
import {
  Button,
  DataTable,
  Icon,
  Pagination,
  Select,
  SearchBar,
  SkeletonRow,
  Tooltip,
  useToast,
} from '../../ui'
import { FiPlus, FiEdit2, FiUserX, FiUserCheck } from 'react-icons/fi'
import { useAlmacenesStore } from '../../../stores/almacenesStore'
import { CreateAlmacenModal } from '../modals/CreateAlmacenModal'
import { EditAlmacenDrawer } from '../drawers/EditAlmacenDrawer'
import {
  ALMACEN_STATUS,
  ALMACEN_STATUS_OPTIONS,
  ALMACEN_PRINCIPAL_ID,
} from '../../../lib/constants/almacenConstants'

const PAGE_SIZE = 10

export const Almacenes = () => {
  const { toast } = useToast()

  const almacenes         = useAlmacenesStore((s) => s.almacenes)
  const total             = useAlmacenesStore((s) => s.total)
  const isLoading         = useAlmacenesStore((s) => s.isLoading)
  const error             = useAlmacenesStore((s) => s.error)
  const filters           = useAlmacenesStore((s) => s.filters)
  const setFilters        = useAlmacenesStore((s) => s.setFilters)
  const fetchAlmacenes    = useAlmacenesStore((s) => s.fetchAlmacenes)
  const desactivarAlmacen = useAlmacenesStore((s) => s.desactivarAlmacen)
  const reactivarAlmacen  = useAlmacenesStore((s) => s.reactivarAlmacen)

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    fetchAlmacenes()
  }, [fetchAlmacenes, filters])

  useEffect(() => {
    if (filters.pageSize !== PAGE_SIZE) setFilters({ pageSize: PAGE_SIZE })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleQuickToggle = async (a) => {
    if (a.id === ALMACEN_PRINCIPAL_ID) {
      toast.error('No puedes desactivar el almacén Principal')
      return
    }
    try {
      if (a.active) {
        await desactivarAlmacen(a.id)
        toast.success(`${a.nombre} desactivado`)
      } else {
        await reactivarAlmacen(a.id)
        toast.success(`${a.nombre} reactivado`)
      }
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Operación fallida'))
    }
  }

  const columns = useMemo(() => getTableColumns(), [])

  const hasFilters =
    !!filters.search || filters.status !== ALMACEN_STATUS.ALL

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gs-text">Almacenes</h1>
          <p className="text-gs-soft text-sm mt-1">
            Puntos físicos donde se almacena el inventario
            {total > 0 && (
              <span className="ml-2 text-gs-muted">· {total} {total === 1 ? 'almacén' : 'almacenes'}</span>
            )}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2"
        >
          <FiPlus size={16} />
          Nuevo Almacén
        </Button>
      </div>

      {error && (
        <div className="bg-gs-danger/10 border border-gs-danger/25 rounded-lg p-3 text-sm text-gs-danger mb-6">
          {error}
        </div>
      )}

      <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="flex-1 w-full">
            <SearchBar
              value={filters.search}
              onChange={(v) => setFilters({ search: v })}
              placeholder="Buscar por nombre o dirección…"
            />
          </div>
          <div className="w-full md:w-44">
            <Select
              value={filters.status}
              onChange={(v) => setFilters({ status: v })}
              options={ALMACEN_STATUS_OPTIONS}
              placeholder="Estado"
            />
          </div>
        </div>

        {isLoading ? (
          <AlmacenesSkeleton />
        ) : almacenes.length === 0 ? (
          <EmptyAlmacenes hasFilters={hasFilters} />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={almacenes}
              emptyMessage="No hay almacenes"
              actions={(row) => (
                <div className="flex items-center gap-1">
                  <Tooltip content="Editar almacén">
                    <button
                      onClick={() => setEditing(row)}
                      className="p-1.5 text-gs-muted hover:text-gs-accent transition-colors cursor-pointer"
                    >
                      <FiEdit2 size={15} />
                    </button>
                  </Tooltip>
                  <Tooltip content={
                    row.id === ALMACEN_PRINCIPAL_ID
                      ? 'No puedes desactivar el almacén Principal'
                      : row.active ? 'Desactivar almacén' : 'Reactivar almacén'
                  }>
                    <button
                      onClick={() => handleQuickToggle(row)}
                      disabled={row.id === ALMACEN_PRINCIPAL_ID}
                      className="p-1.5 text-gs-muted hover:text-gs-danger transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {row.active ? <FiUserX size={15} /> : <FiUserCheck size={15} />}
                    </button>
                  </Tooltip>
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

      <CreateAlmacenModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditAlmacenDrawer
        open={!!editing}
        onClose={() => setEditing(null)}
        almacen={editing}
      />
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

const StatusBadge = ({ active }) => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold font-['DM_Mono']"
    style={
      active
        ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid #10b98133' }
        : { background: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: '1px solid #94a3b833' }
    }
  >
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? '#10b981' : '#94a3b8' }} />
    {active ? 'Activo' : 'Inactivo'}
  </span>
)

const getTableColumns = () => [
  {
    key: 'nombre',
    label: 'Almacén',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#00C9A740,#0EA5E940)' }}
        >
          <Icon name="box" size={16} color="var(--gs-accent)" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gs-text truncate">
            {row.nombre}
            {row.id === ALMACEN_PRINCIPAL_ID && (
              <span className="ml-1.5 text-[10px] text-gs-accent font-['DM_Mono'] uppercase">(principal)</span>
            )}
          </p>
          {row.direccion && (
            <p className="text-xs text-gs-muted truncate">{row.direccion}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'responsable',
    label: 'Responsable',
    render: (_, row) => (
      <span className="text-sm text-gs-soft">
        {row.perfiles?.nombre || row.perfiles?.email || '—'}
      </span>
    ),
  },
  {
    key: 'active',
    label: 'Estado',
    sortable: true,
    render: (_, row) => <StatusBadge active={!!row.active} />,
  },
  {
    key: 'created_at',
    label: 'Creado',
    sortable: true,
    render: (value) => (value ? new Date(value).toLocaleDateString('es-MX') : '—'),
  },
]

const AlmacenesSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
)

const EmptyAlmacenes = ({ hasFilters }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gs-bg border border-gs-border mb-3">
      <Icon name="box" size={20} color="var(--gs-muted)" />
    </div>
    <p className="text-gs-soft text-sm mb-1">
      {hasFilters ? 'No se encontraron almacenes con esos filtros' : 'Aún no hay almacenes adicionales'}
    </p>
    <p className="text-gs-muted text-xs">
      {hasFilters ? 'Prueba ajustando o limpiando los filtros' : 'Crea uno con "Nuevo Almacén"'}
    </p>
  </div>
)
