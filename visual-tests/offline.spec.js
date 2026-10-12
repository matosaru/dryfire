import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const library = readFileSync(new URL('./fixtures/library.json', import.meta.url));
test.use({ serviceWorkers: 'allow' });
test('first installed offline refresh keeps app bundles and the restored library available', async ({ page, context }) => {
  page.on('dialog', dialog => dialog.accept()); await page.goto('/');
  await page.locator('#restoreGunBackupBtn').click();
  await page.locator('#importFile').setInputFiles({ name: 'fixture.json', mimeType: 'application/json', buffer: library });
  await expect(page.locator('#homeView')).toBeVisible();
  // Production registers on HTTPS. Localhost is a secure context for exercising
  // the same built worker without weakening the application's HTTPS guard.
  await page.evaluate(async () => { await navigator.serviceWorker.register('/sw.js'); await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  const missing = await page.evaluate(async () => {
    const resources = performance.getEntriesByType('resource').map(row => row.name)
      .filter(url => url.startsWith(location.origin + '/assets/') && /\.(js|css)$/.test(url));
    return (await Promise.all(resources.map(async url => await caches.match(url) ? null : url))).filter(Boolean);
  });
  expect(missing, 'The first installation must cache dynamically loaded bundles too').toEqual([]);
  await context.setOffline(true); await page.reload();
  await expect(page.locator('#homeView')).toBeVisible(); await expect(page.locator('#activeGunName')).toHaveText('QA Handgun');
  await page.locator('#gunSwitcherBtn').click(); await expect(page.locator('#gunList .gun-profile')).toHaveCount(3);
  await page.locator('[data-gun-id="qa-gun-a"]').click(); await page.locator('.tab[data-view="history"]').click();
  await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);
  if ((process.env.VISUAL_EDITION ?? 'public') === 'preview') await expect(page.locator('.progress-chart')).toBeVisible();
  else await expect(page.locator('#progressSection')).not.toBeVisible();
  await context.setOffline(false);
});
