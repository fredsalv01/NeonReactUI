import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useInventoryStore } from '../../../stores/inventoryStore'
import { kardexService } from '../../../lib/services/kardexService'
import {
  Button,
  Tabs,
  Badge,
  DataTable,
  DatePicker,
  Icon,
  Spinner,
  useToast
} from '../../ui'
import { FiArrowLeft } from 'react-icons/fi'

export const EquipmentDetails = () => {
  const { equipoId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Store
  const equipos = useInventoryStore(state => state.equipos)
  const isLoadingInventory = useInventoryStore(state => state.isLoading)
  const fetchEquipos = useInventoryStore(state => state.fetchEquipos)

  // States
  const [activeTab, setActiveTab] = useState('details')
  const [kardexData, setKardexData] = useState([])
  const [isLoadingKardex, setIsLoadingKardex] = useState(false)
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [equipoNotFound, setEquipoNotFound] = useState(false)
  const [kardexPageSize, setKardexPageSize] = useState(5)
  const [kardexPage, setKardexPage] = useState(1)

  // Get equipment from store
  const equipo = useMemo(() => {
    return equipos.find(e => e.id === equipoId) || null
  }, [equipos, equipoId])

  // Load inventory on mount and check if equipment exists
  useEffect(() => {
    if (equipos.length === 0) {
      fetchEquipos()
    }
  }, [])

  // Check if equipment was not found after inventory loads
  useEffect(() => {
    if (!isLoadingInventory && equipos.length > 0 && !equipo) {
      setEquipoNotFound(true)
    }
  }, [isLoadingInventory, equipos, equipo])

  // Load kardex when tab changes or equipment changes
  useEffect(() => {
    if (activeTab === 'kardex' && equipoId && equipo) {
      loadKardex()
    }
  }, [activeTab, equipoId, equipo])

  const loadKardex = async () => {
    if (!equipoId) return
    setIsLoadingKardex(true)
    try {

      const data = await kardexService.getHistorialEquipo(equipoId)
      setKardexData(data || [])
    } catch (err) {
      toast.error('Error cargando kardex: ' + err.message)
      setKardexData([])
    } finally {
      setIsLoadingKardex(false)
    }
  }

  // Filter kardex by date range
  const filteredKardex = useMemo(() => {
    if (!kardexData.length) return []

    return kardexData.filter(item => {
      if (!item.created_at) return true

      const itemDate = new Date(item.created_at)
      if (dateRange.from && itemDate < dateRange.from) return false
      if (dateRange.to) {
        const toDate = new Date(dateRange.to)
        toDate.setHours(23, 59, 59, 999)
        if (itemDate > toDate) return false
      }
      return true
    })
  }, [kardexData, dateRange])

  // Paginate kardex
  const totalPages = Math.ceil(filteredKardex.length / kardexPageSize)
  const paginatedKardex = useMemo(() => {
    const start = (kardexPage - 1) * kardexPageSize
    return filteredKardex.slice(start, start + kardexPageSize)
  }, [filteredKardex, kardexPage, kardexPageSize])

  if (isLoadingInventory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gs-bg">
        <Spinner />
      </div>
    )
  }

  if (equipoNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gs-bg p-4">
        <div className="text-center max-w-md">
          <Icon name="box" size={48} color="var(--gs-muted)" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gs-text mb-2">Equipo No Encontrado</h2>
          <p className="text-gs-soft mb-6">El equipo que buscas no existe o ha sido eliminado.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard/inventory')}
            className="w-full md:w-auto"
          >
            Volver al Inventario
          </Button>
        </div>
      </div>
    )
  }

  if (!equipo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gs-bg">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/inventory')}
            className="p-2 hover:bg-gs-surface rounded-lg transition-colors"
            title="Volver atrás"
          >
            <FiArrowLeft size={20} className="text-gs-soft" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gs-text">
              {equipo.nombre}
            </h1>
            <p className="text-gs-soft text-sm md:text-base">
              ID: <span className="font-mono text-gs-accent">{equipo.id}</span>
            </p>
          </div>
        </div>

        {equipo.image_url && (
          <div className="flex-shrink-0">
            <img
              src={equipo.image_url}
              alt={equipo.nombre}
              className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border border-gs-border bg-gs-bg"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling?.style.removeProperty('display')
              }}
              onLoad={(e) => {
                if (e.target.nextElementSibling) {
                  e.target.nextElementSibling.style.display = 'none'
                }
              }}
            />
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-lg border border-gs-border bg-gs-bg flex items-center justify-center"
              style={{ display: 'none' }}
            >
              <Icon name="image" size={32} color="var(--gs-muted)" />
            </div>
          </div>
        )}
      </div>

      {/* Main Content with Tabs */}
      <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6">
        <Tabs
          tabs={[
            { value: 'details', label: 'Detalles', icon: 'info' },
            { value: 'kardex', label: 'Kardex', icon: 'chart', badge: filteredKardex.length || undefined }
          ]}
          value={activeTab}
          onChange={setActiveTab}
        >
          {/* Details Tab */}
          {activeTab === 'details' && (
            <DetailsTab equipo={equipo} />
          )}

          {/* Kardex Tab */}
          {activeTab === 'kardex' && (
            <KardexTab
              isLoading={isLoadingKardex}
              kardexData={paginatedKardex}
              filteredKardexCount={filteredKardex.length}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              currentPage={kardexPage}
              pageSize={kardexPageSize}
              totalPages={totalPages}
              onPageChange={setKardexPage}
              onPageSizeChange={(size) => {
                setKardexPageSize(size)
                setKardexPage(1)
              }}
            />
          )}
        </Tabs>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

