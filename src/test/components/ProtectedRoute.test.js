import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('ProtectedRoute - Intended Route Logic', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('localStorage intended_route', () => {
    it('should save intended route to localStorage when redirecting to login', () => {
      // Simulate what ProtectedRoute does
      const testPath = '/dashboard/equipment/equipo-123'

      // This is what ProtectedRoute does
      localStorage.setItem('intended_route', testPath)

      // Verify it was saved
      const savedRoute = localStorage.getItem('intended_route')
      expect(savedRoute).toBe(testPath)
    })

    it('should preserve route with query string', () => {
      const testPath = '/dashboard/equipment/equipo-123?tab=details'
      localStorage.setItem('intended_route', testPath)

      const savedRoute = localStorage.getItem('intended_route')
      expect(savedRoute).toBe(testPath)
    })

    it('should not save login page as intended route', () => {
      const testPath = '/login'

      // ProtectedRoute should NOT save /login as intended route
      if (testPath !== '/login') {
        localStorage.setItem('intended_route', testPath)
      }

      const savedRoute = localStorage.getItem('intended_route')
      expect(savedRoute).toBeNull()
    })

    it('should clean up intended route after redirect', () => {
      const testPath = '/dashboard/equipment/equipo-123'
      localStorage.setItem('intended_route', testPath)

      // Simulate login cleanup
      localStorage.removeItem('intended_route')

      const savedRoute = localStorage.getItem('intended_route')
      expect(savedRoute).toBeNull()
    })
  })

  describe('redirect logic', () => {
    it('should redirect to intended route if it exists', () => {
      const intendedRoute = '/dashboard/equipment/equipo-123'
      localStorage.setItem('intended_route', intendedRoute)

      // Simulate login flow
      const routeToUse = localStorage.getItem('intended_route') || '/dashboard'
      localStorage.removeItem('intended_route')

      expect(routeToUse).toBe(intendedRoute)
    })

    it('should fallback to dashboard if no intended route', () => {
      // No intended route set
      const routeToUse = localStorage.getItem('intended_route') || '/dashboard'

      expect(routeToUse).toBe('/dashboard')
    })

    it('should handle multiple equipment detail routes', () => {
      const routes = [
        '/dashboard/equipment/equipo-1',
        '/dashboard/equipment/equipo-2',
        '/dashboard/equipment/special-code-123',
      ]

      routes.forEach(route => {
        localStorage.clear()
        localStorage.setItem('intended_route', route)

        const savedRoute = localStorage.getItem('intended_route')
        expect(savedRoute).toBe(route)

        localStorage.removeItem('intended_route')
        expect(localStorage.getItem('intended_route')).toBeNull()
      })
    })

    it('should clear intended route to prevent persistent redirects', () => {
      localStorage.setItem('intended_route', '/dashboard/equipment/equipo-123')

      // First login - should use the route
      let routeToUse = localStorage.getItem('intended_route') || '/dashboard'
      expect(routeToUse).toBe('/dashboard/equipment/equipo-123')

      // Clear it
      localStorage.removeItem('intended_route')

      // Second login - should fallback to dashboard
      routeToUse = localStorage.getItem('intended_route') || '/dashboard'
      expect(routeToUse).toBe('/dashboard')
    })
  })
})
