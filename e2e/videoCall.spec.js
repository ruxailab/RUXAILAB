import { test, expect } from '@playwright/test';

const logIn = async (page) => {
    await test.step('Login as Admin', async () => {
        await page.goto('http://localhost:8080/signin', { waitUntil: 'networkidle' });
        await page.getByLabel('Email').fill('testemail@gmail.com');
        await page.getByLabel('Password', { exact: true }).fill('password123');
        await page.getByTestId('sign-in-button').click();
        await expect(page.getByTestId('create-test-btn')).toBeVisible({ timeout: 10000 });
    });
};

const createModeratedTest = async (page, testName) => {
    await test.step('Navigate to Create Test Wizard', async () => {
        await page.getByTestId('create-test-btn').click();
        await page.getByText('Create a blank test', { exact: true }).click();
    });

    await test.step('Select Moderated User Test', async () => {
        await page.getByText('User Testing').click();
        await page.getByText('Moderated Usability Test').click();
    });

    await test.step('Fill Test Basic Info', async () => {
        await page.getByLabel('Test Name').fill(testName);
        await page.getByLabel('Test Description').fill('E2E Safety Net Test for VideoCall Refactor');
        await page.getByRole('dialog').getByRole('button').nth(1).click();
    });

    await test.step('Wait for Test Dashboard', async () => {
        await expect(page.locator('p', { hasText: testName })).toBeVisible();
        await page.locator('p').filter({ hasText: testName }).click();
    });
};

test.describe('VideoCall Component Safety Net', () => {

    // Grant permissions to avoid browser prompts
    test.use({
        permissions: ['camera', 'microphone'],
        launchOptions: {
            args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
        },
    });

    test.beforeEach(async ({ page }) => {
        await logIn(page);
    });

    test('Moderated Test mounts VideoCall component correctly', async ({ page }) => {
        const testName = `VideoRefactor Safety Check ${Date.now()}`;

        await createModeratedTest(page, testName);

        const url = page.url();
        const testId = url.split('/').pop();
        const testViewUrl = `http://localhost:8080/testview/${testId}`;

        await page.goto(testViewUrl);

        await test.step('Verify VideoCall component is present', async () => {
            const startButton = page.getByRole('button', { name: 'Start Test' });
            if (await startButton.isVisible()) {
                await startButton.click();
            }

            await expect(page.locator('video').first()).toBeVisible({ timeout: 15000 });
            await expect(page.locator('.mdi-microphone').first()).toBeVisible();
        });
    });
});
