import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const library=readFileSync(new URL('./fixtures/library.json',import.meta.url));
const guideChunk=/\/assets\/practiceGuideController-[^/]+\.js/;
async function restore(page){
 await page.addInitScript(()=>{window.__guideMicRequests=0;Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getSupportedConstraints:()=>({}),getUserMedia:()=>{window.__guideMicRequests++;return Promise.reject(new Error('No guide microphone'));}}});});
 page.on('dialog',dialog=>dialog.accept());await page.goto('/');await expect(page.locator('#gunSetupView')).toBeVisible();await page.locator('#restoreGunBackupBtn').click();await expect(page.locator('#settingsView')).toBeVisible();await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:library});await expect(page.locator('#homeView')).toBeVisible();
}
async function practice(page,mode='reload'){
 await page.locator('.tab[data-view="drills"]').click();await page.locator(`[data-practice-mode="${mode}"]`).click();await expect(page.locator('#practiceConfigure')).toBeVisible();
}
test('guide code stays outside startup and delayed loading preserves drafts, navigation and fresh endpoints',async({page})=>{
 let release;const blocked=new Promise(resolve=>{release=resolve;});const requests=[];page.on('request',request=>{if(guideChunk.test(request.url()))requests.push(request.url());});
 await page.route('**/assets/practiceGuideController-*.js',async route=>{await blocked;await route.continue();});
 try{
  await restore(page);expect(requests).toHaveLength(0);await page.locator('#settingsShortcut').click();await expect(page.locator('#settingsView')).toBeVisible();expect(requests).toHaveLength(0);
  await practice(page);await expect.poll(()=>requests.length).toBe(1);await page.locator('#practiceRepetitions').fill('17');await page.locator('#practiceMinDelay').fill('');
  const field=await page.locator('#practiceMinDelay').elementHandle();await page.locator('#practiceGuideLink').click();await expect(page.locator('#practiceConfigure')).toBeVisible();
  await page.locator('#practiceReloadStart').selectOption('rack');await page.locator('#practiceReloadEnd').selectOption('trigger');await page.locator('#aboutBtn').click();await expect(page.locator('#aboutView')).toBeVisible();
  const loaded=page.waitForResponse(response=>guideChunk.test(response.url()));release();await loaded;await expect(page.locator('#aboutView')).toBeVisible();await expect(page.locator('#practiceGuideView')).not.toBeVisible();
  await page.goBack();await expect(page.locator('#practiceConfigure')).toBeVisible();await expect(page.locator('#practiceRepetitions')).toHaveValue('17');await expect(page.locator('#practiceMinDelay')).toHaveValue('');expect(await field.evaluate(node=>node===document.getElementById('practiceMinDelay'))).toBe(true);
  await page.locator('#practiceGuideLink').click();await expect(page.locator('#practiceGuideView')).toBeVisible();await expect(page.locator('#practiceGuideSequence .preset-chip')).toHaveText(['Rack slide','Trigger pull']);
  await page.locator('#practiceGuideReturnBtn').click();await expect(page.locator('#practiceReloadEnd')).toHaveValue('trigger');expect(await page.evaluate(()=>window.__guideMicRequests)).toBe(0);
 }finally{release();}
});
test('failed guide download leaves setup usable and reports only an explicit open; reload can recover',async({page})=>{
 await page.route('**/assets/practiceGuideController-*.js',route=>route.abort());await restore(page);
 const failed=page.waitForEvent('requestfailed',request=>guideChunk.test(request.url()));await practice(page,'single');await failed;
 await page.locator('#practiceRepetitions').fill('23');await page.locator('#practiceGuideLink').click();await expect(page.locator('#appMessage')).toContainText('Your setup is unchanged');await expect(page.locator('#practiceConfigure')).toBeVisible();await expect(page.locator('#practiceRepetitions')).toHaveValue('23');
 await page.locator('#settingsShortcut').click();await expect(page.locator('#settingsView')).toBeVisible();await page.unroute('**/assets/practiceGuideController-*.js');await page.reload();await expect(page.locator('#homeView')).toBeVisible();await practice(page,'single');await page.locator('#practiceGuideLink').click();await expect(page.locator('#practiceGuideView')).toBeVisible();expect(await page.evaluate(()=>window.__guideMicRequests)).toBe(0);
});
