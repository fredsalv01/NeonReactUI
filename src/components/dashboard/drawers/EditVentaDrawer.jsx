import { useState, useEffect } from 'react'
import { useSalesStore } from '../../../stores/salesStore'
import { Drawer, Button, SkeletonBlock, useToast } from '../../ui'

export const EditVentaDrawer = ({ open, venta, onClose, onSuccess }) => {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    cantidad: '',
    precio_unitario: '',
    monto_total: '',
    descripcion: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const updateVenta = useSalesStore(state => state.updateVenta)

  useEffect(() => {
    if (venta && open) {
      setFormData({
        cantidad: venta.cantidad || '',
        precio_unitario: venta.precio_unitario || '',
        monto_total: venta.monto_total || '',
        descripcion: venta.descripcion || '',
      })
      setErrors({})
    }
  }, [venta, open])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.cantidad || parseInt(formData.cantidad) <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0'
    }

    if (!formData.precio_unitario || parseFloat(formData.precio_unitario) <= 0) {
      newErrors.precio_unitario = 'El precio unitario debe ser mayor a 0'
    }

    if (!formData.monto_total || parseFloat(formData.monto_total) <= 0) {
      newErrors.monto_total = 'El monto total debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm() || !venta) return

    setIsSaving(true)
    try {
      await updateVenta(venta.id, {
        cantidad: parseInt(formData.cantidad),
        precio_unitario: parseFloat(formData.precio_unitario),
        monto_total: parseFloat(formData.monto_total),
        descripcion: formData.descripcion || null,
      })
      toast.success('Venta actualizada correctamente')
      onSuccess?.()
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!venta) {
    return null
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Editar Venta"
      subtitle={`${venta.id} · ${venta.equipos?.nombre}`}
      side="right"
      size="md"
    >
      <div className="space-y-6">
        {/* Equipo Info - Read Only */}
        <div className="bg-gs-bg rounded-lg p-4 space-y-3">
          {venta.equipos?.imagen_url && (
            <img
              src={venta.equipos.imagen_url}
              alt={venta.equipos.nombre}
              className="w-full h-32 object-cover rounded"
            />
          )}
          <div>
            <p className="text-[12px] text-gs-soft font-['DM_Mono'] uppercase">Equipo</p>
            <p className="text-sm font-semibold text-gs-text">{venta.equipos?.nombre}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gs-soft">Tipo</p>
              <p className="text-gs-text font-semibold">{venta.equipos?.tipo}</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Cantidad */}
          <div>
            <label className="text-sm text-gs-soft font-['DM_Mono'] uppercase">
              Cantidad
            </label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleInputChange}
              className={`w-full mt-1 px-3 py-2 bg-gs-bg border rounded-lg text-gs-text ${
                errors.cantidad ? 'border-gs-danger' : 'border-gs-border'
              }`}
              placeholder="Cantidad de unidades"
            />
            {errors.cantidad && (
              <p className="text-xs text-gs-danger mt-1">{errors.cantidad}</p>
            )}
          </div>

          {/* Precio Unitario */}
          <div>
            <label className="text-sm text-gs-soft font-['DM_Mono'] uppercase">
              Precio Unitario
            </label>
            <input
              type="number"
              name="precio_unitario"
              step="0.01"
              value={formData.precio_unitario}
              onChange={handleInputChange}
              className={`w-full mt-1 px-3 py-2 bg-gs-bg border rounded-lg text-gs-text ${
                errors.precio_unitario ? 'border-gs-danger' : 'border-gs-border'
              }`}
              placeholder="Precio unitario"
            />
            {errors.precio_unitario && (
              <p className="text-xs text-gs-danger mt-1">{errors.precio_unitario}</p>
            )}
          </div>

          {/* Monto Total */}
          <div>
            <label className="text-sm text-gs-soft font-['DM_Mono'] uppercase">
              Monto Total
            </label>
            <input
              type="number"
              name="monto_total"
              step="0.01"
              value={formData.monto_total}
              onChange={handleInputChange}
              className={`w-full mt-1 px-3 py-2 bg-gs-bg border rounded-lg text-gs-text ${
                errors.monto_total ? 'border-gs-danger' : 'border-gs-border'
              }`}
              placeholder="Monto total"
            />
            {errors.monto_total && (
              <p className="text-xs text-gs-danger mt-1">{errors.monto_total}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm text-gs-soft font-['DM_Mono'] uppercase">
              Descripción (Opcional)
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              className="w-full mt-1 px-3 py-2 bg-gs-bg border border-gs-border rounded-lg text-gs-text resize-none"
              rows="3"
              placeholder="Notas sobre la venta..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gs-border">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>Guardar Cambios</span>
            )}
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
