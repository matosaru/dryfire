import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const library=JSON.parse(readFileSync(new URL('./fixtures/library.json',import.meta.url)));

test('onboarding Settings stays usable without downloading its React enhancement; trained profiles still enhance',async({page})=>{
 page.on('dialog',dialog=>dialog.accept());
 const enhancements=[];
 page.on('request',request=>{if(/\/(?:settingsPage|jsx-runtime)-[^/]+\.js/.test(new URL(request.url()).pathname))enhancements.push(request.url());});
 await page.goto('/');
 await expect(page.locator('#gunSetupView')).toBeVisible();
 await page.locator('#restoreGunBackupBtn').click();
 await expect(page.locator('#settingsView')).toBeVisible();
 await expect(page.locator('#importBtn')).toBeEnabled();
 await page.waitForLoadState('networkidle');
 expect(enhancements).toEqual([]);
 await expect(page.locator('#settingsView')).not.toHaveAttribute('data-react-settings','');
 await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(library))});
 await expect(page.locator('#homeView')).toBeVisible();
 await page.locator('#settingsShortcut').click();await page.waitForLoadState('networkidle');
 await page.locator('.tab[data-view="home"]').click();await expect(page.locator('#homeView')).toBeVisible();
 await page.locator('#settingsShortcut').click();
 await expect(page.locator('#settingsView')).toHaveAttribute('data-react-settings','');
 await expect(page.locator('#importBtn')).toBeEnabled();
});

test('empty-library background/reset/restore keeps onboarding usable before timing owners are needed',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
 await page.goto('/');await expect(page.locator('#gunSetupView')).toBeVisible();
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
 await page.locator('#settingsShortcut').click();await page.locator('#resetLibraryBtn').click();await expect(page.locator('#gunSetupView')).toBeVisible();
 await page.locator('#restoreGunBackupBtn').click();await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:readFileSync(new URL('./fixtures/library.json',import.meta.url))});await expect(page.locator('#homeView')).toBeVisible();
 await page.locator('.tab[data-view="drills"]').click();await page.locator('[data-practice-mode="single"]').click();await expect(page.locator('#practiceConfigure')).toBeVisible();await expect(page.locator('#practiceStartBtn')).toBeEnabled();
 await page.locator('.tab[data-view="drills"]').click();await page.locator('#drillCatalog .preset-card').first().getByRole('button',{name:'Start Drill'}).click();await expect(page.locator('#sessionConfigure')).toBeVisible();await expect(page.locator('#sessionStartBtn')).toBeEnabled();expect(errors).toEqual([]);
});
