# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\sales.spec.js >> Sales Page E2E Tests >> should display image column in table
- Location: tests\e2e\sales.spec.js:139:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('table') to be visible

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - img [ref=e8]
      - generic [ref=e10]: GeoStock
    - paragraph [ref=e11]: Sistema de Control de Inventarios
    - paragraph [ref=e12]: GEOTOP SAC — v1.0
  - generic [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e15]: Email
      - textbox "you@example.com" [ref=e16]
    - generic [ref=e17]:
      - generic [ref=e18]: Password
      - textbox "••••••••" [ref=e19]
    - button "Sign in with Email" [ref=e20] [cursor=pointer]:
      - img [ref=e21]
      - text: Sign in with Email
  - generic [ref=e28]: Or continue with
  - button "Microsoft" [ref=e29] [cursor=pointer]:
    - img [ref=e30]
    - text: Microsoft
  - paragraph [ref=e35]: Don't have an account? Contact administrator
```

# Test source

```ts
  41  | 
  42  |   test('should filter sales by date', async ({ page }) => {
  43  |     // Fill date input
  44  |     const dateInput = page.locator('input[type="date"]')
  45  |     await dateInput.fill('2024-01-15')
  46  | 
  47  |     // Verify date input has value
  48  |     await expect(dateInput).toHaveValue('2024-01-15')
  49  |   })
  50  | 
  51  |   test('should display pagination controls', async ({ page }) => {
  52  |     // Check for page size selector
  53  |     const pageSize = page.locator('select')
  54  |     await expect(pageSize).toBeVisible()
  55  |   })
  56  | 
  57  |   test('should change page size', async ({ page }) => {
  58  |     // Get select element
  59  |     const pageSize = page.locator('select')
  60  | 
  61  |     // Change page size
  62  |     await pageSize.selectOption('10')
  63  | 
  64  |     // Verify selection
  65  |     await expect(pageSize).toHaveValue('10')
  66  |   })
  67  | 
  68  |   test('should display action buttons', async ({ page }) => {
  69  |     // Wait for table to load
  70  |     await page.waitForSelector('table')
  71  | 
  72  |     // Check for action buttons (Eye, Edit, Trash icons)
  73  |     const buttons = page.locator('button[title*="Ver"], button[title*="Editar"], button[title*="Eliminar"]')
  74  | 
  75  |     // Should have at least some action buttons
  76  |     const count = await buttons.count()
  77  |     expect(count).toBeGreaterThanOrEqual(0)
  78  |   })
  79  | 
  80  |   test('should display sales totals', async ({ page }) => {
  81  |     // Check for total sales text
  82  |     const totalText = page.locator('text=/Total de ventas|Monto Total/')
  83  | 
  84  |     // Should be visible
  85  |     await expect(totalText.first()).toBeVisible()
  86  |   })
  87  | 
  88  |   test('should clear filters', async ({ page }) => {
  89  |     // Fill search
  90  |     const searchBar = page.locator('input[placeholder*="Buscar"]')
  91  |     await searchBar.fill('Test')
  92  | 
  93  |     // Clear search
  94  |     await searchBar.clear()
  95  | 
  96  |     // Verify empty
  97  |     await expect(searchBar).toHaveValue('')
  98  |   })
  99  | 
  100 |   test('should display empty state when no results', async ({ page }) => {
  101 |     // Search for non-existent item
  102 |     const searchBar = page.locator('input[placeholder*="Buscar"]')
  103 |     await searchBar.fill('NONEXISTENTITEM123456789')
  104 | 
  105 |     // Wait for table update
  106 |     await page.waitForTimeout(500)
  107 | 
  108 |     // Check for empty state message (optional - depends on implementation)
  109 |     const emptyState = page.locator('text=/Sin resultados|No hay ventas/')
  110 |     const isEmpty = await emptyState.isVisible().catch(() => false)
  111 | 
  112 |     // If empty state is visible, good; if not, table should exist but be empty
  113 |     if (isEmpty) {
  114 |       await expect(emptyState).toBeVisible()
  115 |     }
  116 |   })
  117 | 
  118 |   test('should respond to filter changes', async ({ page }) => {
  119 |     // Change multiple filters
  120 |     const searchBar = page.locator('input[placeholder*="Buscar"]')
  121 |     const dateInput = page.locator('input[type="date"]')
  122 | 
  123 |     await searchBar.fill('Equipo')
  124 |     await dateInput.fill('2024-02-01')
  125 | 
  126 |     // Verify both are set
  127 |     await expect(searchBar).toHaveValue('Equipo')
  128 |     await expect(dateInput).toHaveValue('2024-02-01')
  129 | 
  130 |     // Clear filters
  131 |     await searchBar.clear()
  132 |     await dateInput.clear()
  133 | 
  134 |     // Verify cleared
  135 |     await expect(searchBar).toHaveValue('')
  136 |     await expect(dateInput).toHaveValue('')
  137 |   })
  138 | 
  139 |   test('should display image column in table', async ({ page }) => {
  140 |     // Wait for table
> 141 |     await page.waitForSelector('table')
      |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  142 | 
  143 |     // Look for images
  144 |     const images = page.locator('img[alt*="equipo"]')
  145 | 
  146 |     // May or may not have images depending on data
  147 |     // Just verify no errors
  148 |     const imageCount = await images.count().catch(() => 0)
  149 |     expect(imageCount).toBeGreaterThanOrEqual(0)
  150 |   })
  151 | 
  152 |   test('should handle rapid filter changes', async ({ page }) => {
  153 |     const searchBar = page.locator('input[placeholder*="Buscar"]')
  154 |     const dateInput = page.locator('input[type="date"]')
  155 | 
  156 |     // Rapidly change filters
  157 |     for (let i = 0; i < 3; i++) {
  158 |       await searchBar.fill(`Test${i}`)
  159 |       await dateInput.fill('2024-01-01')
  160 |       await searchBar.clear()
  161 |       await dateInput.clear()
  162 |     }
  163 | 
  164 |     // Should not crash
  165 |     await expect(searchBar).toHaveValue('')
  166 |     await expect(dateInput).toHaveValue('')
  167 |   })
  168 | 
  169 |   test('should have accessible form elements', async ({ page }) => {
  170 |     // Check for labels or placeholders
  171 |     const searchBar = page.locator('input[placeholder*="Buscar"]')
  172 |     const dateInput = page.locator('input[type="date"]')
  173 | 
  174 |     // Both should be accessible
  175 |     await expect(searchBar).toBeVisible()
  176 |     await expect(dateInput).toBeVisible()
  177 | 
  178 |     // Should be focusable
  179 |     await searchBar.focus()
  180 |     await dateInput.focus()
  181 | 
  182 |     // Should work with keyboard
  183 |     await searchBar.type('test')
  184 |     await expect(searchBar).toHaveValue('test')
  185 |   })
  186 | 
  187 |   test('should maintain filter state on interactions', async ({ page }) => {
  188 |     const searchBar = page.locator('input[placeholder*="Buscar"]')
  189 | 
  190 |     // Set filter
  191 |     await searchBar.fill('Laptop')
  192 | 
  193 |     // Verify it persists
  194 |     await expect(searchBar).toHaveValue('Laptop')
  195 | 
  196 |     // Interact with page (click something)
  197 |     const pageSize = page.locator('select')
  198 |     await pageSize.click()
  199 | 
  200 |     // Filter should still be there
  201 |     await expect(searchBar).toHaveValue('Laptop')
  202 |   })
  203 | })
  204 | 
```