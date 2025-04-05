// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const devBaseUrl = process.env.BASE_URL || 'http://localhost:8080'; // Allows dynamic override

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [['html', { open: 'never' }], ['list']], // Multi-reporter setup

  outputDir: './playwright/output',

  use: {
    baseURL: devBaseUrl,
    ...devices['Desktop Chrome'],
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    video: 'retain-on-failure', // Optional: keep videos for debugging
    headless: true, // Optional: force headless
    viewport: { width: 1280, height: 720 }, // Consistent viewport
  },

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

  webServer: {
    command: 'npm run dev', // Optional: auto-launch server before tests
    port: 8080,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});

