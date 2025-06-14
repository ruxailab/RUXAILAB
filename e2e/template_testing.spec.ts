import { test, expect } from '@playwright/test';

test('should create a template and verify it appears in the list', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByLabel('Email').fill('dfa@dfa.com');
  await page.getByLabel('Password', { exact: true }).fill('Password@123');
  await page.getByTestId('sign-in-button').click();
  // Removed "Go to Console" lines
  await page.getByRole('tab', { name: 'Templates' }).click();
  await page.getByRole('tab', { name: 'Personal' }).click();
  await page.getByTestId('create-test-btn').click();
  await page.getByText('Create a blank test', { exact: true }).click();
  await page.getByText('Testing', { exact: true }).click();
  await page.getByText('Webcam, audio & screen record').click();
  await page.getByLabel('Test Name').click();
  await page.getByLabel('Test Name').fill('test');
  await page.getByLabel('Test Description').click();
  await page.getByLabel('Test Description').fill('test');
  await page.getByRole('dialog').getByRole('button').nth(1).click();
  await page.getByText('Unmoderated').click();
  await page.locator('div:nth-child(16) > .v-list-item__icon > .v-icon').click();
  await page.locator('.dataCard > div > button').click();
  await page.getByRole('button', { name: 'Return to Console' }).click();
  await page.getByRole('button', { name: 'buttons.saveandleave' }).nth(1).click();
  await page.getByRole('tab', { name: 'Templates' }).click();
});

test('should show error when creating a template with duplicate name', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByLabel('Email').fill('dfa@dfa.com');
  await page.getByLabel('Password', { exact: true }).fill('Password@123');
  await page.getByTestId('sign-in-button').click();
  await page.getByRole('tab', { name: 'Templates' }).click();
  await page.getByRole('tab', { name: 'Personal' }).click();
  await page.getByTestId('create-test-btn').click();
  await page.getByText('Create a blank test', { exact: true }).click();
  await page.getByText('Testing', { exact: true }).click();
  await page.getByText('Webcam, audio & screen record').click();
  await page.getByLabel('Test Name').fill('test');
  await page.getByLabel('Test Description').fill('test');
  await page.getByRole('dialog').getByRole('button').nth(1).click();
  // Expect error message for duplicate name
  await expect(page.getByText(/already exists|duplicate/i)).toBeVisible();
});

test('should validate required fields when creating a template', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByLabel('Email').fill('dfa@dfa.com');
  await page.getByLabel('Password', { exact: true }).fill('Password@123');
  await page.getByTestId('sign-in-button').click();
  await page.getByRole('tab', { name: 'Templates' }).click();
  await page.getByRole('tab', { name: 'Personal' }).click();
  await page.getByTestId('create-test-btn').click();
  await page.getByText('Create a blank test', { exact: true }).click();
  await page.getByText('Testing', { exact: true }).click();
  await page.getByText('Webcam, audio & screen record').click();
  // Leave Test Name empty
  await page.getByLabel('Test Description').fill('test');
  await page.getByRole('dialog').getByRole('button').nth(1).click();
  await expect(page.getByText(/required|enter a name/i)).toBeVisible();
});

test('should filter templates by name', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByLabel('Email').fill('dfa@dfa.com');
  await page.getByLabel('Password', { exact: true }).fill('Password@123');
  await page.getByTestId('sign-in-button').click();
  await page.getByRole('tab', { name: 'Templates' }).click();
  await page.getByRole('tab', { name: 'Personal' }).click();
  // Assume there is a search/filter input for templates
  await page.getByPlaceholder('Search templates').fill('test');
  await expect(page.getByText('test')).toBeVisible();
});

test('should not allow saving template with empty description', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByLabel('Email').fill('dfa@dfa.com');
  await page.getByLabel('Password', { exact: true }).fill('Password@123');
  await page.getByTestId('sign-in-button').click();
  await page.getByRole('tab', { name: 'Templates' }).click();
  await page.getByRole('tab', { name: 'Personal' }).click();
  await page.getByTestId('create-test-btn').click();
  await page.getByText('Create a blank test', { exact: true }).click();
  await page.getByText('Testing', { exact: true }).click();
  await page.getByText('Webcam, audio & screen record').click();
  await page.getByLabel('Test Name').fill('test-empty-desc');
  // Leave Test Description empty
  await page.getByRole('dialog').getByRole('button').nth(1).click();
  await expect(page.getByText(/required|enter a description/i)).toBeVisible();
});


