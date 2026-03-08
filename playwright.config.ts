import { defineConfig, devices, PlaywrightTestOptions } from '@playwright/test'

/**
 * Shared base options spread into every project's `use` block.
 * Centralising baseURL here means it is defined exactly once — the single
 * source of truth that SonarCloud duplication analysis checks against.
 *
 * Override at runtime:
 *   BASE_URL=https://staging.example.com npx playwright test
 */
const baseUse: Partial<PlaywrightTestOptions> = {
  baseURL: process.env.BASE_URL || 'http://localhost:8080',
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  /* Global settings inherited by all projects. */
  use: {
    ...baseUse,
    video: 'on',
    trace: 'on-first-retry',
  },

  /* Each project spreads baseUse explicitly so baseURL is present even if
     Playwright's merge order ever changes in a future version. */
  projects: [
    {
      name: 'chromium',
      use: { ...baseUse, ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...baseUse, ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...baseUse, ...devices['Desktop Safari'] },
    },
  ],
})
