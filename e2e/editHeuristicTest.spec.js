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
    await expect(page.getByTestId('create-test-btn')).toBeVisible({ timeout: 7000 });
  });
};

const navigateToTest = async (page, testName) => {
  await test.step(`Navigate to test "${testName}"`, async () => {
    await page.goto('http://localhost:8080/tests');
    await page.locator('p').filter({ hasText: testName }).click();
  });
};

const editTest = async (page, { name, description }) => {
  await test.step('Click edit button', async () => {
    await page.getByTestId('edit-test-button').click();
  });

  await test.step('Update title and description', async () => {
    await page.getByLabel('Test Name').fill(name);
    await page.getByLabel('Test Description').fill(description);
  });

  await test.step('Save changes', async () => {
    await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });
};

test.describe('Heuristic Test Case: Editing Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await logIn(page);
  });

  test('Edit an existing heuristic test successfully', async ({ page }) => {
    const existingTestName = 'Test successful';
    const updatedTestName = 'Test edited name';
    const updatedDescription = 'Updated description for heuristic test.';

    await navigateToTest(page, existingTestName);
    await editTest(page, { name: updatedTestName, description: updatedDescription });

    await test.step('Verify changes persisted', async () => {
      await expect(page.locator('p')).toContainText(updatedTestName);
      await expect(page.locator('p')).toContainText(updatedDescription);
    });
  });
});
