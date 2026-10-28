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
      const resolvedTheme=await page.locator('html').getAttribute('data-theme');
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
      const information=page.getByRole('banner').getByRole('navigation',{name:'Information'});
      await expect(information.getByRole('link')).toHaveCount(2);await expect(information.getByRole('button',{name:'Settings',exact:true})).toHaveCount(1);
      await expect(information.getByRole('link',{name:'About',exact:true})).toBeVisible();
      await expect(information.getByRole('link',{name:'Contact',exact:true})).toBeVisible();
      for(const link of await information.locator('.header-link').all()){
        const box=await link.boundingBox();expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);
        await expect(link).toHaveAttribute('data-icon',/^(about|contact|settings)$/);
        if(!(await link.getAttribute('aria-current')))await expect(link).toHaveCSS('color',resolvedTheme==='light'?'rgb(36, 61, 81)':'rgb(255, 255, 255)');
      }
      await expect(page.getByRole('contentinfo').getByRole('link')).toHaveCount(0);
      await expect(page.getByRole('banner').getByRole('link',{name:'Home — Dry Fire With Ease'})).toHaveAttribute('href','/');
      const header = await page.evaluate(() => ({
        brandRight: document.querySelector('.brand-name').getBoundingClientRect().right,
        badgeLeft: document.querySelector('.beta-badge').getBoundingClientRect().left,
        badgeRight: document.querySelector('.beta-badge').getBoundingClientRect().right,
        toolbarLeft: document.querySelector('#aboutBtn').getBoundingClientRect().left,
        homeRight: document.querySelector('#brandHome').getBoundingClientRect().right,
      }));
      // The Beta badge may wrap below the name on narrow screens.
      expect(header.badgeLeft).toBeGreaterThanOrEqual(0);
      expect(header.homeRight).toBeLessThanOrEqual(header.toolbarLeft - 4);
      expect(header.badgeRight).toBeLessThanOrEqual(header.toolbarLeft - 4);
      await expect(page.locator('.tabs')).toBeInViewport();
      await expect(page.locator('.tabs .tab')).toHaveCount(5);
      expect(await page.locator('.tabs').evaluate(node => getComputedStyle(node).position)).toBe('fixed');
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect(page.locator('.tabs')).toBeInViewport();

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
    await expect(page.locator('#homeView')).toBeVisible(); await expect(page.locator('html')).toHaveAttribute('data-theme',theme); await shell();
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


test('header icon keyboard labels and modified links preserve navigation',async({page})=>{
 await page.goto('/');await expect(page.locator('#gunSetupView')).toBeVisible();
 const about=page.getByRole('banner').getByRole('link',{name:'About',exact:true});
 await expect(about).toHaveAttribute('title','About');await about.focus();
 await page.keyboard.press('Tab');await expect(page.getByRole('banner').getByRole('link',{name:'Contact',exact:true})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/contact\/$/);
 await expect(page.getByRole('banner').getByRole('link',{name:'Contact',exact:true})).toHaveAttribute('aria-current','page');

 await page.goBack();await expect(page.locator('#gunSetupView')).toBeVisible();
 await page.setViewportSize({width:640,height:844});await page.evaluate(()=>document.documentElement.style.zoom='2');
 const box=await page.locator('header.hero').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(640);
 // Text zoom must not remove names or destinations; physical 200% device checks are tracked separately.
 for(const label of ['About','Contact'])await expect(page.getByRole('banner').getByRole('link',{name:label,exact:true})).toBeVisible();await expect(page.getByRole('banner').getByRole('button',{name:'Settings',exact:true})).toBeVisible();
});

test('header brand returns Home from information pages before and after enhancement',async({page})=>{
 page.on('dialog',dialog=>dialog.accept());
 await page.goto('/');await expect(page.locator('#gunSetupView')).toBeVisible();
 await page.locator('#restoreGunBackupBtn').click();
 await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(library))});
 await expect(page.locator('#homeView')).toBeVisible();
 for(const view of ['about','contact','settings']){
  await page.locator(view==='settings'?'#settingsShortcut':`#${view}Btn`).click();
  await expect(page.locator(`#${view}View`)).toBeVisible();
  const home=page.getByRole('banner').getByRole('link',{name:'Home — Dry Fire With Ease'});
  await home.locator('.brand-logo').click();await expect(page.locator('#homeView')).toBeVisible();await expect(page).toHaveURL(/\/$/);
  await expect(home).toHaveAttribute('aria-current','page');
 }
 await expect(page.locator('footer #aboutBtn,footer #contactBtn')).toHaveCount(0);
 await expect(page.locator('.tabs .tab')).toHaveCount(5);
});

test('startup avoids redundant scrolling and route scroll resets precede view mutations',async({page})=>{
 await page.addInitScript(()=>{
  window.__routeScrolls=[];
  const scroll=window.scrollTo.bind(window);
  window.scrollTo=(...args)=>{window.__routeScrolls.push({view:document.body?.dataset.view,visible:[...document.querySelectorAll('.view:not(.hidden)')].map(node=>node.id)});return scroll(...args);};
 });
 await page.goto('/');await expect(page.locator('#gunSetupView')).toBeVisible();
 expect(await page.evaluate(()=>window.__routeScrolls)).toEqual([]);
 await page.locator('#settingsShortcut').click();await expect(page.locator('#settingsView')).toBeVisible();
 expect(await page.evaluate(()=>window.__routeScrolls)).toEqual([{view:'gunSetup',visible:['gunSetupView']}]);
});
