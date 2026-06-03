import { useState, useMemo, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useInventoryStore } from '../../../stores/inventoryStore'
import {
  Button,
  DataTable,
  Badge,
  Icon,
  Pagination,
  Select,
  SearchBar,
  SkeletonRow,
  Drawer,
  QRCode,
  SkeletonBlock,
  useToast
} from '../../ui'
import { AddEquipoModal } from '../modals/AddEquipoModal'
import { ProductDetailsDrawer } from '../drawers/ProductDetailsDrawer'
import { ESTADO_OPTIONS, PAGE_SIZES } from '../../../lib/constants/inventoryConstants'
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────

export const Inventory = () => {
  const { toast } = useToast()

  // States
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [showSkeleton, setShowSkeleton] = useState(true)

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [qrDrawerOpen, setQrDrawerOpen] = useState(false)
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false)
  const [selectedEquipo, setSelectedEquipo] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)

  // Stable callbacks
  const handleCloseAddModal = useCallback(() => setAddModalOpen(false), [])
  const handleCloseQrDrawer = useCallback(() => setQrDrawerOpen(false), [])
  const handleCloseDetailsDrawer = useCallback(() => setDetailsDrawerOpen(false), [])

  // Data from store
  const equipos = useInventoryStore(state => state.equipos)
  const isLoading = useInventoryStore(state => state.isLoading)
  const error = useInventoryStore(state => state.error)
  const fetchEquipos = useInventoryStore(state => state.fetchEquipos)
  const deleteEquipo = useInventoryStore(state => state.deleteEquipo)

  // Load equipos on mount
  useEffect(() => {
    fetchEquipos()
  }, [fetchEquipos])

  // Skeleton Loading Effect
  useEffect(() => {
    if (!isLoading && equipos.length > 0) {
      setShowSkeleton(true)
      const timer = setTimeout(() => setShowSkeleton(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, equipos])

  // ────────────────────────────────────────────────────────────────
  // Computed Values
  // ────────────────────────────────────────────────────────────────

  const uniqueTipos = useMemo(() => {
    const tipos = new Set(equipos.map(e => e.tipo))
    return Array.from(tipos).sort()
  }, [equipos])

  const tipoOptions = useMemo(() =>
    uniqueTipos.map(tipo => ({ value: tipo, label: tipo })),
    [uniqueTipos]
  )

  const filteredEquipos = useMemo(() => {
    return equipos.filter(equipo => {
      const matchesSearch = matchesSearchTerm(equipo, searchTerm)
      const matchesEstado = !filterEstado || equipo.estado === filterEstado
      const matchesTipo = !filterTipo || equipo.tipo === filterTipo

      return matchesSearch && matchesEstado && matchesTipo
    })
  }, [equipos, searchTerm, filterEstado, filterTipo])

  const paginatedEquipos = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredEquipos.slice(start, start + pageSize)
  }, [filteredEquipos, currentPage, pageSize])

  const totalPages = Math.ceil(filteredEquipos.length / pageSize)

  // ────────────────────────────────────────────────────────────────
  // Event Handlers
  // ────────────────────────────────────────────────────────────────

  const handleOpenQR = (equipo) => {
    setSelectedEquipo(equipo)
    setQrDrawerOpen(true)
    setQrLoading(true)
    setTimeout(() => setQrLoading(false), 1000)
  }

  const handleOpenDetails = (equipo) => {
    setSelectedEquipo(equipo)
    setDetailsDrawerOpen(true)
  }

  const handleRefreshData = () => {
    // Trigger a re-fetch of data
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
      return
    }

    try {
      await deleteEquipo(id)
      toast.success('Equipo eliminado correctamente')
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  // ────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-8">
          Inventario
        </h1>
        <div className="bg-gs-danger/10 border border-gs-danger/25 rounded-lg p-4 text-gs-danger">
          Error al cargar el inventario: {error.message}
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
          totalEquipos={equipos.length}
          totalStock={equipos.reduce((sum, e) => sum + e.stock, 0)}
          onAddClick={() => setAddModalOpen(true)}
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
            filterEstado={filterEstado}
            onEstadoChange={setFilterEstado}
            filterTipo={filterTipo}
            onTipoChange={setFilterTipo}
            tipoOptions={tipoOptions}
          />
        )}

        {/* Table */}
        {isLoading || showSkeleton ? (
          <TableSkeleton pageSize={pageSize} />
        ) : filteredEquipos.length === 0 ? (
          <EmptyState
            hasFilters={!!searchTerm || !!filterEstado || !!filterTipo}
          />
        ) : (
          <>
            <DataTable
              columns={getTableColumns()}
              data={paginatedEquipos}
              selectable
              emptyMessage="No hay equipos"
              actions={(row) => (
                <ActionButtons
                  equipo={row}
                  onQRClick={handleOpenQR}
                  onDetailsClick={handleOpenDetails}
                  onDeleteClick={handleDelete}
                />
              )}
            />

            {/* Pagination */}
            <PaginationSection
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalEquipos={filteredEquipos.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>

      {/* Modals & Drawers */}
      <AddEquipoModal
        open={addModalOpen}
        onClose={handleCloseAddModal}
      />

      <QRDrawer
        open={qrDrawerOpen}
        equipo={selectedEquipo}
        loading={qrLoading}
        onClose={handleCloseQrDrawer}
      />

      <ProductDetailsDrawer
        open={detailsDrawerOpen}
        equipo={selectedEquipo}
        onClose={handleCloseDetailsDrawer}
        onStatusChange={handleRefreshData}
      />
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

const Header = ({ totalEquipos, totalStock, onAddClick }) => (
  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-2">
        Inventario
      </h1>
      <p className="text-gs-soft">
        Total de equipos: <span className="font-semibold text-gs-text">{totalEquipos}</span>
      </p>
      <p className="text-gs-soft text-sm mt-2">
        Stock Total: <span className="font-semibold text-gs-accent">{totalStock}</span>
      </p>
    </div>
    <Button
      variant="primary"
      onClick={onAddClick}
      className="flex items-center gap-2 w-full md:w-auto h-fit"
    >
      <FiPlus size={18} />
      Agregar Equipo
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
    <SkeletonBlock className="h-11 w-full md:w-40" />
  </div>
)

const Filters = ({
  searchTerm,
  onSearchChange,
  filterEstado,
  onEstadoChange,
  filterTipo,
  onTipoChange,
  tipoOptions,
}) => (
  <div className="space-y-4">
    <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
      <div className="flex-1">
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar por nombre, serie o código..."
          className="w-full"
        />
      </div>
      <Select
        options={ESTADO_OPTIONS}
        value={filterEstado}
        onChange={onEstadoChange}
        placeholder="Estado..."
        label="Estado"
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
        <SkeletonBlock className="h-4 w-12 mb-2" />
        <SkeletonBlock className="h-10 w-full" />
      </div>
      <div className="w-full md:w-48">
        <SkeletonBlock className="h-4 w-10 mb-2" />
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
        ? 'No se encontraron equipos que coincidan con tus filtros'
        : 'Comienza agregando tu primer equipo al inventario'}
    </p>
  </div>
)

const ActionButtons = ({ equipo, onQRClick, onDetailsClick, onDeleteClick }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onQRClick(equipo)}
      className="p-1.5 text-gs-soft hover:text-gs-teal hover:bg-gs-border rounded transition-colors"
      title="Ver código QR"
    >
      <Icon name="qr" size={16} />
    </button>
    <button
      onClick={() => onDetailsClick(equipo)}
      className="p-1.5 text-gs-soft hover:text-gs-accent hover:bg-gs-border rounded transition-colors"
      title="Ver detalles"
    >
      <FiEye size={16} />
    </button>
    <button
      className="p-1.5 text-gs-soft hover:text-gs-accent hover:bg-gs-border rounded transition-colors"
      title="Editar"
    >
      <FiEdit2 size={16} />
    </button>
    <button
      onClick={() => onDeleteClick(equipo.id)}
      className="p-1.5 text-gs-soft hover:text-gs-danger hover:bg-gs-border rounded transition-colors"
      title="Eliminar"
    >
      <FiTrash2 size={16} />
    </button>
  </div>
)

const PaginationSection = ({
  currentPage,
  totalPages,
  pageSize,
  totalEquipos,
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
      total={totalEquipos}
      onPageChange={onPageChange}
    />
  </div>
)

const QRDrawer = ({ open, equipo, loading, onClose }) => {
  if (!equipo) return null

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Código QR"
      subtitle={`${equipo.id} · ${equipo.nombre}`}
      side="right"
      size="md"
    >
      {loading ? (
        <div className="space-y-4">
          <SkeletonBlock className="w-48 h-48 mx-auto" />
          <SkeletonBlock className="h-8 w-full" />
          <SkeletonBlock className="h-6 w-3/4" />
        </div>
      ) : (
        <QRDrawerContent equipo={equipo} />
      )}
    </Drawer>
  )
}

const QRDrawerContent = ({ equipo }) => (
  <div className="space-y-6">
    <div className="flex justify-center p-4 bg-gs-bg rounded-lg">
      <QRCode
        data={`${equipo.id}|${equipo.serie}`}
        size={220}
      />
    </div>

    <div className="space-y-4 border-t border-gs-border pt-4">
      <InfoRow label="Código" value={equipo.id} mono />
      <InfoRow label="Nombre" value={equipo.nombre} />
      <InfoRow label="Número de Serie" value={equipo.serie} mono />
      <InfoRow label="Tipo" value={equipo.tipo} />
      <div>
        <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">Estado</p>
        <div className="mt-1">
          <Badge estado={equipo.estado} />
        </div>
      </div>
      <InfoRow
        label="Stock"
        value={`${equipo.stock} unidades`}
        valueClassName={
          equipo.stock > 5 ? 'text-green-400' : equipo.stock > 0 ? 'text-yellow-400' : 'text-red-400'
        }
      />
      <InfoRow label="Precio de Compra" value={`$${parseFloat(equipo.precio_compra).toFixed(2)}`} />
      <InfoRow
        label="Precio de Venta"
        value={`$${parseFloat(equipo.precio_venta).toFixed(2)}`}
        valueClassName="text-gs-accent"
      />
    </div>
  </div>
)

const InfoRow = ({ label, value, mono = false, valueClassName = '' }) => (
  <div>
    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">{label}</p>
    <p className={`text-sm font-semibold text-gs-text ${mono ? "font-['DM_Mono']" : ''} ${valueClassName}`}>
      {value}
    </p>
  </div>
)

// ────────────────────────────────────────────────────────────────
// Helper Functions
// ────────────────────────────────────────────────────────────────

const matchesSearchTerm = (equipo, searchTerm) => {
  if (!searchTerm) return true
  const term = searchTerm.toLowerCase()
  return (
    equipo.nombre.toLowerCase().includes(term) ||
    equipo.serie.toLowerCase().includes(term) ||
    equipo.id.toLowerCase().includes(term)
  )
}

const getTableColumns = () => [
  { key: 'id', label: 'Código', mono: true, sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'tipo', label: 'Tipo', sortable: true },
  { key: 'serie', label: 'Serie', mono: true },
  {
    key: 'stock',
    label: 'Stock',
    sortable: true,
    render: (value) => (
      <span className={`font-semibold ${
        value > 5 ? 'text-green-400' : value > 0 ? 'text-yellow-400' : 'text-red-400'
      }`}>
        {value}
      </span>
    )
  },
  {
    key: 'estado',
    label: 'Estado',
    render: (value) => <Badge estado={value} />
  },
  {
    key: 'precio_venta',
    label: 'Precio Venta',
    sortable: true,
    render: (value) => `$${parseFloat(value).toFixed(2)}`
  },
]
