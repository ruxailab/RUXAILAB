import { type Page } from '@playwright/test'

/**
 * Logs in to the application with the given credentials.
 * Navigates to the sign-in page, fills in email and password, and clicks the sign-in button.
 */
export const logIn = async (
  page: Page,
  email: string,
  password: string,
): Promise<void> => {
  await page.goto('http://localhost:8080/signin')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByTestId('sign-in-button').click()
}

/**
 * Attaches console, request and response listeners for debugging.
 * Useful in beforeEach hooks to trace test failures.
 */
export const attachDebugListeners = (page: Page): void => {
  page.on('console', (msg) => console.log('Console:', msg.text()))
  page.on('request', (req) => console.log('Request:', req.url()))
  page.on('response', (res) =>
    console.log('Response:', res.url(), res.status()),
  )
}
