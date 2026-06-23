import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSalesStore } from '../../../stores/salesStore'
import {
  Button,
  DataTable,
  Icon,
  Pagination,
  Select,
  SearchBar,
  SkeletonRow,
  Drawer,
  SkeletonBlock,
  DatePicker,
  Tooltip,
  useToast
} from '../../ui'
import { SalesDetailsDrawer } from '../drawers/SalesDetailsDrawer'
import { EditVentaDrawer } from '../drawers/EditVentaDrawer'
import { CreateVentaModal } from '../modals/CreateVentaModal'
import { PAGE_SIZES } from '../../../lib/constants/inventoryConstants'
import { FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi'

export const Sales = () => {
  const { toast } = useToast()
  const navigate = useNavigate()

  // States
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterDate, setFilterDate] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [showSkeleton, setShowSkeleton] = useState(true)

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedVenta, setSelectedVenta] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Stable callbacks
  const handleCloseCreateModal = useCallback(() => setCreateModalOpen(false), [])
  const handleCloseDetailsDrawer = useCallback(() => setDetailsDrawerOpen(false), [])
  const handleCloseEditDrawer = useCallback(() => setEditDrawerOpen(false), [])

  // Data from store
  const ventas = useSalesStore(state => state.ventas)
  const isLoading = useSalesStore(state => state.isLoading)
  const error = useSalesStore(state => state.error)
  const fetchVentas = useSalesStore(state => state.fetchVentas)
  const deleteVenta = useSalesStore(state => state.deleteVenta)

  // Load ventas on mount
  useEffect(() => {
    fetchVentas()
  }, [fetchVentas])

  // Skeleton Loading Effect
  useEffect(() => {
    if (!isLoading && ventas.length > 0) {
      setShowSkeleton(true)
      const timer = setTimeout(() => setShowSkeleton(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, ventas])

  // ────────────────────────────────────────────────────────────────
  // Computed Values
  // ────────────────────────────────────────────────────────────────

  const uniqueCategories = useMemo(() => {
    const categories = new Set(ventas.filter(Boolean).map(v => v.equipos?.tipo).filter(Boolean))
    return Array.from(categories).sort()
  }, [ventas])

  const categoriaOptions = useMemo(() =>
    uniqueCategories.map(cat => ({ value: cat, label: cat })),
    [uniqueCategories]
  )

  const uniqueTipos = useMemo(() => {
    const tipos = new Set(ventas.filter(Boolean).map(v => v.equipos?.tipo).filter(Boolean))
    return Array.from(tipos).sort()
  }, [ventas])

  const tipoOptions = useMemo(() =>
    uniqueTipos.map(tipo => ({ value: tipo, label: tipo })),
    [uniqueTipos]
  )

  const filteredVentas = useMemo(() => {
    return ventas.filter(venta => {
      if (!venta) return false

      const matchesSearch = matchesSearchTerm(venta, searchTerm)
      const matchesCategoria = !filterCategoria || venta.equipos?.tipo === filterCategoria
      const matchesTipo = !filterTipo || venta.equipos?.tipo === filterTipo

      let matchesDate = true
      if (filterDate instanceof Date) {
        const ventaDate = new Date(venta.created_at)
        matchesDate =
          ventaDate.getFullYear() === filterDate.getFullYear() &&
          ventaDate.getMonth() === filterDate.getMonth() &&
          ventaDate.getDate() === filterDate.getDate()
      }

      return matchesSearch && matchesCategoria && matchesTipo && matchesDate
    })
  }, [ventas, searchTerm, filterCategoria, filterTipo, filterDate])

  const paginatedVentas = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredVentas.slice(start, start + pageSize)
  }, [filteredVentas, currentPage, pageSize])

  const totalPages = Math.ceil(filteredVentas.length / pageSize)
  const totalVentas = filteredVentas.reduce((sum, v) => sum + (v.monto_total || 0), 0)

  // ────────────────────────────────────────────────────────────────
  // Event Handlers
  // ────────────────────────────────────────────────────────────────

  const handleOpenDetails = (venta) => {
    setSelectedVenta(venta)
    setDetailsDrawerOpen(true)
  }

  const handleOpenEdit = (venta) => {
    setSelectedVenta(venta)
    setEditDrawerOpen(true)
  }

  const handleDeleteClick = (venta) => {
    setSelectedVenta(venta)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedVenta) return

    setIsDeleting(true)
    try {
      await deleteVenta(selectedVenta.id)
      toast.success('Venta eliminada correctamente')
      setDeleteConfirmOpen(false)
      setSelectedVenta(null)
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false)
    setSelectedVenta(null)
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const renderTableContent = () => {
    if (isLoading || showSkeleton) {
      return <TableSkeleton pageSize={pageSize} />
    }

    if (filteredVentas.length === 0) {
      return (
        <EmptyState
          hasFilters={!!searchTerm || !!filterCategoria || !!filterTipo || filterDate instanceof Date}
        />
      )
    }

    return (
      <>
        <DataTable
          columns={getTableColumns()}
          data={paginatedVentas}
          selectable
          emptyMessage="No hay ventas"
          actions={(row) => (
            <ActionButtons
              venta={row}
              onDetailsClick={handleOpenDetails}
              onEditClick={handleOpenEdit}
              onDeleteClick={handleDeleteClick}
            />
          )}
        />

        <PaginationSection
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalVentas={filteredVentas.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </>
    )
  }

  // ────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-8">
          Ventas
        </h1>
        <div className="bg-gs-danger/10 border border-gs-danger/25 rounded-lg p-4 text-gs-danger">
          Error al cargar las ventas: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      {isLoading ? (
        <HeaderSkeleton />
      ) : (
        <Header
          totalVentas={ventas.length}
          totalMonto={ventas.reduce((sum, v) => sum + (v.monto_total || 0), 0)}
          onAddClick={() => setCreateModalOpen(true)}
        />
      )}

      {/* Main Content */}
      <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6 space-y-6">
        {/* Filters */}
        {isLoading ? (
          <FiltersSkeleton />
        ) : (
          <Filters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterCategoria={filterCategoria}
            onCategoriaChange={setFilterCategoria}
            filterTipo={filterTipo}
            onTipoChange={setFilterTipo}
            filterDate={filterDate}
            onDateChange={setFilterDate}
            categoriaOptions={categoriaOptions}
            tipoOptions={tipoOptions}
          />
        )}

        {/* Table */}
        {renderTableContent()}
      </div>

      {/* Modal de creación */}
      <CreateVentaModal
        open={createModalOpen}
        onClose={handleCloseCreateModal}
      />

      {/* Drawers */}
      <SalesDetailsDrawer
        open={detailsDrawerOpen}
        venta={selectedVenta}
        onClose={handleCloseDetailsDrawer}
      />

      <EditVentaDrawer
        open={editDrawerOpen}
        venta={selectedVenta}
        onClose={handleCloseEditDrawer}
        onSuccess={() => {
          setEditDrawerOpen(false)
          setSelectedVenta(null)
        }}
      />

      <DeleteConfirmModal
        open={deleteConfirmOpen}
        venta={selectedVenta}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

const Header = ({ totalVentas, totalMonto, onAddClick }) => (
  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-2">
        Ventas
      </h1>
      <p className="text-gs-soft">
        Total de ventas: <span className="font-semibold text-gs-text">{totalVentas}</span>
      </p>
      <p className="text-gs-soft text-sm mt-2">
        Monto Total: <span className="font-semibold text-gs-accent">${totalMonto.toFixed(2)}</span>
      </p>
    </div>
    <Button
      variant="primary"
      onClick={onAddClick}
      className="flex items-center gap-2 w-full md:w-auto h-fit"
    >
      <FiPlus size={18} />
      Nueva Venta
    </Button>
  </div>
)

const HeaderSkeleton = () => (
  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
    <div className="flex-1 space-y-3">
      <SkeletonBlock className="h-10 w-2/3" />
      <SkeletonBlock className="h-5 w-1/3" />
      <SkeletonBlock className="h-5 w-1/4" />
    </div>
  </div>
)

const Filters = ({
  searchTerm,
  onSearchChange,
  filterCategoria,
  onCategoriaChange,
  filterTipo,
  onTipoChange,
  filterDate,
  onDateChange,
  categoriaOptions,
  tipoOptions,
}) => (
  <div className="space-y-4">
    <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
      <div className="flex-1">
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar por nombre de equipo, vendedor..."
          className="w-full"
        />
      </div>
      <Select
        options={categoriaOptions}
        value={filterCategoria}
        onChange={onCategoriaChange}
        placeholder="Categoría..."
        label="Categoría"
        className="w-full md:w-48"
      />
      <Select
        options={tipoOptions}
        value={filterTipo}
        onChange={onTipoChange}
        placeholder="Tipo..."
        label="Tipo"
        className="w-full md:w-48"
      />
      <div className="w-full md:w-48">
        <DatePicker
          mode="single"
          value={filterDate}
          onChange={onDateChange}
          placeholder="Filtrar por fecha"
          clearable
        />
      </div>
    </div>
  </div>
)

const FiltersSkeleton = () => (
  <div className="space-y-4">
    <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
      <div className="flex-1">
        <SkeletonBlock className="h-4 w-20 mb-2" />
        <SkeletonBlock className="h-10 w-full" />
      </div>
      <div className="w-full md:w-48">
        <SkeletonBlock className="h-4 w-20 mb-2" />
        <SkeletonBlock className="h-10 w-full" />
      </div>
      <div className="w-full md:w-48">
        <SkeletonBlock className="h-4 w-16 mb-2" />
        <SkeletonBlock className="h-10 w-full" />
      </div>
      <div className="w-full md:w-40">
        <SkeletonBlock className="h-4 w-12 mb-2" />
        <SkeletonBlock className="h-10 w-full" />
      </div>
    </div>
  </div>
)

const TableSkeleton = ({ pageSize }) => (
  <table className="w-full">
    <tbody className="space-y-2">
      {[...Array(pageSize)].map((_, i) => (
        <SkeletonRow key={i} cols={7} />
      ))}
    </tbody>
  </table>
)

const EmptyState = ({ hasFilters }) => (
  <div className="text-center py-12">
    <Icon name="box" size={48} color="currentColor" className="text-gs-muted mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gs-text mb-1">Sin resultados</h3>
    <p className="text-gs-soft">
      {hasFilters
        ? 'No se encontraron ventas que coincidan con tus filtros'
        : 'Comienza registrando tu primera venta'}
    </p>
  </div>
)

const ActionButtons = ({ venta, onDetailsClick, onEditClick, onDeleteClick }) => (
  <div className="flex items-center gap-2">
    <Tooltip content="Ver detalles">
      <button
        onClick={() => onDetailsClick(venta)}
        className="p-1.5 text-gs-soft hover:text-gs-accent hover:bg-gs-border rounded transition-colors"
      >
        <FiEye size={16} />
      </button>
    </Tooltip>
    <Tooltip content="Editar venta">
      <button
        onClick={() => onEditClick(venta)}
        className="p-1.5 text-gs-soft hover:text-amber-400 hover:bg-gs-border rounded transition-colors"
      >
        <FiEdit2 size={16} />
      </button>
    </Tooltip>
    <Tooltip content="Eliminar venta">
      <button
        onClick={() => onDeleteClick(venta)}
        className="p-1.5 text-gs-soft hover:text-gs-danger hover:bg-gs-border rounded transition-colors"
      >
        <FiTrash2 size={16} />
      </button>
    </Tooltip>
  </div>
)

const PaginationSection = ({
  currentPage,
  totalPages,
  pageSize,
  totalVentas,
  onPageChange,
  onPageSizeChange,
}) => (
  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t border-gs-border">
    <div className="flex items-center gap-3">
      <label className="text-sm text-gs-soft">Registros por página:</label>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
        className="px-3 py-2 bg-gs-bg border border-gs-border rounded-lg text-gs-text text-sm"
      >
        {PAGE_SIZES.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
    </div>
    <Pagination
      page={currentPage}
      totalPages={totalPages}
      total={totalVentas}
      onPageChange={onPageChange}
    />
  </div>
)

const DeleteConfirmModal = ({ open, venta, isDeleting, onConfirm, onCancel }) => {
  if (!open || !venta) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-gs-card border border-gs-border rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gs-danger/10 rounded-lg">
            <Icon name="warning" size={20} color="var(--gs-danger)" />
          </div>
          <div>
            <h3 className="font-semibold text-gs-text">Eliminar Venta</h3>
            <p className="text-sm text-gs-soft">Esta acción no se puede deshacer</p>
          </div>
        </div>

        <p className="text-sm text-gs-text">
          ¿Estás seguro de que deseas eliminar la venta de <strong>{venta.equipos?.nombre}</strong>?
        </p>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Icon name="trash" size={16} />
                <span>Sí, Eliminar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Helper Functions
// ────────────────────────────────────────────────────────────────

const matchesSearchTerm = (venta, searchTerm) => {
  if (!venta || !searchTerm) return true
  const term = searchTerm.toLowerCase()
  const itemMatch = (venta.venta_items || []).some(
    (it) => it.equipos?.nombre?.toLowerCase().includes(term)
  )
  return (
    itemMatch ||
    venta.equipos?.nombre?.toLowerCase().includes(term) ||
    venta.perfiles?.nombre?.toLowerCase().includes(term) ||
    venta.cliente?.toLowerCase().includes(term) ||
    String(venta.id ?? '').toLowerCase().includes(term)
  )
}

// items helpers — venta_items es la fuente real; fallback a legacy cantidad
const itemsOf = (row) => row.venta_items || []
const itemsCount = (row) => itemsOf(row).length || (row.cantidad ? 1 : 0)
const totalCantidad = (row) =>
  itemsOf(row).reduce((s, it) => s + (it.cantidad || 0), 0) || (row.cantidad || 0)

const getTableColumns = () => [
  {
    key: 'id',
    label: 'ID Venta',
    mono: true,
    sortable: true,
    render: (value) => (value != null ? `#${value}` : '')
  },
  {
    key: 'cliente',
    label: 'Cliente',
    sortable: true,
    render: (_, row) => row.cliente || row.clientes?.nombre || 'Sin cliente'
  },
  {
    key: 'items_count',
    label: 'Productos',
    render: (_, row) => {
      const n = itemsCount(row)
      const first = itemsOf(row)[0]?.equipos?.nombre || row.equipos?.nombre
      if (n <= 1) return first || '—'
      return (
        <span>
          <span className="text-gs-text">{first}</span>
          <span className="text-sm text-green-500 ml-1">+{n - 1}</span>
        </span>
      )
    }
  },
  {
    key: 'cantidad_total',
    label: 'Cantidad',
    render: (_, row) => `${totalCantidad(row)} unid.`
  },
  {
    key: 'monto_total',
    label: 'Total',
    sortable: true,
    render: (_, row) => {
      const n = Number(row.monto_total ?? row.total)
      const text = Number.isFinite(n) ? `$${n.toFixed(2)}` : '$0.00'
      return <span className="font-semibold text-green-400">{text}</span>
    }
  },
  {
    key: 'created_at',
    label: 'Fecha',
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString('es-MX')
  },
]
