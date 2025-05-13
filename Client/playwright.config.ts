import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Paths are relative to the config file
const e2eDir = './src/e2e';
const authDir = path.join(e2eDir, '.auth');
const testResultsDir = path.join(e2eDir, 'test-results');

export default defineConfig({
  testDir: e2eDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  outputDir: testResultsDir,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Add more debugging options
    actionTimeout: 15000,
    navigationTimeout: 15000,
    // Enable debugging
    launchOptions: {
      slowMo: 100,
      devtools: true,
    },
  },
  projects: [
    // Setup project
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use auth state from e2e folder
        storageState: path.join(authDir, 'user.json'),
        // Add viewport size
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev:e2e',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
}); 