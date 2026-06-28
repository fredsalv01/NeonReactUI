import { useState, useEffect } from 'react'
import { useToast, Drawer, Switch, Badge } from '../../ui'
import { equipoService } from '../../../lib/services/equipoService'
import { humanizeError } from '../../../lib/utils/errors'

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop'

export const ProductDetailsDrawer = ({ open, equipo, onClose }) => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (equipo) {
      setIsActive(equipo.active)
    }
  }, [equipo, open])

  if (!equipo) {
    return null
  }

  const handleToggleActive = async () => {
    const newStatus = !isActive
    setIsActive(newStatus)
    setIsLoading(true)

    try {
      await equipoService.updateEquipoStatus(equipo.id, newStatus)
      const message = newStatus ? 'Equipo activado' : 'Equipo desactivado'
      toast.success(message)
    } catch (err) {
      setIsActive(!newStatus)
      toast.error(humanizeError(err, 'No se pudo actualizar el equipo'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Detalles del Equipo"
      subtitle={equipo.id}
      side="right"
      size="lg"
    >
      <div className="space-y-6">
        {/* Image Section */}
        <div className="space-y-3">
          <div className="relative w-full h-64 bg-gs-bg rounded-lg overflow-hidden border border-gs-border">
            <img
              src={equipo.imagen_url || DEFAULT_IMAGE}
              alt={equipo.nombre}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = DEFAULT_IMAGE
              }}
            />
          </div>
          {!equipo.imagen_url && (
            <p className="text-xs text-gs-soft font-['DM_Mono'] text-center">
              Imagen por defecto (sin foto)
            </p>
          )}
        </div>

        {/* Status Section */}
        <div className="space-y-3 border-b border-gs-border pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gs-text">Estado del Equipo</p>
              <p className="text-xs text-gs-soft mt-1">
                {isActive ? 'Equipo activo en el sistema' : 'Equipo inactivo'}
              </p>
            </div>
            <Switch
              checked={isActive}
              onChange={handleToggleActive}
              disabled={isLoading}
              size="md"
              color={isActive ? 'var(--gs-accent)' : 'var(--gs-danger)'}
            />
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gs-text uppercase">Información General</h3>
          <DetailRow label="Nombre" value={equipo.nombre} />
          <DetailRow label="Tipo" value={equipo.tipo} />
          <DetailRow label="Número de Serie" value={equipo.serie} mono />
        </div>

        {/* Status and Condition */}
        <div className="space-y-3 border-t border-gs-border pt-4">
          <h3 className="text-sm font-bold text-gs-text uppercase">Estado y Condición</h3>
          <div>
            <p className="text-xs text-gs-soft font-['DM_Mono'] uppercase">Estado Actual</p>
            <div className="mt-1.5">
              <Badge estado={equipo.estado} />
            </div>
          </div>
          <DetailRow
            label="Stock Disponible"
            value={`${equipo.stock_total ?? 0} unidades`}
            valueClassName={
              equipo.stock_total > 5 ? 'text-green-400' : equipo.stock_total > 0 ? 'text-yellow-400' : 'text-red-400'
            }
          />
          <DetailRow label="Unidades Vendidas" value={equipo.vendidos_total || 0} />
        </div>

        {/* Pricing */}
        <div className="space-y-3 border-t border-gs-border pt-4">
          <h3 className="text-sm font-bold text-gs-text uppercase">Precios</h3>
          <DetailRow
            label="Precio de Compra"
            value={`$${parseFloat(equipo.precio_compra).toFixed(2)}`}
            mono
          />
          <DetailRow
            label="Precio de Venta"
            value={`$${parseFloat(equipo.precio_venta).toFixed(2)}`}
            valueClassName="text-gs-accent"
            mono
          />
          <DetailRow
            label="Margen de Ganancia"
            value={`${((equipo.precio_venta - equipo.precio_compra) / equipo.precio_compra * 100).toFixed(1)}%`}
            valueClassName="text-green-400"
            mono
          />
        </div>

        {/* Dates */}
        <div className="space-y-3 border-t border-gs-border pt-4">
          <h3 className="text-sm font-bold text-gs-text uppercase">Información de Registro</h3>
          <DetailRow
            label="Fecha de Creación"
            value={new Date(equipo.created_at).toLocaleDateString('es-MX')}
            mono
          />
          <DetailRow
            label="Última Actualización"
            value={new Date(equipo.updated_at).toLocaleDateString('es-MX')}
            mono
          />
        </div>

        {/* Helper */}
        <div className="bg-gs-accent/5 border border-gs-accent/25 rounded-lg p-3">
          <p className="text-xs text-gs-soft font-['DM_Mono']">
            <span className="text-gs-accent">→</span> Usa el switch para activar o desactivar este equipo
          </p>
        </div>
      </div>
    </Drawer>
  )
}

const DetailRow = ({ label, value, mono = false, valueClassName = '' }) => (
  <div className="flex justify-between items-start">
    <p className="text-xs text-gs-soft font-['DM_Mono'] uppercase">{label}</p>
    <p className={`text-sm font-semibold text-gs-text text-right ${mono ? "font-['DM_Mono']" : ''} ${valueClassName}`}>
      {value}
    </p>
  </div>
)
