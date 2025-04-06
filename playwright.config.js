// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const devBaseUrl = process.env.BASE_URL || 'http://localhost:8080';

/**
 * Playwright Configuration
 * Docs: https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,

  // Fail if test.only is used accidentally in CI
  forbidOnly: !!process.env.CI,

  // Retry strategy
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporters: HTML report saved silently, plus CLI list
  reporter: [['html', { open: 'never' }], ['list']],

  // Artifacts output directory
  outputDir: './playwright/output',

  use: {
    baseURL: devBaseUrl,
    ...devices['Desktop Chrome'],
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    viewport: { width: 1280, height: 720 },
  },

  // Multi-browser setup
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Optional: auto-start dev server
  webServer: {
    command: 'npm run dev',
    port: 8080,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
