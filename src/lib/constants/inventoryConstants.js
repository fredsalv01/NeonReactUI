// Stock state is derived from the current stock value, not stored on the row.
// Geotop only sells brand-new topographic equipment, so "estado" really means
// availability tier of the inventory.
export const STOCK_THRESHOLDS = {
  BAJO_MAX: 6,
  MEDIO_MAX: 12,
}

export const STOCK_ESTADO_OPTIONS = [
  { value: 'Disponible', label: 'Disponible' },
  { value: 'Stock Medio', label: 'Stock Medio' },
  { value: 'Stock Bajo', label: 'Stock Bajo' },
  { value: 'Sin Stock', label: 'Sin Stock' },
]

export const getStockEstado = (stock) => {
  const n = Number(stock)
  if (!Number.isFinite(n) || n <= 0) return 'Sin Stock'
  if (n <= STOCK_THRESHOLDS.BAJO_MAX) return 'Stock Bajo'
  if (n <= STOCK_THRESHOLDS.MEDIO_MAX) return 'Stock Medio'
  return 'Disponible'
}

export const PAGE_SIZES = [5, 10, 15, 20]

export const INITIAL_FORM_DATA = {
  nombre: '',
  tipo: '',
  serie: '',
  precio_compra: '',
  precio_venta: '',
  stock: '',
  imagen: null,
}

export const STORAGE_BUCKET = 'equipos'
export const STORAGE_CACHE_TIME = 3600

export const UPLOAD_PROGRESS_DELAY = 300
