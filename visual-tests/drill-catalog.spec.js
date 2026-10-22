import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { addLegacySequence, openLegacySequence } from './legacy-sequence.js';

// The same catalog contract applies before and after the lazy page handoff.
test('practice and sequence cards share presentation without duplicate trigger choice or data loss', async ({ page }) => {
  const backup = JSON.parse(readFileSync(new URL('./fixtures/library.json', import.meta.url)));
  addLegacySequence(backup);
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/');
  await page.locator('#restoreGunBackupBtn').click();
  await page.locator('#importFile').setInputFiles({ name: 'library.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.locator('#homeView')).toBeVisible();
  for (let visit = 0; visit < 2; visit++) {
    await page.locator('.tab[data-view="drills"]').click();
    await expect(page.locator('#drillCatalog .preset-card')).toHaveCount(3);
    await expect(page.locator('#drillCatalog h3')).toHaveText(['Rack slide → Trigger pull', 'Magazine change → Trigger pull', 'Draw from holster → Magazine change → Trigger pull']);
    await expect(page.locator('#practiceCatalog .preset-header .drill-target')).toHaveCount(6);
    await expect(page.locator('#practiceCatalog .drill-description')).toHaveCount(6);
    await expect(page.locator('#practiceCatalog button')).toHaveText(Array(6).fill('▶ Start Drill'));
    await page.locator('[data-practice-mode="single"]').click();
    await expect(page.locator('#practiceConfigure')).toBeVisible();
    await expect(page.locator('#practiceStartBtn')).toBeVisible();
    await expect(page.locator('#practiceRun')).not.toBeVisible();
    await page.locator('.tab[data-view="home"]').click();
  }
  await openLegacySequence(page);
  await expect(page.locator('#sessionSteps li')).toHaveText(['Trigger pull']);
});
