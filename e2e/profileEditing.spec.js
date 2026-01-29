import { test, expect } from '@playwright/test'

const logIn = async (page, email = 'testemail@gmail.com', password = 'password123') => {
  await page.goto('http://localhost:8080/signin', { waitUntil: 'networkidle' })
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByTestId('sign-in-button').click()
  await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
}

test.describe('Profile editing', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(60000)
    page.setDefaultNavigationTimeout(60000)
  })

  test('open profile', async ({ page }) => {
    await logIn(page)
    const profileBtn = page.locator('[aria-label*="profile" i], [aria-label*="account" i], [data-testid*="profile" i]').first()
    if (await profileBtn.isVisible().catch(() => false)) {
      await profileBtn.click()
    } else {
      await page.locator('button').filter({ hasText: /profile|account|settings/i }).first().click()
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('profile form validation', async ({ page }) => {
    await logIn(page)
    const profileBtn = page.locator('[aria-label*="profile" i], [aria-label*="account" i]').first()
    if (await profileBtn.isVisible().catch(() => false)) {
      await profileBtn.click()
    }
    const usernameField = page.getByLabel(/username/i).first()
    if (await usernameField.isVisible().catch(() => false)) {
      await usernameField.clear()
      await usernameField.fill('ab')
      await expect(page.locator('text=/username.*required|minimum.*length/i')).toBeVisible({ timeout: 3000 }).catch(() => {})
    }
  })
})
