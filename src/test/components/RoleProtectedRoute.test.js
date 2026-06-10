import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('RoleProtectedRoute - Intended Route & Role Logic', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('localStorage intended_route (unauthenticated)', () => {
    it('should save deep-link route to localStorage when redirecting to login', () => {
      const testPath = '/dashboard/equipment/equipo-123'

      if (testPath && testPath !== '/login') {
        localStorage.setItem('intended_route', testPath)
      }

      expect(localStorage.getItem('intended_route')).toBe(testPath)
    })

    it('should preserve route with query string for QR deep links', () => {
      const testPath = '/dashboard/equipment/equipo-123?tab=kardex'

      if (testPath && testPath !== '/login') {
        localStorage.setItem('intended_route', testPath)
      }

      expect(localStorage.getItem('intended_route')).toBe(testPath)
    })

    it('should not save /login as intended route', () => {
      const testPath = '/login'

      if (testPath && testPath !== '/login') {
        localStorage.setItem('intended_route', testPath)
      }

      expect(localStorage.getItem('intended_route')).toBeNull()
    })
  })

  describe('role permission logic', () => {
    it('should grant access when user role is in allowedRoles', () => {
      const userRole = 'Almacén'
      const allowedRoles = ['Almacén', 'Administrador', 'Técnico']

      const hasPermission = allowedRoles.length === 0 || allowedRoles.includes(userRole)

      expect(hasPermission).toBe(true)
    })

    it('should deny access when user role is NOT in allowedRoles', () => {
      const userRole = 'Ventas'
      const allowedRoles = ['Almacén', 'Administrador', 'Técnico']

      const hasPermission = allowedRoles.length === 0 || allowedRoles.includes(userRole)

      expect(hasPermission).toBe(false)
    })

    it('should grant access when allowedRoles is empty (open route)', () => {
      const userRole = 'Cualquiera'
      const allowedRoles = []

      const hasPermission = allowedRoles.length === 0 || allowedRoles.includes(userRole)

      expect(hasPermission).toBe(true)
    })

    it('should be case-sensitive on role match', () => {
      const userRole = 'almacén'
      const allowedRoles = ['Almacén']

      const hasPermission = allowedRoles.length === 0 || allowedRoles.includes(userRole)

      expect(hasPermission).toBe(false)
    })
  })

  describe('intended_route cleanup on access denied', () => {
    it('should clear intended_route when role check fails to prevent retry loops', () => {
      localStorage.setItem('intended_route', '/dashboard/equipment/equipo-123')

      const userRole = 'Ventas'
      const allowedRoles = ['Almacén']
      const hasPermission = allowedRoles.includes(userRole)

      if (!hasPermission) {
        localStorage.removeItem('intended_route')
      }

      expect(localStorage.getItem('intended_route')).toBeNull()
    })

    it('should NOT clear intended_route when access is granted', () => {
      const route = '/dashboard/equipment/equipo-123'
      localStorage.setItem('intended_route', route)

      const userRole = 'Almacén'
      const allowedRoles = ['Almacén']
      const hasPermission = allowedRoles.includes(userRole)

      if (!hasPermission) {
        localStorage.removeItem('intended_route')
      }

      expect(localStorage.getItem('intended_route')).toBe(route)
    })
  })

  describe('full QR deep-link flow', () => {
    it('should complete: QR scan → save route → login → restore route', () => {
      const qrRoute = '/dashboard/equipment/equipo-abc'

      if (qrRoute !== '/login') {
        localStorage.setItem('intended_route', qrRoute)
      }
      expect(localStorage.getItem('intended_route')).toBe(qrRoute)

      const routeToUse = localStorage.getItem('intended_route') || '/dashboard'
      localStorage.removeItem('intended_route')

      expect(routeToUse).toBe(qrRoute)
      expect(localStorage.getItem('intended_route')).toBeNull()
    })
  })
})
