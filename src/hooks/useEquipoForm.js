import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { validateEquipo } from '../lib/schemas/equipoSchema'
import { INITIAL_FORM_DATA, STORAGE_BUCKET, STORAGE_CACHE_TIME, UPLOAD_PROGRESS_DELAY } from '../lib/constants/inventoryConstants'

export const useEquipoForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageChange = (files) => {
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, imagen: files[0] }))
      if (formErrors.imagen) {
        setFormErrors(prev => ({ ...prev, imagen: '' }))
      }
    }
  }

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, imagen: null }))
    setFormErrors(prev => ({ ...prev, imagen: '' }))
  }

  const validateForm = () => {
    const dataToValidate = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      serie: formData.serie,
      estado: formData.estado,
      precio_compra: parseFloat(formData.precio_compra),
      precio_venta: parseFloat(formData.precio_venta),
      stock: parseInt(formData.stock),
      imagen: formData.imagen,
    }

    const result = validateEquipo(dataToValidate)
    setFormErrors(result.errors)
    return result.success
  }

  const uploadImage = async (file) => {
    if (!file) return null

    try {
      const fileName = `${Date.now()}-${file.name}`
      setUploadProgress(50)

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: STORAGE_CACHE_TIME,
          upsert: false,
        })

      if (uploadError) throw uploadError

      setUploadProgress(75)

      const { data: publicData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName)

      setUploadProgress(100)
      await new Promise(resolve => setTimeout(resolve, UPLOAD_PROGRESS_DELAY))

      return publicData?.publicUrl
    } catch (error) {
      setUploadProgress(0)
      throw error
    }
  }

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA)
    setFormErrors({})
    setUploadProgress(0)
  }

  return {
    formData,
    formErrors,
    isSubmitting,
    uploadProgress,
    setIsSubmitting,
    setUploadProgress,
    handleInputChange,
    handleImageChange,
    handleImageRemove,
    validateForm,
    uploadImage,
    resetForm,
  }
}
