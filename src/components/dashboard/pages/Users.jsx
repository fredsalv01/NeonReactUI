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
import { useUsuariosStore } from '../../../stores/usuariosStore'
import { useAuth } from '../../../hooks/useAuth'
import { CreateUserModal } from '../modals/CreateUserModal'
import { EditUserDrawer } from '../drawers/EditUserDrawer'
import {
  ROLE_OPTIONS,
  ROLE_COLORS,
  DEFAULT_ROLE_COLOR,
  USUARIO_STATUS,
  USUARIO_STATUS_OPTIONS,
} from '../../../lib/constants/userConstants'

const PAGE_SIZE = 10

export const Users = () => {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()

  // Store
  const usuarios          = useUsuariosStore((s) => s.usuarios)
  const total             = useUsuariosStore((s) => s.total)
  const isLoading         = useUsuariosStore((s) => s.isLoading)
  const error             = useUsuariosStore((s) => s.error)
  const filters           = useUsuariosStore((s) => s.filters)
  const setFilters        = useUsuariosStore((s) => s.setFilters)
  const fetchUsuarios     = useUsuariosStore((s) => s.fetchUsuarios)
  const desactivarUsuario = useUsuariosStore((s) => s.desactivarUsuario)
  const reactivarUsuario  = useUsuariosStore((s) => s.reactivarUsuario)

  // UI state
  const [createOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  // Fetch al montar y cuando cambien los filtros
  useEffect(() => {
    fetchUsuarios()
  }, [fetchUsuarios, filters])

  // Asegurar pageSize fijo (10) al primer render
  useEffect(() => {
    if (filters.pageSize !== PAGE_SIZE) setFilters({ pageSize: PAGE_SIZE })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleQuickToggle = async (usuario) => {
    if (currentUser?.id === usuario.id) {
      toast.error('No puedes desactivar tu propia cuenta')
      return
    }
    try {
      if (usuario.active) {
        await desactivarUsuario(usuario.id)
        toast.success(`${usuario.nombre} desactivado`)
      } else {
        await reactivarUsuario(usuario.id)
        toast.success(`${usuario.nombre} reactivado`)
      }
    } catch (err) {
      toast.error('Error: ' + (err.message || 'Operación fallida'))
    }
  }

  const columns = useMemo(
    () => getTableColumns({ currentUserId: currentUser?.id }),
    [currentUser?.id]
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gs-text">Usuarios</h1>
          <p className="text-gs-soft text-sm mt-1">
            Gestión de cuentas y roles del sistema
            {total > 0 && (
              <span className="ml-2 text-gs-muted">· {total} {total === 1 ? 'usuario' : 'usuarios'}</span>
            )}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2"
        >
          <FiPlus size={16} />
          Nuevo Usuario
        </Button>
      </div>

      {/* Error inline */}
      {error && (
        <div className="bg-gs-danger/10 border border-gs-danger/25 rounded-lg p-3 text-sm text-gs-danger mb-6">
          {error}
        </div>
      )}

      {/* Main */}
      <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="flex-1 w-full">
            <SearchBar
              value={filters.search}
              onChange={(v) => setFilters({ search: v })}
              placeholder="Buscar por nombre o email…"
            />
          </div>

          <div className="w-full md:w-48">
            <Select
              value={filters.rolId ?? ''}
              onChange={(v) => setFilters({ rolId: v ? Number(v) : null })}
              options={[{ value: '', label: 'Todos los roles' }, ...ROLE_OPTIONS]}
              placeholder="Rol"
            />
          </div>

          <div className="w-full md:w-44">
            <Select
              value={filters.status}
              onChange={(v) => setFilters({ status: v })}
              options={USUARIO_STATUS_OPTIONS}
              placeholder="Estado"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <UsersSkeleton />
        ) : usuarios.length === 0 ? (
          <EmptyUsers hasFilters={!!filters.search || !!filters.rolId || filters.status !== USUARIO_STATUS.ALL} />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={usuarios}
              emptyMessage="No hay usuarios"
              actions={(row) => (
                <div className="flex items-center gap-1">
                  <Tooltip content="Editar usuario">
                    <button
                      onClick={() => setEditingUser(row)}
                      className="p-1.5 text-gs-muted hover:text-gs-accent transition-colors cursor-pointer"
                    >
                      <FiEdit2 size={15} />
                    </button>
                  </Tooltip>
                  <Tooltip content={
                    currentUser?.id === row.id
                      ? 'No puedes desactivar tu propia cuenta'
                      : row.active ? 'Desactivar usuario' : 'Reactivar usuario'
                  }>
                    <button
                      onClick={() => handleQuickToggle(row)}
                      disabled={currentUser?.id === row.id}
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

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditUserDrawer
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        usuario={editingUser}
      />
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || 'U'

const RoleBadge = ({ nombre }) => {
  const c = ROLE_COLORS[nombre] || DEFAULT_ROLE_COLOR
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-['DM_Mono']"
      style={{ background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}
    >
      {nombre || '—'}
    </span>
  )
}

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

const UserAvatar = ({ nombre }) => (
  <div
    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-gs-accent shrink-0"
    style={{ background: 'linear-gradient(135deg,#00C9A740,#0EA5E940)' }}
  >
    {initialsOf(nombre)}
  </div>
)

const getTableColumns = ({ currentUserId }) => [
  {
    key: 'nombre',
    label: 'Usuario',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <UserAvatar nombre={row.nombre} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gs-text truncate">
            {row.nombre}
            {row.id === currentUserId && (
              <span className="ml-1.5 text-[10px] text-gs-accent font-['DM_Mono'] uppercase">(tú)</span>
            )}
          </p>
          <p className="text-xs text-gs-muted truncate">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'rol',
    label: 'Rol',
    sortable: true,
    render: (_, row) => <RoleBadge nombre={row.roles?.nombre} />,
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

const UsersSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
)

const EmptyUsers = ({ hasFilters }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gs-bg border border-gs-border mb-3">
      <Icon name="users" size={20} color="var(--gs-muted)" />
    </div>
    <p className="text-gs-soft text-sm mb-1">
      {hasFilters ? 'No se encontraron usuarios con esos filtros' : 'Aún no hay usuarios creados'}
    </p>
    <p className="text-gs-muted text-xs">
      {hasFilters ? 'Prueba ajustando o limpiando los filtros' : 'Crea el primero con "Nuevo Usuario"'}
    </p>
  </div>
)
