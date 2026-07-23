import { describe, it, expect } from 'vitest'
import { can, canAccessPath, ROLE_LANDING, ROUTE_ROLES, REPORT_SECTIONS } from '../../lib/constants/permissions'

const A = 'Administrador'
const W = 'Almacén'
const V = 'Ventas'
const T = 'Técnico'

describe('permissions.can()', () => {
  it('returns true when role is in allowedRoles', () => {
    expect(can(A, [A, V])).toBe(true)
  })
  it('returns false when role is not in allowedRoles', () => {
    expect(can(T, [A, V])).toBe(false)
  })
  it('returns false when allowedRoles is not an array', () => {
    expect(can(A, undefined)).toBe(false)
    expect(can(A, null)).toBe(false)
    expect(can(A, 'Administrador')).toBe(false)
  })
})

describe('permissions.canAccessPath()', () => {
  it('grants /dashboard to Administrador only', () => {
    expect(canAccessPath(A, '/dashboard')).toBe(true)
    expect(canAccessPath(W, '/dashboard')).toBe(false)
    expect(canAccessPath(V, '/dashboard')).toBe(false)
    expect(canAccessPath(T, '/dashboard')).toBe(false)
  })

  it('grants /dashboard/inventory to all roles', () => {
    expect(canAccessPath(A, '/dashboard/inventory')).toBe(true)
    expect(canAccessPath(W, '/dashboard/inventory')).toBe(true)
    expect(canAccessPath(V, '/dashboard/inventory')).toBe(true)
    expect(canAccessPath(T, '/dashboard/inventory')).toBe(true)
  })

  it('grants /dashboard/sales to Admin+Ventas but not Almacén/Técnico', () => {
    expect(canAccessPath(A, '/dashboard/sales')).toBe(true)
    expect(canAccessPath(V, '/dashboard/sales')).toBe(true)
    expect(canAccessPath(W, '/dashboard/sales')).toBe(false)
    expect(canAccessPath(T, '/dashboard/sales')).toBe(false)
  })

  it('matches dynamic subpaths (e.g. /dashboard/equipment/:id)', () => {
    expect(canAccessPath(T, '/dashboard/equipment/EQ-001')).toBe(true)
    expect(canAccessPath(T, '/dashboard/equipment/abc-123')).toBe(true)
  })

  it('strips query string before matching', () => {
    expect(canAccessPath(V, '/dashboard/reports?rango=30d')).toBe(true)
    expect(canAccessPath(T, '/dashboard/reports?rango=30d')).toBe(false)
  })

  it('returns false for paths outside /dashboard', () => {
    expect(canAccessPath(A, '/random')).toBe(false)
    expect(canAccessPath(A, '/foo/bar')).toBe(false)
    expect(canAccessPath(A, '/login')).toBe(false)
  })

  it('unknown /dashboard/* paths default to admin-only (safe fallback)', () => {
    // ponytail: si alguien agrega una ruta y olvida ROUTE_ROLES, el prefix
    // /dashboard actúa como catch-all — solo Admin entra.
    expect(canAccessPath(A, '/dashboard/xyz-nonexistent')).toBe(true)
    expect(canAccessPath(T, '/dashboard/xyz-nonexistent')).toBe(false)
    expect(canAccessPath(V, '/dashboard/xyz-nonexistent')).toBe(false)
    expect(canAccessPath(W, '/dashboard/xyz-nonexistent')).toBe(false)
  })

  it('returns false when role is falsy', () => {
    expect(canAccessPath(undefined, '/dashboard/inventory')).toBe(false)
    expect(canAccessPath(null, '/dashboard/inventory')).toBe(false)
    expect(canAccessPath('', '/dashboard/inventory')).toBe(false)
  })

  it('returns false when path is not a string', () => {
    expect(canAccessPath(A, null)).toBe(false)
    expect(canAccessPath(A, undefined)).toBe(false)
    expect(canAccessPath(A, 42)).toBe(false)
  })

  it('does NOT match /dashboardish or partial prefixes', () => {
    // "/dashboard" prefix should only match "/dashboard" exactly or "/dashboard/..."
    expect(canAccessPath(A, '/dashboardish')).toBe(false)
    expect(canAccessPath(A, '/dashboard-other')).toBe(false)
  })
})

describe('ROLE_LANDING contract', () => {
  it('has a landing for every role we support', () => {
    expect(ROLE_LANDING[A]).toBeDefined()
    expect(ROLE_LANDING[W]).toBeDefined()
    expect(ROLE_LANDING[V]).toBeDefined()
    expect(ROLE_LANDING[T]).toBeDefined()
  })

  it('every landing is a path the role actually can access', () => {
    Object.entries(ROLE_LANDING).forEach(([role, path]) => {
      expect(canAccessPath(role, path)).toBe(true)
    })
  })

  it('routes Administrador to /dashboard (admin-only landing)', () => {
    expect(ROLE_LANDING[A]).toBe('/dashboard')
  })

  it('routes non-admin roles away from /dashboard', () => {
    expect(ROLE_LANDING[W]).not.toBe('/dashboard')
    expect(ROLE_LANDING[V]).not.toBe('/dashboard')
    expect(ROLE_LANDING[T]).not.toBe('/dashboard')
  })
})

describe('ROUTE_ROLES contract', () => {
  it('dashboard is admin-only (the fix reason)', () => {
    expect(ROUTE_ROLES.dashboard).toEqual([A])
  })

  it('every section is a non-empty array', () => {
    Object.entries(ROUTE_ROLES).forEach(([section, roles]) => {
      expect(Array.isArray(roles), `${section} must be an array`).toBe(true)
      expect(roles.length, `${section} must have at least one role`).toBeGreaterThan(0)
    })
  })
})

describe('REPORT_SECTIONS contract', () => {
  it('kardexReport is available for Admin and Almacén', () => {
    expect(REPORT_SECTIONS.kardexReport).toContain(A)
    expect(REPORT_SECTIONS.kardexReport).toContain(W)
    expect(REPORT_SECTIONS.kardexReport).not.toContain(T)
  })

  it('exportPdf is admin-only', () => {
    expect(REPORT_SECTIONS.exportPdf).toEqual([A])
  })
})
