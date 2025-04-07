// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// Define environment base URLs
const ENV = process.env.ENV || 'local';
const baseUrls = {
  local: 'http://localhost:8080',
  staging: 'https://staging.movieflix.com',
  production: 'https://movieflix.com',
};
const baseURL = baseUrls[ENV];

/**
 * Playwright Test Configuration
 * Documentation: https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './e2e',             // Directory for test files
  fullyParallel: true,          // Run tests in parallel

  // CI-safe configuration
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporters: HTML + CLI
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  // Output directory for test artifacts
  outputDir: './playwright/output',

  use: {
    baseURL,
    ...devices['Desktop Chrome'],
    headless: true,             // Headless mode
    trace: 'on-first-retry',    // Enable trace on first retry
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,       // 10s timeout per action
    navigationTimeout: 30000,   // 30s navigation timeout
    viewport: { width: 1280, height: 720 },
  },

  // Run tests in multiple browsers
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

  // Dev server startup (optional for local runs)
  webServer: {
    command: 'npm run dev',
    port: 8080,
    timeout: 120000, // 2 minutes
    reuseExistingServer: !process.env.CI,
  },
});
