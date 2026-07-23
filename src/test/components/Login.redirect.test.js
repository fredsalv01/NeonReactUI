import { describe, it, expect, beforeEach } from 'vitest'
import { canAccessPath, ROLE_LANDING } from '../../lib/constants/permissions'

// ponytail: reproduce la lógica del useEffect de Login.jsx sin renderizar.
// Si cambias la fórmula en Login.jsx, actualiza esta función también.
const isSafeInternalPath = (p) =>
  typeof p === 'string' && /^\/dashboard(\/|$|\?)/.test(p)

const resolveLoginTarget = (role, intendedRoute) => {
  const fallback = ROLE_LANDING[role] || '/dashboard/inventory'
  return isSafeInternalPath(intendedRoute) && canAccessPath(role, intendedRoute)
    ? intendedRoute
    : fallback
}

describe('Login post-auth redirect', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('sin intended_route', () => {
    it('Administrador → /dashboard', () => {
      expect(resolveLoginTarget('Administrador', null)).toBe('/dashboard')
    })
    it('Almacén → /dashboard/inventory', () => {
      expect(resolveLoginTarget('Almacén', null)).toBe('/dashboard/inventory')
    })
    it('Ventas → /dashboard/sales', () => {
      expect(resolveLoginTarget('Ventas', null)).toBe('/dashboard/sales')
    })
    it('Técnico → /dashboard/inventory', () => {
      expect(resolveLoginTarget('Técnico', null)).toBe('/dashboard/inventory')
    })
  })

  describe('con intended_route permitida para el rol', () => {
    it('respeta la ruta guardada', () => {
      expect(resolveLoginTarget('Ventas', '/dashboard/cotizaciones')).toBe('/dashboard/cotizaciones')
      expect(resolveLoginTarget('Almacén', '/dashboard/compras')).toBe('/dashboard/compras')
      expect(resolveLoginTarget('Técnico', '/dashboard/equipment/EQ-001')).toBe('/dashboard/equipment/EQ-001')
    })

    it('respeta la ruta con query string', () => {
      expect(resolveLoginTarget('Administrador', '/dashboard/reports?rango=30d')).toBe('/dashboard/reports?rango=30d')
    })
  })

  describe('con intended_route NO permitida (bug original)', () => {
    it('Técnico intentando /dashboard cae a su landing (era el bug)', () => {
      expect(resolveLoginTarget('Técnico', '/dashboard')).toBe('/dashboard/inventory')
    })

    it('Ventas intentando /dashboard cae a su landing', () => {
      expect(resolveLoginTarget('Ventas', '/dashboard')).toBe('/dashboard/sales')
    })

    it('Almacén intentando /dashboard/users cae a su landing', () => {
      expect(resolveLoginTarget('Almacén', '/dashboard/users')).toBe('/dashboard/inventory')
    })

    it('Técnico intentando /dashboard/sales cae a su landing', () => {
      expect(resolveLoginTarget('Técnico', '/dashboard/sales')).toBe('/dashboard/inventory')
    })
  })

  describe('con intended_route externa (open-redirect defense)', () => {
    it('rechaza URL absoluta a otro dominio', () => {
      expect(resolveLoginTarget('Administrador', 'https://evil.com/steal')).toBe('/dashboard')
    })

    it('rechaza path fuera de /dashboard', () => {
      expect(resolveLoginTarget('Administrador', '/login')).toBe('/dashboard')
      expect(resolveLoginTarget('Administrador', '/random')).toBe('/dashboard')
    })

    it('rechaza schemas peligrosos', () => {
      expect(resolveLoginTarget('Administrador', 'javascript:alert(1)')).toBe('/dashboard')
      expect(resolveLoginTarget('Administrador', '//evil.com')).toBe('/dashboard')
    })
  })

  describe('rol sin ROLE_LANDING definido', () => {
    it('cae al fallback global /dashboard/inventory', () => {
      expect(resolveLoginTarget('RolInventado', null)).toBe('/dashboard/inventory')
      expect(resolveLoginTarget(undefined, null)).toBe('/dashboard/inventory')
    })
  })
})
