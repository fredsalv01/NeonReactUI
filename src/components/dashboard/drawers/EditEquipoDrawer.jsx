import { useState, useRef, useEffect } from 'react'
import { Button, InputField, NumberInput, Select, DropZone, Progress, Icon } from '../../ui'
import { useEquipoForm } from '../../../hooks/useEquipoForm'
import { useInventoryStore } from '../../../stores/inventoryStore'
import { ESTADO_OPTIONS } from '../../../lib/constants/inventoryConstants'
import { useToast } from '../../ui'
import { equipoService } from '../../../lib/services/equipoService'

export const EditEquipoDrawer = ({ open, equipo, onClose, onSuccess }) => {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newImagePreview, setNewImagePreview] = useState(null)
  const inputRefs = useRef({})
  const updateEquipoInStore = useInventoryStore(state => state.updateEquipo)
  const deleteEquipoFromStore = useInventoryStore(state => state.deleteEquipo)
  const reloadEquipos = useInventoryStore(state => state.reloadEquipos)

  const {
    formData,
    formErrors,
    isSubmitting,
    uploadProgress,
    setIsSubmitting,
    handleInputChange,
    handleImageChange,
    handleImageRemove,
    validateForm,
    uploadImage,
    resetForm,
  } = useEquipoForm()

  // Initialize form with equipo data
  useEffect(() => {
    if (equipo && open) {
      const initialData = {
        nombre: equipo.nombre || '',
        tipo: equipo.tipo || '',
        serie: equipo.serie || '',
        estado: equipo.estado || 'Disponible',
        precio_compra: equipo.precio_compra?.toString() || '0',
        precio_venta: equipo.precio_venta?.toString() || '0',
        stock: equipo.stock?.toString() || '0',
        imagen: null,
      }
      // Direct state update for edit mode
      const currentFormData = formData
      Object.keys(initialData).forEach(key => {
        if (currentFormData[key] !== initialData[key]) {
          handleInputChange({ target: { name: key, value: initialData[key] } })
        }
      })
      setNewImagePreview(null)
    }
  }, [equipo, open])

  const handleImageChangeWithPreview = (files) => {
    if (files.length > 0) {
      handleImageChange(files)
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewImagePreview(e.target.result)
      }
      reader.readAsDataURL(files[0])
    }
  }

  const handleImageRemoveWithPreview = () => {
    handleImageRemove()
    setNewImagePreview(null)
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      let imagenUrl = equipo.imagen_url

      // Upload new image if selected
      if (formData.imagen) {
        imagenUrl = await uploadImage(formData.imagen)
      }

      await equipoService.updateEquipo(equipo.id, {
        nombre: formData.nombre,
        tipo: formData.tipo,
        serie: formData.serie,
        estado: formData.estado,
        precio_compra: parseFloat(formData.precio_compra),
        precio_venta: parseFloat(formData.precio_venta),
        stock: parseInt(formData.stock),
        imagen_url: imagenUrl,
      })

      await updateEquipoInStore(equipo.id, {
        nombre: formData.nombre,
        tipo: formData.tipo,
        serie: formData.serie,
        estado: formData.estado,
        precio_compra: parseFloat(formData.precio_compra),
        precio_venta: parseFloat(formData.precio_venta),
        stock: parseInt(formData.stock),
        imagen_url: imagenUrl,
      })

      // Reload inventory to ensure consistency
      await reloadEquipos()

      toast.success('Equipo actualizado correctamente')
      handleClose()
      onSuccess?.()
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteEquipoFromStore(equipo.id)

      // Reload inventory to ensure consistency
      await reloadEquipos()

      toast.success('Equipo eliminado correctamente')
      setShowDeleteConfirm(false)
      handleClose()
      onSuccess?.()
    } catch (err) {
      toast.error('Error al eliminar: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    resetForm()
    setNewImagePreview(null)
    setShowDeleteConfirm(false)
    onClose()
  }

  if (!open || !equipo) return null

  return (
    <>
      {/* Drawer Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Drawer Container */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-gs-card border-l border-gs-border shadow-xl z-50 transform transition-transform duration-300 overflow-y-auto ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gs-card border-b border-gs-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gs-text">Editar Equipo</h2>
            <p className="text-sm text-gs-soft mt-1">
              Actualiza los detalles del equipo: {equipo.nombre}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gs-bg rounded-lg transition-colors"
            type="button"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-gs-soft">Actualizando imagen...</p>
                <p className="text-xs text-gs-accent font-['DM_Mono']">{uploadProgress}%</p>
              </div>
              <Progress value={uploadProgress} variant="bar" showValue={false} />
            </div>
          )}

          {/* Basic Information */}
          <InputField label="Nombre del Equipo" error={formErrors.nombre}>
            <input
              ref={(el) => { if (el) inputRefs.current['nombre'] = el }}
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              onBlur={handleInputChange}
              placeholder="Ej: Leica TS16..."
              className={`w-full px-4 py-2.5 bg-gs-bg border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all ${
                formErrors.nombre ? 'border-gs-danger ring-1 ring-gs-danger' : 'border-gs-border focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20'
              }`}
            />
          </InputField>

          {/* Type and Serie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Tipo de Equipo" error={formErrors.tipo}>
              <input
                type="text"
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                placeholder="Ej: Total Station..."
                className={`w-full px-4 py-2.5 bg-gs-bg border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all ${
                  formErrors.tipo ? 'border-gs-danger ring-1 ring-gs-danger' : 'border-gs-border focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20'
                }`}
              />
            </InputField>

            <InputField label="Número de Serie" error={formErrors.serie}>
              <input
                type="text"
                name="serie"
                value={formData.serie}
                onChange={handleInputChange}
                placeholder="Ej: TS16-2024-001"
                className={`w-full px-4 py-2.5 bg-gs-bg border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all font-['DM_Mono'] text-sm ${
                  formErrors.serie ? 'border-gs-danger ring-1 ring-gs-danger' : 'border-gs-border focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20'
                }`}
              />
            </InputField>
          </div>

          {/* Estado */}
          <InputField label="Estado">
            <Select
              options={ESTADO_OPTIONS}
              value={formData.estado}
              onChange={(val) => {
                handleInputChange({ target: { name: 'estado', value: val } })
              }}
              placeholder="Selecciona un estado..."
              className="w-full"
            />
          </InputField>

          {/* Prices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberInput
              label="Precio de Compra"
              value={parseFloat(formData.precio_compra) || 0}
              onChange={(val) => {
                handleInputChange({ target: { name: 'precio_compra', value: val.toString() } })
              }}
              prefix="$"
              min={0}
              step={0.01}
              error={formErrors.precio_compra}
            />

            <NumberInput
              label="Precio de Venta"
              value={parseFloat(formData.precio_venta) || 0}
              onChange={(val) => {
                handleInputChange({ target: { name: 'precio_venta', value: val.toString() } })
              }}
              prefix="$"
              min={0}
              step={0.01}
              error={formErrors.precio_venta}
            />
          </div>

          {/* Stock */}
          <NumberInput
            label="Stock (unidades)"
            value={parseInt(formData.stock) || 0}
            onChange={(val) => {
              handleInputChange({ target: { name: 'stock', value: val.toString() } })
            }}
            suffix="unidades"
            min={0}
            step={1}
            error={formErrors.stock}
          />

          {/* Divider */}
          <div className="h-px bg-gs-border" />

          {/* Image Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gs-text">Imagen del Equipo</p>
              <p className="text-xs text-gs-soft">Arrastra una nueva imagen para actualizar (opcional)</p>
            </div>

            {/* Current and New Image Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Image */}
              {equipo.imagen_url && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gs-soft">Imagen Actual</p>
                  <div className="relative bg-gs-bg border border-gs-border rounded-lg overflow-hidden">
                    <img
                      src={equipo.imagen_url}
                      alt={equipo.nombre}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <Icon name="check" size={16} color="var(--gs-accent)" />
                    </div>
                  </div>
                </div>
              )}

              {/* New Image Preview */}
              {newImagePreview && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gs-accent">Nueva Imagen</p>
                  <div className="relative bg-gs-bg border-2 border-gs-accent rounded-lg overflow-hidden">
                    <img
                      src={newImagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <button
                      onClick={handleImageRemoveWithPreview}
                      className="absolute top-2 right-2 p-1.5 bg-gs-danger hover:bg-gs-danger/80 rounded transition-colors"
                      type="button"
                    >
                      <Icon name="close" size={14} color="white" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dropzone */}
            {!newImagePreview && (
              <DropZone
                accept="image/*"
                maxSizeMB={5}
                onFiles={handleImageChangeWithPreview}
                label="Arrastra una nueva imagen aquí o haz clic"
                multiple={false}
              />
            )}

            {/* File Info */}
            {formData.imagen && (
              <div className="flex items-center gap-3 p-3 bg-gs-accent/5 border border-gs-accent/25 rounded-lg">
                <Icon name="check" size={16} color="var(--gs-accent)" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gs-text truncate">{formData.imagen.name}</p>
                  <p className="text-xs text-gs-soft font-['DM_Mono']">{(formData.imagen.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  onClick={handleImageRemoveWithPreview}
                  className="p-1.5 text-gs-soft hover:text-gs-danger hover:bg-gs-danger/10 rounded transition-colors"
                  type="button"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            )}

            {formErrors.imagen && (
              <p className="text-xs text-gs-danger bg-gs-danger/5 border border-gs-danger/25 rounded-lg p-2.5">
                {formErrors.imagen}
              </p>
            )}
          </div>
        </div>

        {/* Footer - Always Visible */}
        <div className="sticky bottom-0 bg-gs-card border-t border-gs-border px-6 py-4 flex gap-3 justify-between">
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isSubmitting || isDeleting}
            className="flex items-center gap-2"
          >
            <Icon name="trash" size={16} />
            <span>Eliminar</span>
          </Button>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting || isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || isDeleting}
              className="flex items-center justify-center gap-2 min-w-[160px]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gs-bg border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Icon name="check" size={16} />
                  <span>Guardar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
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
      )}
    </>
  )
}
