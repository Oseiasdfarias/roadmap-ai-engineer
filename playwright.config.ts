import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: 'http://localhost:4322/roadmap-ai-engineer/',
    channel: 'chrome',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4322 --ignore-lock',
    url: 'http://localhost:4322/roadmap-ai-engineer/',
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
