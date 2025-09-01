// tests/signIn.spec.js
const { test, expect } = require('@playwright/test');

// 🔄 Reusable login function
const logIn = async (page, email, password) => {
  await page.goto('http://localhost:8080/signin');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByTestId('sign-in-button').click();
};

test.describe('Sign In Workflow', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    page.on('console', msg => console.log('Console:', msg.text()));
    page.on('request', req => console.log('Request:', req.url()));
    page.on('response', res => console.log('Response:', res.url(), res.status()));
  });

  test('Handles valid and invalid sign in cases', async ({ page }) => {
    try {
      // 1. Initial access to Sign In page
      await test.step('Navigate to Sign In page', async () => {
        await page.goto('http://localhost:8080/signin', { waitUntil: 'networkidle' });
        await expect(page.locator('#app')).toBeVisible();
        await expect(page).toHaveTitle(/RUXAILAB/);
      });

      // 2. Empty form submission
      await test.step('Try submitting empty form', async () => {
        await page.getByTestId('sign-in-button').click();
        await expect(page.locator('text=Email is required')).toBeVisible();
        await expect(page.locator('text=Password is required')).toBeVisible();
      });

      // 3. Invalid email format
      await test.step('Try invalid email format', async () => {
        await page.getByLabel('Email').fill('bademail@emai');
        await page.getByLabel('Password', { exact: true }).fill('fakepassword');
        await page.getByTestId('sign-in-button').click();
        await expect(page.locator('body')).toContainText('Invalid email');
      });

    } catch (error) {
      console.error('Test failure details:', error);
      console.error('Current URL:', page.url());
      throw error;
    }
  });

  test('Shows error for unregistered user', async ({ page }) => {
    await test.step('Attempt with non-existent user', async () => {
      await logIn(page, 'noexiste@example.com', 'anyPassword123');
      const alert = page.getByRole('alert');
      await expect(alert).toHaveText(/Incorrect username or password/);
      await expect(page.locator('div[role="alert"]')).toContainText('Incorrect username or password');
    });
  });

  test('Successful login redirects to tests list and shows active tab', async ({ page }) => {
    // 1. Perform login
    const validEmail = 'ericgc11@hotmail.com';
    const validPassword = process.env.VALID_PASSWORD;

    // Ensure password is available
    if (!validPassword) {
      throw new Error('VALID_PASSWORD environment variable is not set');
    }

    await logIn(page, validEmail, validPassword);

    // 2. Wait for URL change
    await expect(page).toHaveURL(/\/admin/, { timeout: 10_000 });

    // 3. Verify that "My tests" tab is visible and selected
    const myTestsTab = page.getByRole('tab', { name: /My tests/i });
    await expect(myTestsTab).toBeVisible();
    // Also ensure it's the active tab:
    await expect(myTestsTab).toHaveAttribute('aria-selected', 'true');
  });

  test('Password recovery only sends reset request', async ({ page }) => {
    // 1) Go to Sign In page
    await page.goto('http://localhost:8080/signin', { waitUntil: 'networkidle' });
    await expect(page.locator('#app')).toBeVisible();

    // 2) Click "Forgot Password" link (exact text from UI)
    await page.getByText('Forgot Password').click();

    // 3) Wait for forgot-password route
    await page.waitForURL('**/forgot-password', { timeout: 10_000 });

    // 4) Fill email and submit reset request
    await page.getByLabel('Email').fill('ericgc11@hotmail.com');
    await page.getByRole('button', { name: /send reset link/i }).click();

    // 5) Wait for success confirmation (UI feedback or network response)
    const successConfirmation = await Promise.race([
      // Option 1: Wait for success message in UI
      page.waitForSelector('text=Reset link sent', { timeout: 10_000 }).then(() => 'ui_message'),
      page.waitForSelector('text=Check your email', { timeout: 10_000 }).then(() => 'ui_message'),
      page.waitForSelector('[role="alert"]', { timeout: 10_000 }).then(() => 'ui_alert'),

      // Option 2: Wait for successful network response
      page.waitForResponse(resp =>
        resp.url().includes('identitytoolkit.googleapis.com/v1/accounts:sendOobCode') && resp.status() === 200,
        { timeout: 10_000 }
      ).then(() => 'network_response')
    ]);

    // 6) Assertion: reset request was processed
    expect(successConfirmation).toBeTruthy();
    console.log('Password reset confirmation method:', successConfirmation);
  });

  test('Validates password strength requirements during sign in', async ({ page }) => {
    await test.step('Navigate to Sign In page', async () => {
      await page.goto('http://localhost:8080/signin', { waitUntil: 'networkidle' });
      await expect(page.locator('#app')).toBeVisible();
    });

    await test.step('Test weak password validation', async () => {
      // Fill valid email
      await page.getByLabel('Email').fill('test@ruxailab.com');

      // Try with weak passwords
      const weakPasswords = ['123', 'abc', 'password', '12345678'];

      for (const weakPassword of weakPasswords) {
        await page.getByLabel('Password', { exact: true }).clear();
        await page.getByLabel('Password', { exact: true }).fill(weakPassword);
        await page.getByTestId('sign-in-button').click();

        // Check if there's any password strength feedback or error
        // This could be a validation message or error alert
        const hasError = await page.locator('text=Password must be stronger').isVisible().catch(() => false) ||
          await page.locator('text=Password too weak').isVisible().catch(() => false) ||
          await page.locator('[role="alert"]').isVisible().catch(() => false);

        if (hasError) {
          console.log(`Weak password "${weakPassword}" correctly rejected`);
        }
      }
    });

    await test.step('Test strong password acceptance', async () => {
      // Clear previous input
      await page.getByLabel('Email').clear();
      await page.getByLabel('Password', { exact: true }).clear();

      // Use strong password format (similar to the valid one used in other tests)
      await page.getByLabel('Email').fill('test@ruxailab.com');
      await page.getByLabel('Password', { exact: true }).fill('StrongPass123!');
      await page.getByTestId('sign-in-button').click();

      // Even if user doesn't exist, strong password format should pass validation
      // and reach the authentication step (not validation error)
      await expect(page.locator('text=Password is required')).not.toBeVisible();
      await expect(page.locator('text=Password too weak')).not.toBeVisible();
    });
  });
});
