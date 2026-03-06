const { test, expect } = require('@playwright/test')

test.describe('Link Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(60000)
    page.setDefaultNavigationTimeout(60000)

    page.on('console', (msg) => console.log('Console:', msg.text()))
    page.on('request', (req) => console.log('Request:', req.url()))
    page.on('response', (res) =>
      console.log('Response:', res.url(), res.status()),
    )
  })

  test('has link page', async ({ page }) => {
    try {
      await test.step('Navigate to signin page', async () => {
        await page.goto('http://localhost:8080/signin', {
          waitUntil: 'networkidle',
          timeout: 45000,
        })
      })

      await test.step('Check if #app is visible', async () => {
        await expect(page.locator('#app')).toBeVisible({ timeout: 30000 })
      })

      await test.step('Check page title', async () => {
        await expect(page).toHaveTitle(/RUXAILAB/, { timeout: 30000 })
      })

      await page.screenshot({
        path: 'debug-screenshot.png',
        fullPage: true,
      })
    } catch (error) {
      console.error('Test failure details:', error)
      console.error('Current URL:', page.url())
      throw error
    }
  })
})
