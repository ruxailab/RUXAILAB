import { defineConfig, devices, PlaywrightTestOptions } from '@playwright/test'

/**
 * Shared base options spread into the global use block and every project.
 * Defined once here — the single source of truth that SonarCloud checks.
 *
 * Override at runtime:
 *   BASE_URL=https://staging.example.com npx playwright test
 */
const baseUse: Partial<PlaywrightTestOptions> = {
  baseURL: process.env.BASE_URL || 'http://localhost:8080',
}

/**
 * Browser matrix: [projectName, deviceDescriptor]
 * Add or remove rows here to change which browsers are tested — no repetition
 * of the project-object shape needed.
 */
const browserProjects: [string, (typeof devices)[string]][] = [
  ['chromium', devices['Desktop Chrome']],
  ['firefox',  devices['Desktop Firefox']],
  ['webkit',   devices['Desktop Safari']],
]

/** See https://playwright.dev/docs/test-configuration. */
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

  /* Projects are generated from the matrix above — the use-block shape
     is written once in the map callback rather than repeated per browser. */
  projects: browserProjects.map(([name, device]) => ({
    name,
    use: { ...baseUse, ...device },
  })),
})
