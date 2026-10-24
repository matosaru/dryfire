import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {edition} from './catalog.js';
const library=readFileSync(new URL('./fixtures/library.json',import.meta.url));
const chunk=/\/assets\/progressView-[^/]+\.js/;
test.skip(edition!=='preview','Private charts are excluded from the public artifact.');
async function restore(page){
 await page.addInitScript(()=>localStorage.setItem('dryfire-private-preview-mode','full'));page.on('dialog',dialog=>dialog.accept());await page.goto('/');await expect(page.locator('#gunSetupView')).toBeVisible();await page.locator('#restoreGunBackupBtn').click();await expect(page.locator('#settingsView')).toBeVisible();await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:library});await expect(page.locator('#homeView')).toBeVisible();
}
test('private chart code waits for History; pending charts never block saved text or overwrite navigation',async({page})=>{
 let release;const pending=new Promise(resolve=>{release=resolve;});let requests=0;page.on('request',request=>{if(chunk.test(request.url()))requests++;});await page.route('**/assets/progressView-*.js',async route=>{await pending;await route.continue();});
 try{
  await restore(page);expect(requests).toBe(0);await page.locator('.tab[data-view="history"]').click();await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);await expect.poll(()=>requests).toBe(1);await page.locator('#progressRange').selectOption('30');const range=await page.locator('#progressRange').elementHandle();
  await page.locator('#aboutBtn').click();await expect(page.locator('#aboutView')).toBeVisible();const loaded=page.waitForResponse(response=>chunk.test(response.url()));release();await loaded;await expect(page.locator('#aboutView')).toBeVisible();await expect(page.locator('.progress-chart')).toHaveCount(0);
  await page.goBack();await expect(page.locator('#historyView')).toBeVisible();await expect(page.locator('.progress-chart')).toBeVisible();await expect(page.locator('#progressRange')).toHaveValue('30');expect(await range.evaluate(node=>node===document.getElementById('progressRange'))).toBe(true);
 }finally{release();}
});
test('a failed chart download keeps saved history usable and Free simulation still hides charts',async({page})=>{
 await page.route('**/assets/progressView-*.js',route=>route.abort());await restore(page);await page.locator('.tab[data-view="history"]').click();await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);await expect(page.locator('#appMessage')).toContainText('Your saved history is still available');await expect(page.locator('.progress-chart')).toHaveCount(0);
 await page.locator('#settingsShortcut').click();await page.locator('#previewTestMode').selectOption('free');await page.locator('.tab[data-view="history"]').click();await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);await expect(page.locator('#progressSection')).not.toBeVisible();
});
test('a delayed chart from an old gun cannot paint the newly selected gun’s history',async({page})=>{
 let release;const pending=new Promise(resolve=>{release=resolve;});await page.route('**/assets/progressView-*.js',async route=>{await pending;await route.continue();});
 try{
  await restore(page);await page.locator('.tab[data-view="history"]').click();await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);await page.locator('#gunSwitcherBtn').click();await page.locator('[data-gun-id="qa-gun-c"]').click();await expect(page.locator('#activeGunName')).toHaveText('QA Shotgun');await page.locator('.tab[data-view="history"]').click();await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(0);
  const loaded=page.waitForResponse(response=>chunk.test(response.url()));release();await loaded;await expect(page.locator('#progressContent')).toContainText('Complete practice sessions');await expect(page.locator('.progress-chart')).toHaveCount(0);
 }finally{release();}
});
