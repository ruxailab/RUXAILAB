import { test, expect } from '@playwright/test'

const logIn = async (page, email = 'testemail@gmail.com', password = 'password123') => {
  await page.goto('http://localhost:8080/signin', { waitUntil: 'networkidle' })
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByTestId('sign-in-button').click()
  await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
}

test.describe('User Test Creation', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(60000)
    page.setDefaultNavigationTimeout(60000)
  })

  test('create user test', async ({ page }) => {
    await logIn(page)
    await page.getByTestId('create-test-btn').click()
    await page.getByText('Create a blank test', { exact: true }).click()
    await page.locator('.card').filter({ hasText: /usability|user test/i }).first().click()

    const testName = `E2E Test ${Date.now()}`
    await page.getByLabel('Test Name').fill(testName)
    await page.getByLabel('Test Description').fill('E2E test description for user test')
    await page.getByRole('dialog').getByRole('button').nth(1).click()
    await expect(page).toHaveURL(/\/edit/, { timeout: 15000 })
  })

  test('validation when test name missing', async ({ page }) => {
    await logIn(page)
    await page.getByTestId('create-test-btn').click()
    await page.getByText('Create a blank test', { exact: true }).click()
    await page.locator('.card').filter({ hasText: /usability|user test/i }).first().click()
    await page.getByLabel('Test Description').fill('Description without name')
    await page.getByRole('dialog').getByRole('button').nth(1).click()
    await expect(page.getByText('Enter a Title')).toBeVisible({ timeout: 5000 })
  })

  test('create with only name', async ({ page }) => {
    await logIn(page)
    await page.getByTestId('create-test-btn').click()
    await page.getByText('Create a blank test', { exact: true }).click()
    await page.locator('.card').filter({ hasText: /usability|user test/i }).first().click()
    const testName = `E2E Test Name Only ${Date.now()}`
    await page.getByLabel('Test Name').fill(testName)
    await page.getByRole('dialog').getByRole('button').nth(1).click()
    await expect(page).toHaveURL(/\/edit/, { timeout: 15000 })
  })
})
