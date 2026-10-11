import { defineConfig } from '@playwright/test';
import { readFileSync } from 'node:fs';
const environment = JSON.parse(readFileSync(new URL('./visual-tests/environment.json', import.meta.url)));
const probe = process.env.VISUAL_DIFF_PROBE === '1';
const results = probe ? 'test-results-probe' : 'test-results';
if (process.env.CI && process.argv.some(arg => arg.startsWith('--update-snapshots'))) throw new Error('CI cannot accept baseline updates.');
export default defineConfig({
  testDir: './visual-tests', testMatch: '**/*.spec.js', fullyParallel: true,
  workers: 2, retries: 0, timeout: 30000, forbidOnly: !!process.env.CI,
  updateSnapshots: 'none', snapshotPathTemplate: '{testDir}/../docs/design/baselines/{projectName}/{arg}{ext}',
  outputDir: results,
  globalSetup: './visual-tests/metadata.js',
  reporter: [['line'], ...(process.env.CI && !probe ? [['github']] : []), ['html', { open: 'never', outputFolder: probe ? 'playwright-probe-report' : 'playwright-report' }], ['json', { outputFile: `${results}/results.json` }]],
  expect: { timeout: 5000, toHaveScreenshot: { maxDiffPixels: environment.maxDiffPixels, threshold: 0, animations: 'disabled', caret: 'hide', scale: 'css' } },
  use: { baseURL: 'http://127.0.0.1:4175', viewport: environment.viewport, deviceScaleFactor: environment.deviceScaleFactor,
    locale: environment.locale, timezoneId: environment.timezoneId, colorScheme: 'dark', contextOptions: { reducedMotion: 'reduce' },
    serviceWorkers: 'block', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }, { name: 'webkit', use: { browserName: 'webkit' } }],
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4175 --strictPort', url: 'http://127.0.0.1:4175', reuseExistingServer: false, timeout: 20000 },
});
