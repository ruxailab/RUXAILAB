// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Output directory for screenshots of failed tests */
  outputDir: './playwright/output',

  use: {
    /* Base URL so relative paths like page.goto('/signin') resolve correctly.
       Override by setting BASE_URL env var, e.g. BASE_URL=https://staging.example.com */
    baseURL: process.env.BASE_URL || 'http://localhost:8080',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Create a screenshot if a test fails */
    screenshot: { mode: 'only-on-failure', fullPage: true },

    /* Set global timeout for actions (e.g., click, fill) */
    actionTimeout: 10000,

    /* Set global timeout for navigation */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers.
     Each project inherits the global `use` block (including baseURL) and adds
     its own device-specific viewport / userAgent settings. */
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
});
