import { test, expect } from '@playwright/test'
import { attachDebugListeners } from './helpers/setup'

const BASE_URL = 'http://localhost:8080'

test.describe('Public Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(60000)
    page.setDefaultNavigationTimeout(60000)
    attachDebugListeners(page)
  })

  test.describe('Sign Up Page', () => {
    test('loads and displays the sign up form', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' })
      await expect(page.locator('#app')).toBeVisible()

      // Verify form fields are present
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
      await expect(page.getByLabel('Confirm password')).toBeVisible()
    })

    test('shows validation errors on empty form submission', async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' })

      // Click submit without filling anything
      await page.getByRole('button', { name: /sign up/i }).click()

      // Should show validation messages
      await expect(page.locator('body')).toContainText(/required/i)
    })

    test('has a link to sign in page', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' })

      // Find and click the "Sign In" link
      const signInButton = page.getByRole('button', { name: /sign in/i })
      await expect(signInButton).toBeVisible()
      await signInButton.click()

      await expect(page).toHaveURL(/\/signin/)
    })
  })

  test.describe('FAQ Page', () => {
    test('loads and displays FAQ content', async ({ page }) => {
      await page.goto(`${BASE_URL}/faq`, { waitUntil: 'networkidle' })
      await expect(page.locator('#app')).toBeVisible()

      // Verify main heading exists
      const heading = page.locator('h1')
      await expect(heading).toBeVisible()

      // Verify FAQ has multiple question sections (h2 elements)
      const questions = page.locator('.faq h2')
      await expect(questions).toHaveCount(9)
    })

    test('contains links to other pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/faq`, { waitUntil: 'networkidle' })

      // FAQ should link to privacy policy
      const privacyLink = page.locator('a[href="/privacy-policy"]')
      await expect(privacyLink).toBeVisible()

      // FAQ should link to help page
      const helpLink = page.locator('a[href="/help"]')
      await expect(helpLink).toBeVisible()
    })
  })

  test.describe('Terms of Service Page', () => {
    test('loads and displays all sections', async ({ page }) => {
      await page.goto(`${BASE_URL}/terms-of-service`, {
        waitUntil: 'networkidle',
      })
      await expect(page.locator('#app')).toBeVisible()

      // Verify main heading
      await expect(page.locator('h1')).toHaveText('Terms of Service')

      // Verify key sections exist
      const sections = page.locator('.terms-of-service h2')
      const expectedSections = [
        '1. Acceptance of Terms',
        '2. License',
        '3. User Responsibilities',
        '4. Contributions',
        '5. No Warranty',
        '6. Limitation of Liability',
        '7. Changes to These Terms',
        '8. Contact Us',
      ]

      await expect(sections).toHaveCount(expectedSections.length)

      for (const sectionTitle of expectedSections) {
        await expect(
          page.locator(`h2:has-text("${sectionTitle}")`),
        ).toBeVisible()
      }
    })
  })

  test.describe('Privacy Policy Page', () => {
    test('loads and displays all sections', async ({ page }) => {
      await page.goto(`${BASE_URL}/privacy-policy`, {
        waitUntil: 'networkidle',
      })
      await expect(page.locator('#app')).toBeVisible()

      // Verify main heading exists
      const heading = page.locator('h1')
      await expect(heading).toBeVisible()

      // Verify the page has multiple sections
      const sections = page.locator('.privacy-policy h2')
      await expect(sections).toHaveCount(8)
    })
  })

  test.describe('404 Page', () => {
    test('displays not found page for invalid routes', async ({ page }) => {
      await page.goto(`${BASE_URL}/this-page-does-not-exist`, {
        waitUntil: 'networkidle',
      })
      await expect(page.locator('#app')).toBeVisible()

      // The page should indicate the route was not found
      await expect(page.locator('body')).toContainText(/not found/i)
    })
  })
})
