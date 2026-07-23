// ─────────────────────────────────────────────────────────────────
// Mapa centralizado de permisos por rol. Una sola fuente de verdad
// para sidebar, rutas, landings y capabilities de cada página.
// Seguridad real (RLS en Supabase) es siguiente iteración —
// esto es UX por rol, no impide F12.
// ─────────────────────────────────────────────────────────────────
import { ROLES } from './userConstants'

const A = ROLES.ADMINISTRADOR.nombre
const W = ROLES.ALMACEN.nombre
const V = ROLES.VENTAS.nombre
const T = ROLES.TECNICO.nombre

// Roles permitidos por ruta (los que NO aparecen aquí son ProtectedRoute simple)
export const ROUTE_ROLES = {
  dashboard:     [A],
  inventory:     [A, W, V, T],
  equipment:     [A, W, V, T],
  scan:          [A, W, V, T],
  sales:         [A, V],
  cotizaciones:  [A, V],
  reports:       [A, W, V],
  users:         [A],
  proveedores:   [A, W],
  clientes:      [A, V],
  almacenes:     [A, W, V, T],
  compras:       [A, W],
  settings:      [A],
}

// Quién puede ESCRIBIR en cada módulo (botones de crear/editar/eliminar)
export const CAN_WRITE = {
  inventory: [A, W],
  almacenes: [A, W],
}

// Secciones internas de Reports: cada bloque se muestra si el rol está en la lista
export const REPORT_SECTIONS = {
  monthlySales:    [A, V],          // Area chart "Ventas Mensual"
  categoriesPie:   [A],             // Pie "Ventas por Categoría"
  inventoryStatus: [A, W],          // Donut "Estado Inventario"
  lowStockTable:   [A, W],          // Tabla "Requiere reposición"
  topSelling:      [A, V],          // Tabla "Top 5 más vendidos"
  cotizaciones:    [A, V],          // Acceso rápido a cotizaciones
  kardexReport:    [A, W],          // Generador de reporte Excel/CSV de kardex
  statValor:       [A, W],          // Card "Valor Inventario"
  statCantidad:    [A, V],          // Card "Cantidad Vendida"
  statMonto:       [A, V],          // Card "Monto Vendido"
  statVentas:      [A, V],          // Card "N° Ventas"
  exportPdf:       [A],             // Botón exportar PDF
}

// Ruta a la que se redirige cada rol después del login
export const ROLE_LANDING = {
  [A]: '/dashboard',
  [W]: '/dashboard/inventory',
  [V]: '/dashboard/sales',
  [T]: '/dashboard/inventory',
}

export const can = (userRole, allowedRoles) =>
  Array.isArray(allowedRoles) && allowedRoles.includes(userRole)

// ponytail: prefix match para resolver pathname → section key.
// Orden importa: prefijos específicos primero, /dashboard exacto al final.
const PATH_TO_SECTION = [
  ['/dashboard/inventory',    'inventory'],
  ['/dashboard/equipment',    'equipment'],
  ['/dashboard/scan',         'scan'],
  ['/dashboard/sales',        'sales'],
  ['/dashboard/cotizaciones', 'cotizaciones'],
  ['/dashboard/reports',      'reports'],
  ['/dashboard/users',        'users'],
  ['/dashboard/proveedores',  'proveedores'],
  ['/dashboard/clientes',     'clientes'],
  ['/dashboard/almacenes',    'almacenes'],
  ['/dashboard/compras',      'compras'],
  ['/dashboard/settings',     'settings'],
  ['/dashboard',              'dashboard'],
]

export const canAccessPath = (role, path) => {
  if (!role || typeof path !== 'string') return false
  const clean = path.split('?')[0]
  const entry = PATH_TO_SECTION.find(
    ([prefix]) => clean === prefix || clean.startsWith(prefix + '/')
  )
  return entry ? can(role, ROUTE_ROLES[entry[1]]) : false
}
