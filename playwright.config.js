// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,

  // A stray `test.only` would silently shrink the suite to one test while CI
  // reports green — make it fail the build instead.
  forbidOnly: !!process.env.CI,

  // Deterministic runs: the suite carries one known-failing test (TODO-1042,
  // see docs/BUG_REPORT_TEMPLATE.md), marked test.fail() at its definition
  // so that documented upstream defect is an EXPECTED failure rather than a
  // permanently red build. Retries would just run the documented bug twice.
  retries: 0,

  // Fail-fast intentionally NOT configured (no maxFailures): the cross-browser
  // matrix exists to ISOLATE browser-specific defects, not mask them behind an
  // early abort.

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'https://demo.playwright.dev/todomvc/',
    // Debugging artifacts only when something breaks — green runs stay lean.
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
