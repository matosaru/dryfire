import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {installSyntheticMedia} from './media.js';
const library=JSON.parse(readFileSync(new URL('./fixtures/library.json',import.meta.url)));
test('shared guide controls, group accents and ordered manual work in both themes and narrow layouts',async({page})=>{
 await page.setViewportSize({width:320,height:900});await page.addInitScript(installSyntheticMedia);page.on('dialog',d=>d.accept());await page.goto('/');await page.locator('#restoreGunBackupBtn').click();await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(library))});await expect(page.locator('#homeView')).toBeVisible();
 for(const theme of ['dark','light']){
  await page.locator('#settingsShortcut').click();await page.locator('#appearance').selectOption(theme);
  await page.locator('.tab[data-view="drills"]').click();
  for(const target of await page.locator('#practiceCatalog .drill-target').all())await expect(target).toHaveCSS('color','rgb(70, 186, 255)');
  for(const target of await page.locator('#drillCatalog .drill-target').all())await expect(target).toHaveCSS('color','rgb(181, 116, 246)');
  for(const kind of ['practice','session']){
   if(kind==='practice')await page.locator('[data-practice-mode="single"]').click();else await page.locator('#drillCatalog .preset-card').first().getByRole('button',{name:'Start Drill'}).click();
   const link=page.locator('#'+kind+'GuideLink');await expect(link).toHaveAccessibleName('About this practice');await expect(link).toHaveCSS('text-decoration-line','none');expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
   expect(await link.evaluate(node=>node.previousElementSibling.id)).toBe(kind+'Steps');await link.focus();await page.keyboard.press('Enter');await expect(page.locator('#practiceGuideView')).toBeVisible();
   await expect(page.locator('#practiceGuideView .preset-chip')).toHaveCount(0);
   if(kind==='session'){await expect(page.locator('#practiceGuideSequence')).toHaveClass('drill-steps session-sequence');await expect(page.locator('#practiceGuideSequence > li.drill-step')).toHaveCount(2);}
   await expect(page.locator('.tab[data-view="drills"]')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(0);
   await page.locator('#practiceGuideReturnBtn').click();await expect(link).toBeVisible();await page.locator('.tab[data-view="drills"]').click();
  }
 }
});
