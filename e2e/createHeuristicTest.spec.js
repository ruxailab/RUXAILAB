import { test, expect } from '@playwright/test';

// --- Reusable login function ---
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
    await expect(page.getByTestId('create-test-btn')).toBeVisible({ timeout: 7000 });
  });
};

// --- Navigate to heuristic form ---
const navigateToHeuristicTestForm = async (page, useCategoryFlow = false) => {
  await page.getByTestId('create-test-btn').click();
  if (useCategoryFlow) {
    await page.getByText('Create a blank test to begin').click();
    await page.getByText('Category').nth(1).click();
    await page.getByText('Test', { exact: true }).first().click();
  } else {
    await page.getByText('Create a blank test', { exact: true }).click();
    await page.getByText('Inspection').click();
    await page.getByText('Usability Heuristic').click();
  }
};

// --- Fill test form ---
const fillTestForm = async (page, testName = '', testDescription = '', isPublic = false) => {
  if (testName) await page.getByLabel('Test Name').fill(testName);
  if (testDescription) await page.getByLabel('Test Description').fill(testDescription);
  if (isPublic) await page.locator('.v-input--selection-controls__ripple').click();
};

test.describe('Heuristic Test Case: Creation Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await logIn(page);
  });

  test('Create test successfully', async ({ page }) => {
    const testName = 'Test successful';

    await test.step('Create full heuristic test', async () => {
      await navigateToHeuristicTestForm(page);
      await fillTestForm(page, testName, 'This is the description for the test successful');
      await page.getByRole('dialog').getByRole('button').nth(1).click();
      await expect(page.locator('p', { hasText: testName })).toBeVisible();
      await page.locator('p').filter({ hasText: testName }).click();
    });
  });

  test('Create test without description', async ({ page }) => {
    const testName = 'Test without description';

    await test.step('Missing description', async () => {
      await navigateToHeuristicTestForm(page);
      await fillTestForm(page, testName);
      await page.getByRole('dialog').getByRole('button').nth(1).click();
      await expect(page.locator('p', { hasText: testName })).toBeVisible();
      await page.locator('p').filter({ hasText: testName }).click();
    });
  });

  test('Create test without name', async ({ page }) => {
    await test.step('Missing name', async () => {
      await navigateToHeuristicTestForm(page);
      await fillTestForm(page, '', 'Test without name');
      await page.getByRole('dialog').getByRole('button').nth(1).click();
      await expect(page.getByText('Enter a Title')).toBeVisible();
    });
  });

  test('Create test with neither name nor description', async ({ page }) => {
    await test.step('Missing both fields', async () => {
      await navigateToHeuristicTestForm(page);
      await fillTestForm(page);
      await page.getByRole('dialog').getByRole('button').nth(1).click();
      await expect(page.getByText('Enter a Title')).toBeVisible();
    });
  });

  test('Create public test with all fields filled', async ({ page }) => {
    const testName = 'Public test';

    await test.step('Public test creation', async () => {
      await navigateToHeuristicTestForm(page, true);
      await fillTestForm(page, testName, 'This is the description for the public test', true);
      await page.getByRole('dialog').getByRole('button').nth(1).click();
      await expect(page.locator('p', { hasText: testName })).toBeVisible();
      await page.locator('p').filter({ hasText: testName }).click();
    });
  });
});

