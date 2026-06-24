import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  Tooltip,
  useToast
} from '../../ui'
import { AddEquipoModal } from '../modals/AddEquipoModal'
import { ProductDetailsDrawer } from '../drawers/ProductDetailsDrawer'
import { EditEquipoDrawer } from '../drawers/EditEquipoDrawer'
import { STOCK_ESTADO_OPTIONS, STOCK_THRESHOLDS, PAGE_SIZES, getStockEstado } from '../../../lib/constants/inventoryConstants'
import { FiPlus, FiTrash2, FiEye, FiEdit2, FiDownload, FiExternalLink } from 'react-icons/fi'

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────

export const Inventory = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // States
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [onlyAlerta, setOnlyAlerta] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [showSkeleton, setShowSkeleton] = useState(true)

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [qrDrawerOpen, setQrDrawerOpen] = useState(false)
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedEquipo, setSelectedEquipo] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Stable callbacks
  const handleCloseAddModal = useCallback(() => setAddModalOpen(false), [])
  const handleCloseQrDrawer = useCallback(() => setQrDrawerOpen(false), [])
  const handleCloseDetailsDrawer = useCallback(() => setDetailsDrawerOpen(false), [])
  const handleCloseEditDrawer = useCallback(() => setEditDrawerOpen(false), [])

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

  // ?selected=:id (viene del scanner QR): abre el drawer una vez que equipos cargaron
  useEffect(() => {
    const selectedId = searchParams.get('selected')
    if (!selectedId || equipos.length === 0) return
    // Match flexible: id puede venir como número o como SKU (EQ-037)
    const eq = equipos.find(e =>
      String(e?.id) === String(selectedId) || String(e?.sku) === String(selectedId)
    )
    if (eq) {
      setSelectedEquipo(eq)
      setDetailsDrawerOpen(true)
    } else {
      toast?.error?.(`Equipo "${selectedId}" no encontrado`)
    }
    // Limpia el param para que no se re-abra al cerrar el drawer
    setSearchParams({}, { replace: true })
  }, [equipos, searchParams, setSearchParams, toast])

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
    const tipos = new Set(equipos.filter(Boolean).map(e => e.tipo))
    return Array.from(tipos).sort()
  }, [equipos])

  const tipoOptions = useMemo(() =>
    uniqueTipos.map(tipo => ({ value: tipo, label: tipo })),
  [uniqueTipos]
  )

  const filteredEquipos = useMemo(() => {
    return equipos.filter(equipo => {
      if (!equipo) return false
      const matchesSearch = matchesSearchTerm(equipo, searchTerm)
      const matchesEstado = !filterEstado || getStockEstado(equipo.stock_total) === filterEstado
      const matchesTipo = !filterTipo || equipo.tipo === filterTipo
      // Stock <= BAJO_MAX cubre 'Stock Bajo' + 'Sin Stock' en un solo toggle
      const matchesAlerta = !onlyAlerta || Number(equipo.stock_total) <= STOCK_THRESHOLDS.BAJO_MAX

      return matchesSearch && matchesEstado && matchesTipo && matchesAlerta
    })
  }, [equipos, searchTerm, filterEstado, filterTipo, onlyAlerta])

  const alertaCount = useMemo(() =>
    equipos.filter(e => e && Number(e.stock_total) <= STOCK_THRESHOLDS.BAJO_MAX).length,
  [equipos])

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

  const handleOpenEdit = (equipo) => {
    setSelectedEquipo(equipo)
    setEditDrawerOpen(true)
  }

  const handleDeleteClick = (equipo) => {
    setSelectedEquipo(equipo)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedEquipo) return

    setIsDeleting(true)
    try {
      await deleteEquipo(selectedEquipo.id)
      toast.success('Equipo eliminado correctamente')
      setDeleteConfirmOpen(false)
      setSelectedEquipo(null)
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false)
    setSelectedEquipo(null)
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const renderTableContent = () => {
    if (isLoading || showSkeleton) {
      return <TableSkeleton pageSize={pageSize} />
    }

    if (filteredEquipos.length === 0) {
      return (
        <EmptyState
          hasFilters={!!searchTerm || !!filterEstado || !!filterTipo}
        />
      )
    }

    return (
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
              onEditClick={handleOpenEdit}
              onDeleteClick={handleDeleteClick}
              onViewFullDetailsClick={() => navigate(`/dashboard/equipment/${row.id}`)}
            />
          )}
        />

        <PaginationSection
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalEquipos={filteredEquipos.length}
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
          totalStock={equipos.reduce((sum, e) => sum + (e?.stock_total ?? 0), 0)}
          onAddClick={() => setAddModalOpen(true)}
        />
      )}

      {/* Main Content */}
      <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6 space-y-6">
        {/* Quick filter: alerta de stock */}
        {!isLoading && alertaCount > 0 && (
          <button
            type="button"
            onClick={() => setOnlyAlerta(v => !v)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
              onlyAlerta
                ? 'bg-gs-danger/20 border-gs-danger text-gs-danger'
                : 'bg-gs-bg border-gs-border text-gs-soft hover:text-gs-text hover:border-gs-danger/50'
            }`}
            title={onlyAlerta ? 'Quitar filtro' : 'Mostrar solo equipos con stock bajo o agotado'}
          >
            <span aria-hidden>⚠</span>
            Stock bajo
            <span className="font-['DM_Mono'] bg-black/20 px-1.5 rounded">{alertaCount}</span>
          </button>
        )}

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
        {renderTableContent()}
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
      />

      <EditEquipoDrawer
        open={editDrawerOpen}
        equipo={selectedEquipo}
        onClose={handleCloseEditDrawer}
        onSuccess={() => {
          setEditDrawerOpen(false)
          setSelectedEquipo(null)
        }}
      />

      <DeleteConfirmModal
        open={deleteConfirmOpen}
        equipo={selectedEquipo}
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
        options={STOCK_ESTADO_OPTIONS}
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

const ActionButtons = ({ equipo, onQRClick, onDetailsClick, onEditClick, onDeleteClick, onViewFullDetailsClick }) => (
  <div className="flex items-center gap-2">
    <Tooltip content="Ver código QR">
      <button
        onClick={() => onQRClick(equipo)}
        className="p-1.5 text-gs-soft hover:text-gs-teal hover:bg-gs-border rounded transition-colors"
      >
        <Icon name="qr" size={16} />
      </button>
    </Tooltip>
    <Tooltip content="Detalles rápidos">
      <button
        onClick={() => onDetailsClick(equipo)}
        className="p-1.5 text-gs-soft hover:text-gs-accent hover:bg-gs-border rounded transition-colors"
      >
        <FiEye size={16} />
      </button>
    </Tooltip>
    <Tooltip content="Detalles completos">
      <button
        onClick={onViewFullDetailsClick}
        className="p-1.5 text-gs-soft hover:text-gs-accent hover:bg-gs-border rounded transition-colors"
      >
        <FiExternalLink size={16} />
      </button>
    </Tooltip>
    <Tooltip content="Editar equipo">
      <button
        onClick={() => onEditClick(equipo)}
        className="p-1.5 text-gs-soft hover:text-amber-400 hover:bg-gs-border rounded transition-colors"
      >
        <FiEdit2 size={16} />
      </button>
    </Tooltip>
    <Tooltip content="Eliminar equipo">
      <button
        onClick={() => onDeleteClick(equipo)}
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
  if (!equipo) {
    return null
  }

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

const QRDrawerContent = ({ equipo }) => {
  const getQRUrl = () => {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
    // Vista pública móvil — sin auth
    return `${baseUrl}/p/equipo/${equipo.id}`
  }

  const handleDownloadQR = () => {
    try {
      const canvas = document.querySelector('canvas')
      if (!canvas) {
        alert('No se pudo encontrar el código QR')
        return
      }

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `QR-${equipo.id}-${equipo.nombre}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      })
    } catch (err) {
      console.error('Error descargando QR:', err)
      alert('Error al descargar el código QR')
    }
  }

  // Imprime una etiqueta auto-adhesiva 60×40mm con QR + ID + nombre + tipo
  // ponytail: window.print() en popup — sin routes, sin componentes nuevos
  const handlePrintLabel = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) { alert('No se pudo encontrar el código QR'); return }
    const dataUrl = canvas.toDataURL('image/png')
    const w = window.open('', '_blank', 'width=400,height=320')
    if (!w) { alert('Permite popups para imprimir la etiqueta'); return }
    w.document.write(`<!doctype html>
<html><head><title>Etiqueta ${equipo.id}</title>
<style>
  @page { size: 60mm 40mm; margin: 0 }
  html, body { margin: 0; padding: 0; background: #fff; color: #111;
    font-family: Helvetica, Arial, sans-serif }
  .label { width: 60mm; height: 40mm; padding: 3mm; box-sizing: border-box;
    display: flex; gap: 3mm; align-items: center }
  .qr { width: 34mm; height: 34mm; flex-shrink: 0 }
  .info { flex: 1; min-width: 0 }
  .brand { font-size: 8px; color: #00C9A7; font-weight: 800; letter-spacing: 1px }
  .id    { font-size: 12px; font-weight: 800; margin-top: 1mm; letter-spacing: 0.5px }
  .name  { font-size: 9px; margin-top: 1mm; line-height: 1.2;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
    overflow: hidden }
  .tipo  { font-size: 7px; color: #666; margin-top: 1.5mm; text-transform: uppercase;
    letter-spacing: 0.8px }
  @media screen { body { padding: 16px; background: #f3f3f3 }
    .label { box-shadow: 0 4px 12px rgba(0,0,0,.15); background: #fff } }
</style></head>
<body>
  <div class="label">
    <img class="qr" src="${dataUrl}" alt="QR" />
    <div class="info">
      <div class="brand">GEOSTOCK</div>
      <div class="id">${equipo.id}</div>
      <div class="name">${(equipo.nombre || '').replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</div>
      <div class="tipo">${(equipo.tipo || '').replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</div>
    </div>
  </div>
  <script>window.onload = () => setTimeout(() => window.print(), 200)</script>
</body></html>`)
    w.document.close()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center p-4 bg-gs-bg rounded-lg">
        <QRCode
          data={getQRUrl()}
          size={220}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDownloadQR}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gs-accent text-white rounded-lg hover:bg-gs-accent/90 transition-colors font-medium"
        >
          <FiDownload size={18} />
          Descargar
        </button>
        <button
          onClick={handlePrintLabel}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gs-surface border border-gs-border text-gs-text rounded-lg hover:bg-gs-bg transition-colors font-medium"
        >
          🖨️ Etiqueta
        </button>
      </div>

      <div className="space-y-4 border-t border-gs-border pt-4">
        <div>
          <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">URL del Código QR</p>
          <p className="text-xs font-mono text-gs-soft break-all mt-1">{getQRUrl()}</p>
        </div>
        <InfoRow label="Código" value={equipo.id} mono />
        <InfoRow label="Nombre" value={equipo.nombre} />
        <InfoRow label="Número de Serie" value={equipo.serie} mono />
        <InfoRow label="Tipo" value={equipo.tipo} />
        <div>
          <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">Estado</p>
          <div className="mt-1">
            <Badge estado={getStockEstado(equipo.stock_total)} />
          </div>
        </div>
        <InfoRow
          label="Stock"
          value={`${equipo.stock_total} unidades`}
          valueClassName={stockColorClass(equipo.stock_total)}
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
}

