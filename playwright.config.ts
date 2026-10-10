import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;

export default defineConfig({
  testDir: './e2e',
  // The smoke test reads live data from the Kitsu API, so allow for a slow response
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `bun run build && bun run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
});
