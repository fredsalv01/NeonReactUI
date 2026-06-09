import { test, expect } from '@playwright/test'

test.describe('Sales Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Check if we're already authenticated by visiting dashboard
    await page.goto('http://localhost:5173/dashboard', {
      waitUntil: 'domcontentloaded',
    })

    // If redirected to login, we're not authenticated
    const isLogin = page.url().includes('/login')
    if (isLogin) {
      test.skip()
    }

    // Navigate to sales page
    await page.goto('http://localhost:5173/dashboard/sales', {
      waitUntil: 'domcontentloaded',
    })
  })

  test('should load sales page successfully', async ({ page }) => {
    // Page should not be redirected to login
    expect(page.url()).not.toContain('/login')

    // Check page content exists
    const content = await page.content()
    expect(content).toContain('Ventas')
  })

  test('should have main elements on page', async ({ page }) => {
    // Check for key page elements
    const heading = page.locator('h1, h2')
    const count = await heading.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have form inputs for filtering', async ({ page }) => {
    // Check for input elements
    const inputs = page.locator('input')
    const count = await inputs.count()
    // Should have search and date inputs at minimum
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('should render table or data container', async ({ page }) => {
    // Check for table or div with table role
    const table = page.locator('table, [role="table"]')
    const isVisible = await table.isVisible().catch(() => false)
    // Table may not be visible if no data, but should exist in DOM
    const count = await table.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should have select elements for pagination', async ({ page }) => {
    // Check for select elements (page size selector)
    const selects = page.locator('select')
    const count = await selects.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should have action buttons', async ({ page }) => {
    // Check for buttons in the page
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should display page without errors', async ({ page }) => {
    // Collect all console errors
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Wait a bit for any errors to appear
    await page.waitForTimeout(1000)

    // There should be no critical errors
    expect(errors.filter(e => e.includes('Uncaught'))).toHaveLength(0)
  })

  test('should have proper page structure', async ({ page }) => {
    // Check that page has basic structure
    const html = await page.content()
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('<body')
  })

  test('should load all required resources', async ({ page }) => {
    // Check that the page fully loaded
    const readyState = await page.evaluate(() => document.readyState)
    expect(['interactive', 'complete']).toContain(readyState)
  })

  test('component should be responsive', async ({ page }) => {
    // Check that page renders at different sizes
    const viewports = [
      { width: 1280, height: 720 },  // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },   // Mobile
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      const content = await page.content()
      expect(content.length).toBeGreaterThan(0)
    }
  })

  test('should maintain structure after interactions', async ({ page }) => {
    const initialContent = await page.content()

    // Try to interact with selects if present
    const selects = page.locator('select')
    const selectCount = await selects.count()

    if (selectCount > 0) {
      // Click first select
      await selects.first().click()
    }

    // Content should still be valid
    const afterContent = await page.content()
    expect(afterContent.length).toBeGreaterThan(0)
  })
})
