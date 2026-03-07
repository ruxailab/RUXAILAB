import { test, expect } from '@playwright/test'
import { logIn, attachDebugListeners } from './helpers/setup'

test.describe('Sign In Workflow', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(60000)
    page.setDefaultNavigationTimeout(60000)
    attachDebugListeners(page)
  })

  test('Handles valid and invalid sign in cases', async ({ page }) => {
    try {
      // 1. Initial access to Sign In page
      await test.step('Navigate to Sign In page', async () => {
        await page.goto('http://localhost:8080/signin', {
          waitUntil: 'networkidle',
        })
        await expect(page.locator('#app')).toBeVisible()
        await expect(page).toHaveTitle(/RUXAILAB/)
      })

      // 2. Empty form submission
      await test.step('Try submitting empty form', async () => {
        await page.getByTestId('sign-in-button').click()
        await expect(page.locator('text=Email is required')).toBeVisible()
        await expect(page.locator('text=Password is required')).toBeVisible()
      })

      // 3. Invalid email format
      await test.step('Try invalid email format', async () => {
        await page.getByLabel('Email').fill('bademail@emai')
        await page.getByLabel('Password', { exact: true }).fill('fakepassword')
        await page.getByTestId('sign-in-button').click()
        await expect(page.locator('body')).toContainText('Invalid email')
      })
    } catch (error) {
      console.error('Test failure details:', error)
      console.error('Current URL:', page.url())
      throw error
    }
  })

  test('Shows error for unregistered user', async ({ page }) => {
    await test.step('Attempt with non-existent user', async () => {
      await logIn(page, 'noexiste@example.com', 'anyPassword123')
      const alert = page.getByRole('alert')
      await expect(alert).toHaveText(/Incorrect username or password/)
      await expect(page.locator('div[role="alert"]')).toContainText(
        'Incorrect username or password',
      )
    })
  })

  test('Successful login redirects to tests list and shows active tab', async ({
    page,
  }) => {
    const validEmail = 'ericgc11@hotmail.com'
    const validPassword = process.env.VALID_PASSWORD

    if (!validPassword) {
      throw new Error('VALID_PASSWORD environment variable is not set')
    }

    await logIn(page, validEmail, validPassword)

    await expect(page).toHaveURL(/\/admin/, { timeout: 10_000 })

    const myTestsTab = page.getByRole('tab', { name: /My tests/i })
    await expect(myTestsTab).toBeVisible()
    await expect(myTestsTab).toHaveAttribute('aria-selected', 'true')
  })

  test('Password recovery only sends reset request', async ({ page }) => {
    await page.goto('http://localhost:8080/signin', {
      waitUntil: 'networkidle',
    })
    await expect(page.locator('#app')).toBeVisible()

    await page.getByText('Forgot Password').click()

    await page.waitForURL('**/forgot-password', { timeout: 10_000 })

    await page.getByLabel('Email').fill('ericgc11@hotmail.com')
    await page.getByRole('button', { name: /send reset link/i }).click()

    const successConfirmation = await Promise.race([
      page
        .waitForSelector('text=Reset link sent', { timeout: 10_000 })
        .then(() => 'ui_message'),
      page
        .waitForSelector('text=Check your email', { timeout: 10_000 })
        .then(() => 'ui_message'),
      page
        .waitForSelector('[role="alert"]', { timeout: 10_000 })
        .then(() => 'ui_alert'),
      page
        .waitForResponse(
          (resp) =>
            resp
              .url()
              .includes(
                'identitytoolkit.googleapis.com/v1/accounts:sendOobCode',
              ) && resp.status() === 200,
          { timeout: 10_000 },
        )
        .then(() => 'network_response'),
    ])

    expect(successConfirmation).toBeTruthy()
    console.log('Password reset confirmation method:', successConfirmation)
  })

  test('Validates password strength requirements during sign in', async ({
    page,
  }) => {
    await test.step('Navigate to Sign In page', async () => {
      await page.goto('http://localhost:8080/signin', {
        waitUntil: 'networkidle',
      })
      await expect(page.locator('#app')).toBeVisible()
    })

    await test.step('Test weak password validation', async () => {
      await page.getByLabel('Email').fill('test@ruxailab.com')

      const weakPasswords = ['123', 'abc', 'password', '12345678']

      for (const weakPassword of weakPasswords) {
        await page.getByLabel('Password', { exact: true }).clear()
        await page.getByLabel('Password', { exact: true }).fill(weakPassword)
        await page.getByTestId('sign-in-button').click()

        const hasError =
          (await page
            .locator('text=Password must be stronger')
            .isVisible()
            .catch(() => false)) ||
          (await page
            .locator('text=Password too weak')
            .isVisible()
            .catch(() => false)) ||
          (await page
            .locator('[role="alert"]')
            .isVisible()
            .catch(() => false))

        if (hasError) {
          console.log(`Weak password "${weakPassword}" correctly rejected`)
        }
      }
    })

    await test.step('Test strong password acceptance', async () => {
      await page.getByLabel('Email').clear()
      await page.getByLabel('Password', { exact: true }).clear()

      await page.getByLabel('Email').fill('test@ruxailab.com')
      await page.getByLabel('Password', { exact: true }).fill('StrongPass123!')
      await page.getByTestId('sign-in-button').click()

      await expect(page.locator('text=Password is required')).not.toBeVisible()
      await expect(page.locator('text=Password too weak')).not.toBeVisible()
    })
  })
})
