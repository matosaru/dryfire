import{test,expect}from'@playwright/test';import{readFileSync}from'node:fs';
import{PUBLIC_ROUTES}from'../site/routes.js';
test('favicon is available at its conventional URL',async({request})=>{const response=await request.get('/favicon.ico');expect(response.status()).toBe(200);const icon=await response.body();expect(icon.readUInt16LE(2)).toBe(1);});
const library=JSON.parse(readFileSync(new URL('./fixtures/library.json',import.meta.url)));
test('all public pages have readable initial content and links without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:900}});const page=await context.newPage();
 for(const route of PUBLIC_ROUTES){await page.goto(route.path==='/'?'/welcome/':route.path);await expect(page.locator('h1')).toHaveText(route.heading);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://easydryfire.com'+route.path);await expect(page.locator('nav[aria-label="Main navigation"] a')).toHaveCount(5);expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(0);}
 await context.close();
});
test('app paths preserve profile data, settings, practice drafts and browser history across refresh',async({page})=>{page.on('dialog',d=>d.accept());
 await page.goto('/app/history/');await expect(page.locator('#gunSetupView')).toBeVisible();await page.locator('#restoreGunBackupBtn').click();await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(library))});await expect(page.locator('#historyView')).toBeVisible();
 await page.goto('/app/history/');await expect(page.locator('#historyView')).toBeVisible();await expect(page).toHaveURL(/\/app\/history\/$/);await expect(page).toHaveTitle('History — Dry Fire With Ease');
 await page.locator('.tab[data-view="drills"]').click();await expect(page).toHaveURL(/\/app\/drills\/$/);await page.locator('[data-practice-mode="par"]').click();await expect(page).toHaveURL(/\/app\/practice\/par-time\/$/);await page.locator('#practiceRepetitions').fill('');await page.locator('#practiceGuideLink').click();await expect(page).toHaveURL(/\/app\/practice-guide\/$/);await page.locator('#practiceGuideBackBtn').click();await expect(page.locator('#practiceRepetitions')).toHaveValue('');await expect(page).toHaveURL(/\/app\/practice\/par-time\/$/);
 await page.reload();await expect(page.locator('#practiceConfigure')).toBeVisible();await expect(page.locator('#practice-title')).toHaveText('Par time practice');await expect(page.locator('#activeGunName')).toHaveText('QA Handgun');
 await page.locator('#settingsShortcut').click();await expect(page).toHaveURL(/\/app\/settings\/$/);await page.goBack();await expect(page.locator('#practiceConfigure')).toBeVisible();
});
