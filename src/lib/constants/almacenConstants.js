export const ALMACEN_STATUS = {
  ALL:      'all',
  ACTIVE:   'active',
  INACTIVE: 'inactive',
}

export const ALMACEN_STATUS_OPTIONS = [
  { value: ALMACEN_STATUS.ALL,      label: 'Todos' },
  { value: ALMACEN_STATUS.ACTIVE,   label: 'Activos' },
  { value: ALMACEN_STATUS.INACTIVE, label: 'Inactivos' },
]

// UUID fijo del almacén "Principal" creado en la migración inicial
export const ALMACEN_PRINCIPAL_ID = '00000000-0000-0000-0000-000000000001'