const DetailsTab = ({ equipo }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Left Column */}
    <div className="space-y-5">
      <DetailField label="Nombre" value={equipo.nombre} />
      <DetailField label="Código/ID" value={equipo.id} mono />
      <DetailField label="Serie" value={equipo.serie} mono />
      <DetailField label="Tipo" value={equipo.tipo} />
      <DetailField
        label="Estado"
        value={<Badge estado={equipo.estado} />}
        isComponent
      />
    </div>

    {/* Right Column */}
    <div className="space-y-5">
      <DetailField
        label="Stock"
        value={equipo.stock}
        className={
          equipo.stock > 5 ? 'text-green-400' : equipo.stock > 0 ? 'text-yellow-400' : 'text-red-400'
        }
      />
      <DetailField
        label="Precio de Compra"
        value={`$${parseFloat(equipo.precio_compra || 0).toFixed(2)}`}
      />
      <DetailField
        label="Precio de Venta"
        value={`$${parseFloat(equipo.precio_venta || 0).toFixed(2)}`}
        className="text-gs-accent"
      />
      <DetailField
        label="Estado del Sistema"
        value={equipo.active ? 'Activo' : 'Inactivo'}
        className={equipo.active ? 'text-green-400' : 'text-gs-danger'}
      />
      {equipo.created_at && (
        <DetailField
          label="Fecha de Creación"
          value={new Date(equipo.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        />
      )}
    </div>
  </div>
)

const DetailField = ({ label, value, mono = false, isComponent = false, className = '' }) => (
  <div>
    <p className="text-[11px] text-gs-soft font-['DM_Mono'] uppercase tracking-[0.8px] mb-1.5">
      {label}
    </p>
    {isComponent ? (
      <div>{value}</div>
    ) : (
      <p className={`text-sm font-semibold text-gs-text ${mono ? "font-['DM_Mono']" : ''} ${className}`}>
        {value}
      </p>
    )}
  </div>
)

const KardexTab = ({
  isLoading,
  kardexData,
  filteredKardexCount,
  dateRange,
  onDateRangeChange,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange
}) => (
  <div className="space-y-6">
    {/* Date Filter */}
    <div className="bg-gs-bg rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gs-text">Filtrar por Rango de Fechas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePicker
          mode="single"
          value={dateRange.from}
          onChange={(from) => onDateRangeChange({ ...dateRange, from })}
          placeholder="Desde..."
          label="Fecha Inicio"
          clearable
        />
        <DatePicker
          mode="single"
          value={dateRange.to}
          onChange={(to) => onDateRangeChange({ ...dateRange, to })}
          placeholder="Hasta..."
          label="Fecha Fin"
          clearable
        />
      </div>
      {(dateRange.from || dateRange.to) && (
        <button
          onClick={() => onDateRangeChange({ from: null, to: null })}
          className="text-sm text-gs-accent hover:text-gs-accent/80 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>

    {/* Kardex Table */}
    {isLoading ? (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    ) : kardexData.length === 0 ? (
      <div className="text-center py-12">
        <Icon name="box" size={48} color="currentColor" className="text-gs-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gs-text mb-1">Sin Movimientos</h3>
        <p className="text-gs-soft">
          {dateRange.from || dateRange.to
            ? 'No hay movimientos en el rango de fechas seleccionado'
            : 'No hay movimientos registrados para este equipo'}
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gs-bg border-b border-gs-border">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-gs-soft font-['DM_Mono'] uppercase">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-gs-soft font-['DM_Mono'] uppercase">
                Tipo
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-bold text-gs-soft font-['DM_Mono'] uppercase">
                Cantidad
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-gs-soft font-['DM_Mono'] uppercase">
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-gs-soft font-['DM_Mono'] uppercase">
                Usuario
              </th>
            </tr>
          </thead>
          <tbody>
            {kardexData.map((item, idx) => (
              <tr
                key={item.id || idx}
                className="border-b border-gs-border hover:bg-gs-bg/50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gs-text">
                  {new Date(item.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3 text-sm">
                  <TypeBadge tipo={item.tipo} />
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-right">
                  <span className={
                    item.tipo === 'entrada' ? 'text-green-400' :
                    item.tipo === 'salida' ? 'text-red-400' :
                    'text-amber-400'
                  }>
                    {item.tipo === 'entrada' ? '+' : item.tipo === 'salida' ? '-' : '~'}
                    {item.cantidad}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gs-soft max-w-xs truncate">
                  {item.motivo || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gs-text">
                  {item.usuario?.nombre || 'Sistema'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {kardexData.length > 0 && (
      <div className="space-y-4 pt-4 border-t border-gs-border">
        {/* Pagination Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Page Size Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gs-soft">Registros por página:</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              className="px-3 py-2 bg-gs-bg border border-gs-border rounded-lg text-gs-text text-sm focus:outline-none focus:ring-2 focus:ring-gs-accent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          {/* Info Text */}
          <div className="text-center text-sm text-gs-soft">
            Total de movimientos: <span className="font-semibold text-gs-text">{filteredKardexCount}</span>
            {currentPage > 1 && ` • Página ${currentPage} de ${totalPages}`}
          </div>

          {/* Pagination Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gs-bg border border-gs-border rounded-lg text-gs-text text-sm hover:bg-gs-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gs-soft">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gs-bg border border-gs-border rounded-lg text-gs-text text-sm hover:bg-gs-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
)

const TypeBadge = ({ tipo }) => {
  const styles = {
    entrada: 'bg-green-400/15 text-green-400',
    salida: 'bg-red-400/15 text-red-400',
    ajuste: 'bg-amber-400/15 text-amber-400',
  }

  const labels = {
    entrada: 'Entrada',
    salida: 'Salida',
    ajuste: 'Ajuste',
  }

  return (
    <span className={`px-2 py-1 rounded text-[11px] font-semibold font-['Syne'] ${styles[tipo] || 'bg-gs-surface text-gs-soft'}`}>
      {labels[tipo] || tipo}
    </span>
  )
}
