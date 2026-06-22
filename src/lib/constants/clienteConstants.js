export { TIPOS_DOCUMENTO } from './proveedorConstants'

export const CLIENTE_STATUS = {
  ALL:      'all',
  ACTIVE:   'active',
  INACTIVE: 'inactive',
}

export const CLIENTE_STATUS_OPTIONS = [
  { value: CLIENTE_STATUS.ALL,      label: 'Todos' },
  { value: CLIENTE_STATUS.ACTIVE,   label: 'Activos' },
  { value: CLIENTE_STATUS.INACTIVE, label: 'Inactivos' },
]
