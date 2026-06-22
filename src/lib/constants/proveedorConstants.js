export const PROVEEDOR_STATUS = {
  ALL:      'all',
  ACTIVE:   'active',
  INACTIVE: 'inactive',
}

export const PROVEEDOR_STATUS_OPTIONS = [
  { value: PROVEEDOR_STATUS.ALL,      label: 'Todos' },
  { value: PROVEEDOR_STATUS.ACTIVE,   label: 'Activos' },
  { value: PROVEEDOR_STATUS.INACTIVE, label: 'Inactivos' },
]

// Catálogo compartido de tipos de documento (también lo usará clientes)
export const TIPOS_DOCUMENTO = [
  { value: 'RUC',       label: 'RUC' },
  { value: 'DNI',       label: 'DNI' },
  { value: 'CE',        label: 'Carnet de Extranjería' },
  { value: 'Pasaporte', label: 'Pasaporte' },
]
