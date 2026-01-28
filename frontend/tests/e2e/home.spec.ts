// tests/e2e/home.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load and display title', async ({ page }) => {
    await page.goto('/')
    
    // Verificar que carga
    await expect(page).toHaveTitle(/SimRacing Shop/i)
    
    // Verificar que hay un heading
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
  })

  test('should navigate to products', async ({ page }) => {
    await page.goto('/')
    
    // Click en link de productos
    await page.getByRole('link', { name: /productos/i }).click()
    
    // Verificar que llegamos a la página de productos
    await expect(page).toHaveURL(/\/productos/)
  })
})