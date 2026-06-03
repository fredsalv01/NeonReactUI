export const ESTADO_OPTIONS = [
  { value: 'Disponible', label: 'Disponible' },
  { value: 'En uso', label: 'En uso' },
  { value: 'Mantenimiento', label: 'Mantenimiento' },
  { value: 'Baja', label: 'Baja' },
]

export const PAGE_SIZES = [5, 10, 15, 20]

export const INITIAL_FORM_DATA = {
  nombre: '',
  tipo: '',
  serie: '',
  estado: 'Disponible',
  precio_compra: '',
  precio_venta: '',
  stock: '',
  imagen: null,
}

export const STORAGE_BUCKET = 'equipos-imagenes'
export const STORAGE_CACHE_TIME = 3600

export const UPLOAD_PROGRESS_DELAY = 300