const InfoRow = ({ label, value, mono = false, valueClassName = '' }) => (
  <div>
    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">{label}</p>
    <p className={`text-sm font-semibold text-gs-text ${mono ? "font-['DM_Mono']" : ''} ${valueClassName}`}>
      {value}
    </p>
  </div>
)

const DeleteConfirmModal = ({ open, equipo, isDeleting, onConfirm, onCancel }) => {
  if (!open || !equipo) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-gs-card border border-gs-border rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gs-danger/10 rounded-lg">
            <Icon name="warning" size={20} color="var(--gs-danger)" />
          </div>
          <div>
            <h3 className="font-semibold text-gs-text">Eliminar Equipo</h3>
            <p className="text-sm text-gs-soft">Esta acción no se puede deshacer</p>
          </div>
        </div>

        <p className="text-sm text-gs-text">
          ¿Estás seguro de que deseas eliminar <strong>{equipo.nombre}</strong>?
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

const stockColorClass = (stock) => {
  const estado = getStockEstado(stock)
  if (estado === 'Disponible') return 'text-green-400'
  if (estado === 'Stock Medio') return 'text-yellow-400'
  if (estado === 'Stock Bajo') return 'text-orange-400'
  return 'text-red-400'
}

const matchesSearchTerm = (equipo, searchTerm) => {
  if (!equipo || !searchTerm) {
    return true
  }
  const term = searchTerm.toLowerCase()
  return (
    equipo.nombre?.toLowerCase().includes(term) ||
    equipo.serie?.toLowerCase().includes(term) ||
    equipo.id?.toLowerCase().includes(term)
  )
}

const getTableColumns = () => [
  { key: 'id', label: 'Código', mono: true, sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'tipo', label: 'Tipo', sortable: true },
  { key: 'serie', label: 'Serie', mono: true },
  {
    key: 'stock_total',
    label: 'Stock',
    sortable: true,
    render: (value) => (
      <span className={`font-semibold ${stockColorClass(value)}`}>
        {value}
      </span>
    )
  },
  {
    key: 'stock_estado',
    label: 'Estado',
    render: (_value, row) => <Badge estado={getStockEstado(row.stock_total)} />
  },
  {
    key: 'precio_venta',
    label: 'Precio Venta',
    sortable: true,
    render: (value) => `$${parseFloat(value).toFixed(2)}`
  },
]
