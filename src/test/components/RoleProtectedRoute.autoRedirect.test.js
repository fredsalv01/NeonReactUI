import { describe, it, expect } from 'vitest'
import { ROLE_LANDING } from '../../lib/constants/permissions'

// ponytail: reproduce el branch !hasPermission de RoleProtectedRoute.jsx.
// El componente hace <Navigate to={ROLE_LANDING[userRole] || fallback} replace />
// Este helper es el mismo cálculo — si cambia allá, cambiar aquí.
const resolveAutoRedirect = (userRole) =>
  ROLE_LANDING[userRole] || '/dashboard/inventory'

describe('RoleProtectedRoute auto-redirect on no permission', () => {
  it('redirige Técnico a inventory', () => {
    expect(resolveAutoRedirect('Técnico')).toBe('/dashboard/inventory')
  })
  it('redirige Ventas a sales', () => {
    expect(resolveAutoRedirect('Ventas')).toBe('/dashboard/sales')
  })
  it('redirige Almacén a inventory', () => {
    expect(resolveAutoRedirect('Almacén')).toBe('/dashboard/inventory')
  })
  it('redirige Administrador a dashboard', () => {
    expect(resolveAutoRedirect('Administrador')).toBe('/dashboard')
  })

  it('rol desconocido cae al fallback global', () => {
    expect(resolveAutoRedirect('RolInexistente')).toBe('/dashboard/inventory')
    expect(resolveAutoRedirect(undefined)).toBe('/dashboard/inventory')
    expect(resolveAutoRedirect(null)).toBe('/dashboard/inventory')
  })

  it('NUNCA redirige a /dashboard si el rol no es Administrador', () => {
    // Esto es la regresión que queremos evitar: técnico → /dashboard → Acceso Denegado.
    const noAdminRoles = ['Técnico', 'Almacén', 'Ventas', 'Rol-cualquiera']
    noAdminRoles.forEach((role) => {
      expect(resolveAutoRedirect(role), `${role} debería NO ir a /dashboard puro`).not.toBe('/dashboard')
    })
  })
})
