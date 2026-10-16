import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const library = readFileSync(new URL('./fixtures/library.json', import.meta.url));

for (const screen of ['about', 'contact']) test(`${screen} bottom navigation reaches every main destination with historical Back`, async ({ page }) => {
  page.on('dialog', dialog => dialog.accept()); await page.goto('/');
  await page.locator('#restoreGunBackupBtn').click();
  await page.locator('#importFile').setInputFiles({ name: 'fixture.json', mimeType: 'application/json', buffer: library });
  await expect(page.locator('#homeView')).toBeVisible(); await page.locator(`#${screen}Btn`).click();
  await expect(page.locator('.tabs .tab')).toHaveCount(5);
  for (const view of ['home', 'learn', 'drills', 'recognize', 'history']) {
    await expect(page.locator('.tabs .tab.active')).toHaveCount(0);
    await page.locator(`.tab[data-view="${view}"]`).click(); await expect(page.locator(`#${view}View`)).toBeVisible();
    await page.goBack(); await expect(page.locator(`#${screen}View`)).toBeVisible();
  }
  await expect(page.locator('#safetyAck')).not.toBeChecked();
});

test('About and Contact are separate historical screens before setup without capture or safety acknowledgement', async ({ page }) => {
  await page.addInitScript(() => {
    window.__aboutMicrophoneRequests = 0;
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: {
      getSupportedConstraints: () => ({}),
      getUserMedia: async () => { window.__aboutMicrophoneRequests++; throw new Error('About must not request audio'); },
    } });
  });
  await page.goto('/');
  await expect(page.locator('#gunSetupView')).toBeVisible();
  await page.locator('#aboutBtn').click();
  await expect(page.locator('#aboutView')).toBeVisible();
  await expect(page.locator('#aboutBetaTitle')).toHaveText('Feedback welcome');
  await expect(page.locator('#aboutBetaTitle + p')).toContainText('This app is in beta. All feedback and suggestions are welcome.');
  await expect(page.locator('#aboutBtn')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#aboutView a[href^="mailto:"]')).toHaveCount(0);
  await page.locator('#contactBtn').click();
  await expect(page.locator('#contactView')).toBeVisible();
  await expect(page.locator('#aboutView')).not.toBeVisible();
  await expect(page.locator('#contactBtn')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#aboutBtn')).not.toHaveAttribute('aria-current', 'page');
  const email = page.getByRole('link', { name: 'easydryfire@gmail.com', exact: true });
  await expect(email).toHaveAttribute('href', 'mailto:easydryfire@gmail.com');
  await expect(page.locator('#safetyAck')).not.toBeChecked();
  await expect(page.locator('#safetyModal')).not.toBeVisible();
  expect(await page.evaluate(() => window.__aboutMicrophoneRequests)).toBe(0);
  await page.locator('#contactView [data-back]').click();
  await expect(page.locator('#aboutView')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#contactView')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#aboutView')).toBeVisible();
  await page.locator('#aboutView [data-back]').click();
  await expect(page.locator('#gunSetupView')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#aboutView')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#gunSetupView')).toBeVisible();
  await page.locator('#contactBtn').click();
  await expect(page.locator('#contactView')).toBeVisible();
  await expect(page.locator('#gunSwitcherBtn')).not.toBeVisible();
  await expect(page.locator('#safetyAck')).not.toBeChecked();
  expect(await page.evaluate(() => window.__aboutMicrophoneRequests)).toBe(0);
  await page.locator('#contactView [data-back]').click();
  await expect(page.locator('#gunSetupView')).toBeVisible();
  await expect(page.locator('#gunName')).toHaveValue('');
});

test('About and Contact preserve selected-gun data and the current appearance', async ({ page }) => {
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
  await page.locator('#settingsView [data-back]').click();
  await expect(page.locator('#homeView')).toBeVisible();
  await page.locator('#aboutBtn').click();
  await expect(page.locator('#aboutView')).toBeVisible();
  await expect(page.locator('#gunSwitcherBtn')).not.toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#contactBtn').click();
  await expect(page.locator('#contactView')).toBeVisible();
  await expect(page.locator('#gunSwitcherBtn')).not.toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#contactView [data-back]').click();
  await expect(page.locator('#aboutView')).toBeVisible();
  await page.locator('#aboutView [data-back]').click();
  await expect(page.locator('#homeView')).toBeVisible();
  await page.locator('#settingsShortcut').click();
  await expect(page.locator('#appearance')).toHaveValue('light');
  const exported = await exportLibrary();
  for (const key of ['guns', 'activeGunId', 'examples', 'events', 'gunSettings', 'sessions', 'settings']) {
    expect(exported[key], `Informational pages changed ${key}`).toEqual(before[key]);
  }
  expect(exported.settings.appearance).toBe('light');
});

test('informational React loads on demand while static content and Back stay usable', async ({ page }) => {
  const requests = [];
  let release;
  const delayed = new Promise(resolve => { release = resolve; });
  await page.route('**/assets/informationPages-*.js', async route => {
    requests.push(route.request().url());
    await delayed;
    await route.continue();
  });
  await page.goto('/');
  await expect(page.locator('#gunSetupView')).toBeVisible();
  expect(requests).toEqual([]);
  await page.locator('#aboutBtn').click();
  await expect(page.locator('#aboutView')).toBeVisible();
  await expect.poll(() => requests.length).toBe(1);
  await page.getByRole('button', { name: 'Back to previous screen', exact: true }).click();
  await expect(page.locator('#gunSetupView')).toBeVisible();
  await page.locator('#aboutBtn').click();
  release();
  const modulePath = JSON.parse(readFileSync(new URL('../dist/edition.json', import.meta.url))).assets.find(path => /\/informationPages-[^/]+\.js$/.test(path));
  expect(await page.evaluate(async path => !!(await import(path)).mountInformationPages, modulePath)).toBe(true);
  await page.locator('#contactBtn').click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('#aboutView')).toBeVisible();
  await page.getByRole('button', { name: 'Back to previous screen', exact: true }).click();
  await expect(page.locator('#gunSetupView')).toBeVisible();
  expect(requests).toHaveLength(1);
});
