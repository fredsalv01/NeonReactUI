import { useState, useEffect, useMemo } from 'react'
import {
  Button,
  DataTable,
  Icon,
  Pagination,
  Select,
  SearchBar,
  SkeletonRow,
  useToast,
} from '../../ui'
import { FiPlus, FiEdit2, FiUserX, FiUserCheck } from 'react-icons/fi'
import { useClientesStore } from '../../../stores/clientesStore'
import { CreateClienteModal } from '../modals/CreateClienteModal'
import { EditClienteDrawer } from '../drawers/EditClienteDrawer'
import {
  CLIENTE_STATUS,
  CLIENTE_STATUS_OPTIONS,
} from '../../../lib/constants/clienteConstants'

const PAGE_SIZE = 10

export const Clientes = () => {
  const { toast } = useToast()

  const clientes          = useClientesStore((s) => s.clientes)
  const total             = useClientesStore((s) => s.total)
  const isLoading         = useClientesStore((s) => s.isLoading)
  const error             = useClientesStore((s) => s.error)
  const filters           = useClientesStore((s) => s.filters)
  const setFilters        = useClientesStore((s) => s.setFilters)
  const fetchClientes     = useClientesStore((s) => s.fetchClientes)
  const desactivarCliente = useClientesStore((s) => s.desactivarCliente)
  const reactivarCliente  = useClientesStore((s) => s.reactivarCliente)

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes, filters])

  useEffect(() => {
    if (filters.pageSize !== PAGE_SIZE) setFilters({ pageSize: PAGE_SIZE })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleQuickToggle = async (cli) => {
    try {
      if (cli.active) {
        await desactivarCliente(cli.id)
        toast.success(`${cli.nombre} desactivado`)
      } else {
        await reactivarCliente(cli.id)
        toast.success(`${cli.nombre} reactivado`)
      }
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Operación fallida'))
    }
  }

  const columns = useMemo(() => getTableColumns(), [])

  const hasFilters =
    !!filters.search || filters.status !== CLIENTE_STATUS.ALL

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gs-text">Clientes</h1>
          <p className="text-gs-soft text-sm mt-1">
            Catálogo de clientes para registrar ventas
            {total > 0 && (
              <span className="ml-2 text-gs-muted">· {total} {total === 1 ? 'cliente' : 'clientes'}</span>
            )}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2"
        >
          <FiPlus size={16} />
          Nuevo Cliente
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
              placeholder="Buscar por nombre, documento, razón social, email o teléfono…"
            />
          </div>
          <div className="w-full md:w-44">
            <Select
              value={filters.status}
              onChange={(v) => setFilters({ status: v })}
              options={CLIENTE_STATUS_OPTIONS}
              placeholder="Estado"
            />
          </div>
        </div>

        {isLoading ? (
          <ClientesSkeleton />
        ) : clientes.length === 0 ? (
          <EmptyClientes hasFilters={hasFilters} />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={clientes}
              emptyMessage="No hay clientes"
              actions={(row) => (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditing(row)}
                    className="p-1.5 text-gs-muted hover:text-gs-accent transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleQuickToggle(row)}
                    className="p-1.5 text-gs-muted hover:text-gs-danger transition-colors cursor-pointer"
                    title={row.active ? 'Desactivar' : 'Reactivar'}
                  >
                    {row.active ? <FiUserX size={15} /> : <FiUserCheck size={15} />}
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

      <CreateClienteModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditClienteDrawer
        open={!!editing}
        onClose={() => setEditing(null)}
        cliente={editing}
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

const ClienteAvatar = ({ nombre }) => {
  const initial = (nombre || 'C').trim().charAt(0).toUpperCase()
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-gs-accent shrink-0"
      style={{ background: 'linear-gradient(135deg,#00C9A740,#0EA5E940)' }}
    >
      {initial}
    </div>
  )
}

const getTableColumns = () => [
  {
    key: 'nombre',
    label: 'Cliente',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <ClienteAvatar nombre={row.nombre} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gs-text truncate">{row.nombre}</p>
          {row.razon_social && (
            <p className="text-xs text-gs-muted truncate">{row.razon_social}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'nro_doc',
    label: 'Documento',
    render: (_, row) => (
      <div className="text-sm font-['DM_Mono'] text-gs-soft">
        {row.nro_doc ? (
          <>
            <span className="text-gs-muted mr-1">{row.tipo_doc}</span>
            {row.nro_doc}
          </>
        ) : '—'}
      </div>
    ),
  },
  {
    key: 'telefono',
    label: 'Teléfono',
    render: (v) => (
      <span className="text-sm text-gs-soft">{v || '—'}</span>
    ),
  },
  {
    key: 'email',
    label: 'Email',
    render: (v) => (
      <span className="text-sm text-gs-soft truncate">{v || '—'}</span>
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

const ClientesSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
)

const EmptyClientes = ({ hasFilters }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gs-bg border border-gs-border mb-3">
      <Icon name="users" size={20} color="var(--gs-muted)" />
    </div>
    <p className="text-gs-soft text-sm mb-1">
      {hasFilters ? 'No se encontraron clientes con esos filtros' : 'Aún no hay clientes registrados'}
    </p>
    <p className="text-gs-muted text-xs">
      {hasFilters ? 'Prueba ajustando o limpiando los filtros' : 'Crea el primero con "Nuevo Cliente"'}
    </p>
  </div>
)
