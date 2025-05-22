import { test, expect } from '@playwright/test';

const logIn = async (page) => {
  await test.step('Navigate to signin page', async () => {
    await page.goto('http://localhost:8080/signin', { waitUntil: 'networkidle' });
  });

  await test.step('Fill login credentials', async () => {
    await page.getByLabel('Email').fill('testemail@gmail.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');
  });

  await test.step('Click "Sign In" button', async () => {
    await page.getByTestId('sign-in-button').click();
  });
};

test.describe('Heuristic Test Case: Creation Scenarios', () => {
  test('Create test successfully', async ({ page }) => {
    await logIn(page);

    await test.step('Create full heuristic test', async () => {
      await page.getByTestId('create-test-btn').click();
      await page.getByText('Create a blank test to begin').click();
      await page.getByText('Inspection').click();
      await page.getByText('Usability Heuristic').click();

      const testName = 'Test successful';

      await page.getByLabel('Test Name').fill(testName);
      await page.getByLabel('Test Description').fill('This is the description for the test successful');

      await page.getByRole('dialog').getByRole('button').nth(1).click();
      await expect(page.locator('p', { hasText: testName })).toBeVisible({ timeout: 5000 });
      await page.locator('p').filter({ hasText: testName }).click();
    });
  });

  test('Create test without description', async ({ page }) => {
    await logIn(page);

    await test.step('Missing description', async () => {
      await page.getByTestId('create-test-btn').click();
      await page.getByText('Create a blank test Create a').click();
      await page.getByText('Inspection').click();
      await page.getByText('Usability Heuristic').click();

      const testName = 'Test without description';

      await page.getByLabel('Test Name').fill(testName);

      await page.getByRole('dialog').getByRole('button').nth(1).click();
      await expect(page.locator('p', { hasText: testName })).toBeVisible({ timeout: 5000 });
      await page.locator('p').filter({ hasText: testName }).click();
    });
  });

  test('Create test without name', async ({ page }) => {
    await logIn(page);

    await test.step('Missing name', async () => {
      await page.getByTestId('create-test-btn').click();
      await page.getByText('Create a blank test Create a').click();
      await page.getByText('Inspection').click();
      await page.getByText('Usability Heuristic').click();

      await page.getByLabel('Test Description').fill('Test without name');

      await page.getByRole('dialog').getByRole('button').nth(1).click();
      await expect(page.getByText('Enter a Title')).toBeVisible();
    });
  });

  test('Create test with neither name nor description', async ({ page }) => {
    await logIn(page);

    await test.step('Missing both fields', async () => {
      await page.getByTestId('create-test-btn').click();
      await page.getByText('Create a blank test Create a').click();
      await page.getByText('Inspection').click();
      await page.getByText('Usability Heuristic').click();

      await page.getByRole('dialog').getByRole('button').nth(1).click();
      await expect(page.getByText('Enter a Title')).toBeVisible();
    });
  });

  test('Create public test with all fields filled', async ({ page }) => {
    await logIn(page);

    await test.step('Public test creation', async () => {
      await page.getByTestId('create-test-btn').click();
      await page.getByText('Create a blank test to begin').click();
      await page.getByText('Category').nth(1).click();
      await page.getByText('Test', { exact: true }).first().click();

      const testName = 'Public test';

      await page.getByLabel('Test Name').fill(testName);
      await page.getByLabel('Test Description').fill('This is the description for the public test');
      await page.locator('.v-input--selection-controls__ripple').click();

      await page.getByRole('dialog').getByRole('button').nth(1).click();
      await expect(page.locator('p', { hasText: testName })).toBeVisible({ timeout: 5000 });
      await page.locator('p').filter({ hasText: testName }).click();
    });
  });
});
