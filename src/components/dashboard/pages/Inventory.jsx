import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useToast } from '../../ui'
import { Button, DataTable, Badge, Icon, Pagination, Select, SearchBar, SkeletonRow, Drawer, QRCode, SkeletonBlock } from '../../ui'
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'

export const Inventory = () => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [qrDrawerOpen, setQrDrawerOpen] = useState(false)
  const [selectedEquipo, setSelectedEquipo] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)

  const { data: equipos = [], isLoading, error } = useQuery({
    queryKey: ['equipos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipos')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
  })

  useEffect(() => {
    if (!isLoading && equipos.length > 0) {
      setShowSkeleton(true)
      const timer = setTimeout(() => setShowSkeleton(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, equipos])

  const uniqueTipos = useMemo(() => {
    const tipos = new Set(equipos.map(e => e.tipo))
    return Array.from(tipos).sort()
  }, [equipos])

  const tipoOptions = useMemo(() =>
    uniqueTipos.map(tipo => ({ value: tipo, label: tipo })),
    [uniqueTipos]
  )

  const filteredEquipos = useMemo(() => {
    return equipos.filter((equipo) => {
      const matchesSearch =
        equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.serie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesEstado = filterEstado ? equipo.estado === filterEstado : true
      const matchesTipo = filterTipo ? equipo.tipo === filterTipo : true

      return matchesSearch && matchesEstado && matchesTipo
    })
  }, [equipos, searchTerm, filterEstado, filterTipo])

  const paginatedEquipos = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredEquipos.slice(start, start + pageSize)
  }, [filteredEquipos, currentPage, pageSize])

  const totalPages = Math.ceil(filteredEquipos.length / pageSize)

  const handleOpenQR = (equipo) => {
    setSelectedEquipo(equipo)
    setQrDrawerOpen(true)
    setQrLoading(true)
    setTimeout(() => setQrLoading(false), 1000)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('equipos')
        .update({ active: false })
        .eq('id', id)

      if (error) throw error
      toast.success('Equipo eliminado correctamente')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const columns = [
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
      {/* Header Section */}
      {isLoading ? (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div className="flex-1 space-y-3">
            <SkeletonBlock className="h-10 w-2/3" />
            <SkeletonBlock className="h-5 w-1/3" />
            <SkeletonBlock className="h-5 w-1/4" />
          </div>
          <SkeletonBlock className="h-11 w-full md:w-40" />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gs-text mb-2">
              Inventario
            </h1>
            <p className="text-gs-soft">
              Total de equipos: <span className="font-semibold text-gs-text">{equipos.length}</span>
            </p>
            <p className="text-gs-soft text-sm mt-2">
              Stock Total: <span className="font-semibold text-gs-accent">{equipos.reduce((sum, e) => sum + e.stock, 0)}</span>
            </p>
          </div>
          <Button variant="primary" className="flex items-center gap-2 w-full md:w-auto h-fit">
            <FiPlus size={18} />
            Agregar Equipo
          </Button>
        </div>
      )}

      <div className="bg-gs-surface border border-gs-border rounded-lg p-4 md:p-6 space-y-6">
        {/* Filtros Skeleton */}
        {isLoading ? (
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
        ) : (
          /* Filtros */
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar por nombre, serie o código..."
                  className="w-full"
                />
              </div>
              <Select
                options={[
                  { value: 'Disponible', label: 'Disponible' },
                  { value: 'En uso', label: 'En uso' },
                  { value: 'Mantenimiento', label: 'Mantenimiento' },
                  { value: 'Baja', label: 'Baja' },
                ]}
                value={filterEstado}
                onChange={setFilterEstado}
                placeholder="Estado..."
                label="Estado"
                className="w-full md:w-48"
              />
              <Select
                options={tipoOptions}
                value={filterTipo}
                onChange={setFilterTipo}
                placeholder="Tipo..."
                label="Tipo"
                className="w-full md:w-48"
              />
            </div>
          </div>
        )}

        {/* Tabla */}
        {isLoading || showSkeleton ? (
          <div className="space-y-2">
            {[...Array(pageSize)].map((_, i) => (
              <SkeletonRow key={i} cols={7} />
            ))}
          </div>
        ) : (
          <>
            {filteredEquipos.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="box" size={48} color="currentColor" className="text-gs-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gs-text mb-1">Sin resultados</h3>
                <p className="text-gs-soft">
                  {searchTerm || filterEstado || filterTipo
                    ? 'No se encontraron equipos que coincidan con tus filtros'
                    : 'Comienza agregando tu primer equipo al inventario'}
                </p>
              </div>
            ) : (
              <>
                <DataTable
                  columns={columns}
                  data={paginatedEquipos}
                  selectable
                  emptyMessage="No hay equipos en esta página"
                  actions={(row) => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenQR(row)}
                        className="p-1.5 text-gs-soft hover:text-gs-teal hover:bg-gs-border rounded transition-colors"
                        title="Ver código QR"
                      >
                        <Icon name="qr" size={16} />
                      </button>
                      <button
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
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-gs-soft hover:text-gs-danger hover:bg-gs-border rounded transition-colors"
                        title="Eliminar"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  )}
                />

                {/* Paginación */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t border-gs-border">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gs-soft">Registros por página:</label>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="px-3 py-2 bg-gs-bg border border-gs-border rounded-lg text-gs-text text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    total={filteredEquipos.length}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* QR Drawer */}
      <Drawer
        open={qrDrawerOpen}
        onClose={() => setQrDrawerOpen(false)}
        title="Código QR"
        subtitle={selectedEquipo ? `${selectedEquipo.id} · ${selectedEquipo.nombre}` : ''}
        side="right"
        size="md"
      >
        {selectedEquipo && (
          <div className="space-y-6">
            {qrLoading ? (
              <div className="space-y-4">
                <SkeletonBlock className="w-48 h-48 mx-auto" />
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-6 w-3/4" />
              </div>
            ) : (
              <>
                {/* QR Code */}
                <div className="flex justify-center p-4 bg-gs-bg rounded-lg">
                  <QRCode
                    data={`${selectedEquipo.id}|${selectedEquipo.serie}`}
                    size={220}
                  />
                </div>

                {/* Equipment Info */}
                <div className="space-y-4 border-t border-gs-border pt-4">
                  <div>
                    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">Código</p>
                    <p className="text-sm font-semibold text-gs-text font-['DM_Mono']">
                      {selectedEquipo.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">Nombre</p>
                    <p className="text-sm font-semibold text-gs-text">
                      {selectedEquipo.nombre}
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">Número de Serie</p>
                    <p className="text-sm font-semibold text-gs-text font-['DM_Mono']">
                      {selectedEquipo.serie}
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">Tipo</p>
                    <p className="text-sm font-semibold text-gs-text">
                      {selectedEquipo.tipo}
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">Estado</p>
                    <div className="mt-1">
                      <Badge estado={selectedEquipo.estado} />
                    </div>
                  </div>

                  <div>
                    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">Stock</p>
                    <p className={`text-sm font-semibold ${
                      selectedEquipo.stock > 5 ? 'text-green-400' : selectedEquipo.stock > 0 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {selectedEquipo.stock} unidades
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">Precio de Compra</p>
                    <p className="text-sm font-semibold text-gs-text">
                      ${parseFloat(selectedEquipo.precio_compra).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">Precio de Venta</p>
                    <p className="text-sm font-semibold text-gs-accent">
                      ${parseFloat(selectedEquipo.precio_venta).toFixed(2)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
