// @ts-check
const { defineConfig, devices } = require('@playwright/test')

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
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Create a screenshot if a test fails */
    screenshot: { mode: 'only-on-failure', fullPage: true },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-dev',
      use: {
        baseURL: 'https://ruxailab-dev.web.app/',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'chromium-prod',
      use: {
        baseURL: 'https://ruxailab-prod.web.app/',
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox-dev',
      use: {
        baseURL: 'https://ruxailab-dev.web.app/',
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'firefox-prod',
      use: {
        baseURL: 'https://ruxailab-prod.web.app/',
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit-dev',
      use: {
        baseURL: 'https://ruxailab-dev.web.app/',
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'webkit-prod',
      use: {
        baseURL: 'https://ruxailab-prod.web.app/',
        ...devices['Desktop Safari'],
      },
    },
  ],
})
