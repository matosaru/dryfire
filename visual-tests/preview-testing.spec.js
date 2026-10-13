import { edition } from './catalog.js';
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { installSyntheticMedia } from './media.js';
if (edition === 'preview') {
  test.use({ storageState: { cookies: [], origins: [] } });
  const library = readFileSync(new URL('./fixtures/library.json', import.meta.url));
  async function restore(page) {
    page.on('dialog', dialog => dialog.accept()); await page.goto('/');
    await page.locator('#restoreGunBackupBtn').click();
    await page.locator('#importFile').setInputFiles({ name: 'fixture.json', mimeType: 'application/json', buffer: library });
    await expect(page.locator('#homeView')).toBeVisible();
  }
  async function backup(page) {
    await page.locator('#settingsShortcut').click(); const pending = page.waitForEvent('download'); await page.locator('#exportBtn').click();
    return JSON.parse(readFileSync(await (await pending).path(), 'utf8'));
  }
  test('private preview defaults Full and switches Free/Full without changing saved data or identity', async ({ page }) => {
    await restore(page); await expect(page.locator('#previewModeBadge')).toContainText('Full mode');
    const before = await backup(page); await expect(page.locator('#previewTestMode')).toHaveValue('full');
    await page.locator('#gunSwitcherBtn').click(); await expect(page.locator('#addGunBtn')).toBeVisible();
    await page.locator('[data-gun-id="qa-gun-a"]').click(); await page.locator('.tab[data-view="drills"]').click();
    await page.locator('#customDrillsTab').click(); await expect(page.locator('#newCustomDrillBtn')).toBeVisible();
    await page.locator('.tab[data-view="history"]').click(); await expect(page.locator('.progress-chart')).toBeVisible();
    await page.locator('#settingsShortcut').click(); await page.locator('#previewTestMode').selectOption('free');
    await expect(page.locator('#previewModeBadge')).toContainText('Free mode');
    await page.locator('#gunSwitcherBtn').click(); await expect(page.locator('#gunList .gun-profile')).toHaveCount(3); await expect(page.locator('#addGunBtn')).not.toBeVisible();
    await page.locator('[data-gun-id="qa-gun-a"]').click(); await page.locator('.tab[data-view="drills"]').click(); await page.locator('#customDrillsTab').click();
    await expect(page.locator('#customDrillCatalog')).toContainText('QA saved sequence'); await expect(page.locator('#newCustomDrillBtn')).not.toBeVisible();
    await page.locator('#customDrillCatalog').getByRole('button', { name: 'Edit sequence' }).click();
    await expect(page.locator('#customDrillName')).toHaveValue('QA saved sequence'); await page.locator('#cancelCustomDrillBtn').click();
    await page.locator('.tab[data-view="history"]').click(); await expect(page.locator('#progressSection')).not.toBeVisible(); await expect(page.locator('.progress-chart')).toHaveCount(0);
    const after = await backup(page);
    for (const key of ['guns', 'activeGunId', 'examples', 'events', 'sessions', 'settings', 'gunSettings']) expect(after[key], key).toEqual(before[key]);
    await page.reload();
    await expect(page.locator('#homeView')).toBeVisible();
    await page.locator('#settingsShortcut').click(); await expect(page.locator('#settingsView')).toBeVisible(); await expect(page.locator('#previewTestMode')).toHaveValue('free');
    await expect(page.locator('#previewModeBadge')).toContainText('Free mode');
    await page.locator('#previewTestMode').selectOption('full'); await page.reload();
    await expect(page.locator('#homeView')).toBeVisible();
    await page.locator('#settingsShortcut').click(); await expect(page.locator('#settingsView')).toBeVisible(); await expect(page.locator('#previewTestMode')).toHaveValue('full');
    await expect(page.locator('html')).toHaveAttribute('data-build-edition', 'preview');
  });
  test('private preview rejects forced mode changes during safety confirmation and pending microphone permission', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('dryfire-private-preview-mode', 'free'));
    await page.addInitScript(installSyntheticMedia);
    await page.addInitScript(() => { navigator.mediaDevices.getUserMedia = () => new Promise((resolve, reject) => { window.__rejectPreviewPermission = reject; }); });
    await restore(page); await page.locator('#settingsShortcut').click(); await page.locator('#previewTestMode').selectOption('full');
    await page.locator('.tab[data-view="drills"]').click(); await page.locator('[data-practice-mode="single"]').click(); await page.locator('#practiceStartBtn').click();
    await expect(page.locator('#safetyModal')).toBeVisible();
    const forceFree = () => page.evaluate(() => { const input = document.querySelector('#previewTestMode'); input.value = 'free'; input.dispatchEvent(new Event('change', { bubbles: true })); });
    await forceFree(); await expect(page.locator('#previewModeBadge')).toContainText('Full mode');
    await page.locator('#safetyModalAck').check(); await page.locator('#safetyConfirmBtn').click();
    await expect.poll(() => page.evaluate(() => typeof window.__rejectPreviewPermission)).toBe('function');
    await forceFree(); await expect(page.locator('#previewModeBadge')).toContainText('Full mode');
    expect(await page.evaluate(() => localStorage.getItem('dryfire-private-preview-mode'))).toBe('full');
    await page.evaluate(() => window.__rejectPreviewPermission(new Error('Synthetic permission ended')));
    await expect(page.locator('#appMessage')).toContainText('Synthetic permission ended');
  });
}
