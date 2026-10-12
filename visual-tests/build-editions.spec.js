import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const edition = process.env.VISUAL_EDITION ?? 'public';
const library = readFileSync(new URL('./fixtures/library.json', import.meta.url));
async function restore(page) {
  page.on('dialog', dialog => dialog.accept()); await page.goto('/');
  await page.locator('#restoreGunBackupBtn').click();
  await page.locator('#importFile').setInputFiles({ name: 'fixture.json', mimeType: 'application/json', buffer: library });
  await expect(page.locator('#homeView')).toBeVisible();
}
async function backup(page) {
  await page.locator('#settingsShortcut').click();
  const pending = page.waitForEvent('download'); await page.locator('#exportBtn').click();
  const download = await pending; return JSON.parse(readFileSync(await download.path(), 'utf8'));
}
test('both editions retain every legacy gun, preset, result and backup without microphone requests', async ({ page }) => {
  await page.addInitScript(() => {
    window.__editionMicRequests = 0;
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getSupportedConstraints: () => ({}),
      getUserMedia: async () => { window.__editionMicRequests++; throw new Error('Library actions must not request audio'); } } });
  });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await restore(page);
  const initial = await backup(page);
  for (const gun of ['qa-gun-b', 'qa-gun-c', 'qa-gun-a']) {
    await page.locator('#gunSwitcherBtn').click(); await page.locator(`[data-gun-id="${gun}"]`).click();
    await expect(page.locator('#homeView')).toBeVisible();
  }
  await page.locator('.tab[data-view="drills"]').click(); await page.locator('#customDrillsTab').click();
  await expect(page.locator('#customDrillCatalog')).toContainText('QA saved sequence');
  await page.locator('#customDrillCatalog').getByRole('button', { name: 'Start Drill' }).click();
  await expect(page.locator('#sessionConfigure')).toBeVisible();
  await page.locator('.tab[data-view="drills"]').click(); await page.locator('#customDrillsTab').click();
  await page.locator('#customDrillCatalog').getByRole('button', { name: 'Edit sequence' }).click();
  await page.locator('#customDrillName').fill('Updated saved preset'); await page.locator('#saveCustomDrillBtn').click();
  await expect(page.locator('#customDrillCatalog')).toContainText('Updated saved preset');
  const final = await backup(page);
  for (const key of ['guns', 'activeGunId', 'examples', 'events', 'sessions', 'settings']) expect(final[key], key).toEqual(initial[key]);
  const preset = final.gunSettings.find(row => row.gunId === 'qa-gun-a' && row.key === 'customDrills').value;
  expect(preset).toHaveLength(1); expect(preset[0]).toMatchObject({ id: 'custom-qa-a', title: 'Updated saved preset', steps: ['draw', 'reload', 'trigger'] });
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => window.__editionMicRequests)).toBe(0);
});
if (edition === 'public') {
  test('public creation guards survive revealed controls, direct submits and browser edition flags', async ({ page }) => {
    await page.goto('/?edition=preview');
    await page.evaluate(() => localStorage.setItem('edition', 'preview'));
    await page.locator('#gunName').fill('First gun'); await page.locator('[name="gunTypeChoice"][value="Handguns"]').check();
    await page.locator('#saveGunBtn').click(); await expect(page.locator('#homeView')).toBeVisible();
    await page.locator('#gunSwitcherBtn').click(); await expect(page.locator('#gunList .gun-profile')).toHaveCount(1); await expect(page.locator('#addGunBtn')).not.toBeVisible();
    await page.evaluate(() => { document.querySelector('#addGunBtn').classList.remove('hidden'); document.querySelector('#addGunBtn').disabled = false; });
    await page.evaluate(() => document.querySelector('#addGunBtn').click()); await expect(page.locator('#gunsView')).toBeVisible();
    await page.evaluate(() => { document.querySelector('#gunName').value = 'Blocked second gun'; document.querySelector('#gunType').value = 'Handguns'; document.querySelector('#gunForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    await expect(page.locator('#appMessage')).toContainText('one gun');
    await page.locator('#gunList .gun-card').first().click(); await expect(page.locator('#homeView')).toBeVisible();
    await page.locator('.tab[data-view="drills"]').click();
    await expect(page.locator('#customDrillsTab')).not.toBeVisible();
    await page.evaluate(() => { document.querySelector('#customDrillName').value = 'Blocked new preset'; document.querySelector('#customDrillForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    await expect(page.locator('#appMessage')).toContainText('New custom drills are unavailable');
    await expect(page.locator('html')).toHaveAttribute('data-build-edition', 'public');
    const saved = await backup(page); expect(saved.guns).toHaveLength(1);
    expect(saved.gunSettings.filter(row => row.key === 'customDrills').flatMap(row => row.value)).toHaveLength(0);
  });
  test('public History keeps saved timing text without chart implementation', async ({ page }) => {
    await restore(page); await page.locator('.tab[data-view="history"]').click();
    await expect(page.locator('#progressSection')).not.toBeVisible();
    await expect(page.locator('.progress-chart')).toHaveCount(0);
    await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);
    await page.locator('#savedSessions .saved-session-card').first().getByRole('button').click();
    await expect(page.locator('#practiceReview')).toBeVisible();
    await expect(page.locator('#practiceSaved')).toHaveText('Saved on this device');
  });
} else {
  test('full preview retains new-gun, custom-creation and graph workflows', async ({ page }) => {
    await restore(page); await page.locator('#gunSwitcherBtn').click(); await page.locator('#addGunBtn').click();
    await page.locator('#gunName').fill('Preview fourth gun'); await page.locator('[name="gunTypeChoice"][value="Handguns"]').check();
    await page.locator('#saveGunBtn').click(); await expect(page.locator('#homeView')).toBeVisible();
    await page.locator('.tab[data-view="drills"]').click(); await page.locator('#customDrillsTab').click(); await page.locator('#newCustomDrillBtn').click();
    await page.locator('#customDrillName').fill('Preview new drill'); await page.locator('#customAction').selectOption('trigger'); await page.locator('#addCustomActionBtn').click();
    await page.locator('#saveCustomDrillBtn').click(); await expect(page.locator('#customDrillCatalog')).toContainText('Preview new drill');
    await page.locator('#gunSwitcherBtn').click(); await page.locator('[data-gun-id="qa-gun-a"]').click();
    await page.locator('.tab[data-view="history"]').click(); await expect(page.locator('.progress-chart')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-build-edition', 'preview');
    const saved = await backup(page); expect(saved.guns).toHaveLength(4);
  });
}
