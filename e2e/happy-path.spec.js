import { test, expect } from '@playwright/test'

const EMAIL = process.env.VITE_E2E_EMAIL
const PASSWORD = process.env.VITE_E2E_PASSWORD

test('login → dashboard loads', async ({ page }) => {
  test.skip(!EMAIL || !PASSWORD, 'set VITE_E2E_EMAIL / VITE_E2E_PASSWORD in env')
  await page.goto('/')
  await page.locator('input[name="email"]').fill(EMAIL)
  await page.locator('input[name="password"]').fill(PASSWORD)
  await page.getByRole('button', { name: /Iniciar sesión con Correo/i }).click()

  await page.waitForURL('**/dashboard', { timeout: 15_000 })
  await expect(page).toHaveURL(/\/dashboard/)
})

// ponytail: one slice — login + redirect proves auth + routing + supabase wiring.
// Extend with equipo/cotización/venta steps once the seed user is stable.
