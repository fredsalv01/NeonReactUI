import { Modal, Button, InputField, NumberInput, DropZone, Progress, Icon } from '../../ui'
import { useEquipoForm } from '../../../hooks/useEquipoForm'
import { useInventoryStore } from '../../../stores/inventoryStore'
import { useToast } from '../../ui'
import { useRef } from 'react'
import { humanizeError } from '../../../lib/utils/errors'

export const AddEquipoModal = ({ open, onClose }) => {
  const { toast } = useToast()
  const inputRefs = useRef({})
  const addEquipo = useInventoryStore(state => state.addEquipo)
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

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      let imagenUrl = null

      if (formData.imagen) {
        imagenUrl = await uploadImage(formData.imagen)
      }

      await addEquipo({
        nombre: formData.nombre,
        tipo: formData.tipo,
        serie: formData.serie,
        precio_compra: parseFloat(formData.precio_compra),
        precio_venta: parseFloat(formData.precio_venta),
        stock: parseInt(formData.stock),
        imagen_url: imagenUrl,
      })

      toast.success('Equipo agregado correctamente' + (imagenUrl ? ' con imagen' : ''))
      handleClose()
    } catch (err) {
      toast.error(humanizeError(err, 'No se pudo crear el equipo'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Agregar Nuevo Equipo"
      subtitle="Registra los detalles del equipo en el inventario"
      size="lg"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
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
                <span>Guardar Equipo</span>
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-gs-soft">Subiendo imagen...</p>
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
            onChange={(e) => {
              handleInputChange(e)
            }}
            onBlur={(e) => {
              handleInputChange(e)
            }}
            placeholder="Ej: Dell XPS 13, MacBook Pro..."
            className={`w-full px-4 py-2.5 bg-gs-bg border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all ${
              formErrors.nombre ? 'border-gs-danger ring-1 ring-gs-danger' : 'border-gs-border focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20'
            }`}
            autoComplete="off"
            spellCheck="false"
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
              placeholder="Ej: Laptop, Monitor..."
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
              placeholder="Ej: DXP-2024-001"
              className={`w-full px-4 py-2.5 bg-gs-bg border rounded-lg text-gs-text placeholder-gs-muted outline-none transition-all font-['DM_Mono'] text-sm ${
                formErrors.serie ? 'border-gs-danger ring-1 ring-gs-danger' : 'border-gs-border focus:border-gs-accent focus:ring-1 focus:ring-gs-accent/20'
              }`}
            />
          </InputField>
        </div>

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
          label="Stock Inicial (unidades)"
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

        {/* Image Upload */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gs-text">Imagen del Equipo</p>
          <p className="text-xs text-gs-soft">Sube una foto para mejor identificación (opcional)</p>
        </div>

        <DropZone
          accept="image/*"
          maxSizeMB={5}
          onFiles={handleImageChange}
          label="Arrastra una imagen aquí o haz clic"
          multiple={false}
        />

        {formData.imagen && (
          <div className="flex items-center gap-3 p-3 bg-gs-accent/5 border border-gs-accent/25 rounded-lg">
            <Icon name="check" size={16} color="var(--gs-accent)" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gs-text truncate">{formData.imagen.name}</p>
              <p className="text-xs text-gs-soft font-['DM_Mono']">{(formData.imagen.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              onClick={handleImageRemove}
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

        {/* Helper */}
        <div className="bg-gs-accent/5 border border-gs-accent/25 rounded-lg p-3">
          <p className="text-xs text-gs-soft font-['DM_Mono']">
            <span className="text-gs-accent">→</span> Validación automática con Zod
          </p>
        </div>
      </div>
    </Modal>
  )
}
