import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const library = JSON.parse(readFileSync(new URL('./fixtures/library.json', import.meta.url)));
for (const width of [320, 390, 1024]) for (const theme of ['dark', 'light']) {
  test(`shared page shell remains usable across screens with ${width}px viewport in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    page.on('dialog', dialog => dialog.accept());
    await page.goto('/');
    async function shell() {
      await page.evaluate(() => window.scrollTo(0, 0));
      const activeView=await page.locator('body').getAttribute('data-view');
      await expect(page.locator('.view:not(.hidden)')).toHaveCount(1);
      await expect(page.locator('.view:not(.hidden)')).toHaveAttribute('id',activeView+'View');
      await expect(page.getByRole('banner')).toHaveCount(1);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('contentinfo')).toHaveCount(1);
      await expect(page.getByRole('banner').locator('#settingsShortcut')).toBeVisible();
      await expect(page.getByRole('banner').locator('.brand-name')).toContainText('WITH EASE');
      const beta = page.getByRole('banner').getByLabel('Beta version', { exact: true });
      await expect(beta).toBeVisible();
      await expect(beta).toHaveText('BETA');
      const header = await page.evaluate(() => ({
        brandRight: document.querySelector('.brand-name').getBoundingClientRect().right,
        badgeLeft: document.querySelector('.beta-badge').getBoundingClientRect().left,
        badgeRight: document.querySelector('.beta-badge').getBoundingClientRect().right,
        settingsLeft: document.querySelector('#settingsShortcut').getBoundingClientRect().left,
      }));
      expect(header.badgeLeft).toBeGreaterThanOrEqual(header.brandRight + 4);
      expect(header.badgeRight).toBeLessThanOrEqual(header.settingsLeft - 4);
      await expect(page.locator('.tabs')).toBeInViewport();
      await expect(page.locator('.tabs .tab')).toHaveCount(5);
      expect(await page.locator('.tabs').evaluate(node => getComputedStyle(node).position)).toBe('fixed');
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect(page.locator('.tabs')).toBeInViewport();
      await expect(page.locator('#aboutBtn')).toBeInViewport();
      await expect(page.locator('#contactBtn')).toBeInViewport();
      const bounds = await page.evaluate(() => ({
        footerBottom: document.querySelector('footer').getBoundingClientRect().bottom,
        navigationTop: document.querySelector('.tabs').getBoundingClientRect().top,
        navigationBottom: document.querySelector('.tabs').getBoundingClientRect().bottom,
        overflow: document.documentElement.scrollWidth - innerWidth,
        height: innerHeight,
      }));
      expect(bounds.footerBottom).toBeLessThanOrEqual(bounds.navigationTop + 1);
      expect(bounds.navigationBottom).toBeCloseTo(bounds.height, 0);
      expect(bounds.overflow).toBeLessThanOrEqual(0);
    }
    await expect(page.locator('#gunSetupView')).toBeVisible(); await shell();
    await expect(page.locator('.tabs .tab:enabled')).toHaveCount(0);
    await page.locator('#restoreGunBackupBtn').click();
    const backup = structuredClone(library); backup.settings.appearance = theme;
    await page.locator('#importFile').setInputFiles({ name: 'library.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
    await expect(page.locator('#homeView')).toBeVisible(); await shell();
    await expect(page.locator('.tabs .tab:enabled')).toHaveCount(5);
    for (const view of ['learn', 'drills', 'recognize', 'history']) {
      await page.locator(`.tab[data-view="${view}"]`).click(); await expect(page.locator(`#${view}View`)).toBeVisible(); await shell();
    }
    await page.locator('.tab[data-view="drills"]').click(); await page.locator('[data-practice-mode="single"]').click();
    await expect(page.locator('#practiceView')).toBeVisible(); await shell();
    await page.locator('#practiceGuideLink').click(); await expect(page.locator('#practiceGuideView')).toBeVisible(); await shell();
    await page.locator('#practiceGuideReturnBtn').click(); await page.locator('#practiceBackBtn').click();
    await page.locator('#drillCatalog .preset-card').first().getByRole('button', { name: 'Start Drill' }).click();
    await expect(page.locator('#sessionView')).toBeVisible(); await shell(); await page.locator('#sessionBackBtn').click();
    await page.locator('#settingsShortcut').click(); await expect(page.locator('#settingsView')).toBeVisible(); await shell();
    await page.locator('.install-details summary').click(); await expect(page.locator('.install-card')).toBeVisible(); await shell();
    for (const view of ['about', 'contact']) {
      await page.locator(`#${view}Btn`).click(); await expect(page.locator(`#${view}View`)).toBeVisible(); await shell();
    }
    await page.locator('.tab[data-view="home"]').click(); await page.locator('#gunSwitcherBtn').click();
    await expect(page.locator('#gunsView')).toBeVisible(); await shell(); await page.locator('[data-edit-gun-id="qa-gun-a"]').click();
    await expect(page.locator('#gunSetupView')).toBeVisible(); await shell();
    await expect(page.locator('#gunName')).toHaveValue('QA Handgun');
  });
}
