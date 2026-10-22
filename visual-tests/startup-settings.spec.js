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
