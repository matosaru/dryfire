import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const library = readFileSync(new URL('./fixtures/library.json', import.meta.url));

test('About is available before setup without capture or safety acknowledgement', async ({ page }) => {
  await page.addInitScript(() => {
    window.__aboutMicrophoneRequests = 0;
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: {
      getSupportedConstraints: () => ({}),
      getUserMedia: async () => { window.__aboutMicrophoneRequests++; throw new Error('About must not request audio'); },
    } });
  });
  await page.goto('/');
  await expect(page.locator('#gunSetupView')).toBeVisible();
  await page.locator('#settingsShortcut').click();
  await page.locator('#aboutBtn').click();
  await expect(page.locator('#aboutView')).toBeVisible();
  const email = page.getByRole('link', { name: 'easydryfire@gmail.com', exact: true });
  await expect(email).toHaveAttribute('href', 'mailto:easydryfire@gmail.com');
  await expect(page.locator('#safetyAck')).not.toBeChecked();
  await expect(page.locator('#safetyModal')).not.toBeVisible();
  expect(await page.evaluate(() => window.__aboutMicrophoneRequests)).toBe(0);
  await page.locator('#aboutView [data-back]').click();
  await expect(page.locator('#settingsView')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#aboutView')).toBeVisible();
  await page.goBack();
  await page.locator('#settingsView [data-back]').click();
  await expect(page.locator('#gunSetupView')).toBeVisible();
  await expect(page.locator('#gunName')).toHaveValue('');
});

test('About preserves selected-gun data and the current appearance', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/');
  await page.locator('#restoreGunBackupBtn').click();
  await page.locator('#importFile').setInputFiles({ name: 'fixture.json', mimeType: 'application/json', buffer: library });
  await expect(page.locator('#homeView')).toBeVisible();
  await page.locator('#settingsShortcut').click();
  await page.locator('#appearance').selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const exportLibrary = async () => {
    const pending = page.waitForEvent('download');
    await page.locator('#exportBtn').click();
    const download = await pending;
    return JSON.parse(readFileSync(await download.path(), 'utf8'));
  };
  const before = await exportLibrary();
  await page.locator('#aboutBtn').click();
  await expect(page.locator('#aboutView')).toBeVisible();
  await expect(page.locator('#gunSwitcherBtn')).not.toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#aboutView [data-back]').click();
  await expect(page.locator('#appearance')).toHaveValue('light');
  const exported = await exportLibrary();
  for (const key of ['guns', 'activeGunId', 'examples', 'events', 'gunSettings', 'sessions', 'settings']) {
    expect(exported[key], `About changed ${key}`).toEqual(before[key]);
  }
  expect(exported.settings.appearance).toBe('light');
});
