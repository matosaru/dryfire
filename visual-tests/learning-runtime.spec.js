import {freezeMotionArtwork} from './motion-fixture.js';
import {createHash} from 'node:crypto';
import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const library=readFileSync(new URL('./fixtures/library.json',import.meta.url));
for(const theme of ['dark','light'])test(`Learn keeps ${theme} pixels, drafts, sound scopes and safety after delayed handoff`,async({page},testInfo)=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
  let release;const blocked=new Promise(resolve=>{release=resolve;});
  await page.route('**/assets/learnPage-*.js',async route=>{await blocked;await route.continue();});
  await freezeMotionArtwork(page);
  await page.goto('/');await page.locator('#restoreGunBackupBtn').click();await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:library});await expect(page.locator('#homeView')).toBeVisible();
  if(theme==='light'){await page.locator('#settingsShortcut').click();await page.locator('#appearance').selectOption(theme);await expect(page.locator('html')).toHaveAttribute('data-theme',theme);}
  await page.locator('.tab[data-view="learn"]').click();
  const disclosures=page.locator('#learnView details.optional-sounds');for(const disclosure of await disclosures.all())await disclosure.locator('summary').click();
  for(const image of await page.locator('#learnView img').all()){await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);}
  await page.evaluate(()=>scrollTo(0,0));
  const before=await page.locator('#learnView').screenshot({animations:'disabled'});
  const loaded=page.waitForResponse(response=>/\/assets\/learnPage-/.test(response.url()));release();await loaded;
  await expect(page.locator('#learnView')).not.toHaveAttribute('data-react-learn');
  await page.locator('.tab[data-view="home"]').click();await page.locator('.tab[data-view="learn"]').click();await expect(page.locator('#learnView')).toHaveAttribute('data-react-learn','');
  for(const disclosure of await disclosures.all())await expect(disclosure).toHaveAttribute('open','');
  for(const image of await page.locator('#learnView img').all()){await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);}
  await page.evaluate(()=>scrollTo(0,0));
  const after=await page.locator('#learnView').screenshot({animations:'disabled'});await testInfo.attach('native',{body:before,contentType:'image/png'});await testInfo.attach('react',{body:after,contentType:'image/png'});expect(createHash('sha256').update(after).digest('hex')).toBe(createHash('sha256').update(before).digest('hex'));
  const optional=page.locator('[data-sound-label="draw"] input');const enabled=await optional.isChecked();await optional.setChecked(!enabled);await expect(optional).toBeChecked({checked:!enabled});
  await page.locator('[data-sound-label="trigger"] .reset-class').click();await expect(page.locator('[data-sound-label="trigger"] .progress-label')).toContainText('0 / 10 samples');await expect(page.locator('[data-sound-label="draw"] .progress-label')).toContainText('3 / 10 samples');
  await page.locator('[data-sound-label="trigger"] .record-example').click();await expect(page.locator('#safetyModal')).toBeVisible();
  expect(errors).toEqual([]);
});
