import {test,expect} from '@playwright/test';
import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),library=readFileSync(new URL('./fixtures/library.json',import.meta.url));
function markup(native){const dom=new JSDOM(html),doc=dom.window.document;if(native)for(const name of ['practice-run','practice-review','session-run','session-review']){const text=readFileSync(new URL('./../tests/fixtures/session-fragments/'+name+'.html',import.meta.url),'utf8');const host=doc.createElement('div');host.innerHTML=text;const live=host.firstElementChild,id=live.id;doc.getElementById(id).replaceWith(live);host.innerHTML=text.replace(/\bid="([^"]+)"/g,(_match,id)=>`id="example-${id}"`).replace(/\b(aria-labelledby|aria-describedby|for)="([^"]+)"/g,(_match,attr,ids)=>`${attr}="${ids.split(' ').map(id=>'example-'+id).join(' ')}"`);doc.getElementById('example-'+id).replaceWith(host.firstElementChild);}return dom.serialize();}
const oldHTML=markup(true),newHTML=markup(false);
for(const theme of ['dark','light'])test(`shared session fragments retain native ${theme} pixels in posters and completed guides`,async({page},testInfo)=>{
 test.setTimeout(120000);let native=true;await page.route('**/',route=>route.fulfill({status:200,contentType:'text/html',body:native?oldHTML:newHTML}));page.on('dialog',dialog=>dialog.accept());const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.clock.install({time:new Date('2026-10-11T11:00:00Z')});await page.clock.pauseAt(new Date('2026-10-11T11:00:00Z'));
 const images=new Map();
 for(const variant of ['native','typed']){
  native=variant==='native';await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-view',/^(home|gunSetup)$/);if(await page.locator('#gunSetupView').isVisible())await page.locator('#restoreGunBackupBtn').click();else await page.locator('#settingsShortcut').click();await expect(page.locator('#settingsView')).toBeVisible();await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:library});await expect(page.locator('#homeView')).toBeVisible();await page.locator('#settingsShortcut').click();await expect(page.locator('#settingsView')).toBeVisible();await page.locator('#appearance').selectOption(theme);
  for(const name of ['single','single-early','reload','sequence-custom']){
   await page.locator('.tab[data-view="drills"]').click();if(name==='sequence-custom'){await page.locator('#customDrillsTab').click();await page.locator('#customDrillCatalog').getByRole('button',{name:'Start Drill'}).first().click();await page.locator('#sessionGuideLink').click();}else{await page.locator(`[data-practice-mode="${name==='single-early'?'single':name}"]`).click();await page.locator('#practiceGuideLink').click();}if(name==='single-early')await page.locator('#practiceGuideEarlyBtn').click();
   for(const phase of ['poster','review']){
    if(phase==='review'){await page.locator('#practiceGuidePlayBtn').click();await page.clock.runFor(20000);await expect(page.locator('#practiceGuidePlayBtn')).toHaveText('Replay example');}
    const image=await page.locator('#practiceGuideExample').screenshot({animations:'disabled'}),key=name+'-'+phase;
    if(native)images.set(key,image);else{const original=images.get(key),hash=bytes=>createHash('sha256').update(bytes).digest('hex');if(hash(image)!==hash(original)){await testInfo.attach(key+'-native',{body:original,contentType:'image/png'});await testInfo.attach(key+'-typed',{body:image,contentType:'image/png'});}expect(hash(image),key).toBe(hash(original));}
   }
  }
 }
 expect(errors).toEqual([]);
});
