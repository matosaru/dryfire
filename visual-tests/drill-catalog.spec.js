import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { addLegacySequence, openLegacySequence } from './legacy-sequence.js';

// The same catalog contract applies before and after the lazy page handoff.
test('practice and sequence cards share presentation without duplicate trigger choice or data loss', async ({ page }) => {
  const backup = JSON.parse(readFileSync(new URL('./fixtures/library.json', import.meta.url)));
  addLegacySequence(backup);
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/');
  await page.locator('#restoreGunBackupBtn').click();
  await page.locator('#importFile').setInputFiles({ name: 'library.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.locator('#homeView')).toBeVisible();
  for (let visit = 0; visit < 2; visit++) {
    await page.locator('.tab[data-view="drills"]').click();
    await expect(page.getByRole('heading', { name: 'Trigger Press Group', exact: true })).toBeVisible();
    await expect(page.locator('#practiceCatalog h3')).toHaveText(['Single trigger press', 'Repeated trigger press', 'Par time practice', 'Trigger control']);
    await expect(page.locator('[data-practice-mode="reload"], [data-practice-mode="free"]')).toHaveCount(0);
    await expect(page.locator('#drillCatalog .preset-card')).toHaveCount(3);
    await expect(page.locator('#drillCatalog h3')).toHaveText(['Rack slide → Trigger pull', 'Magazine change → Trigger pull', 'Draw from holster → Magazine change → Trigger pull']);
    await expect(page.locator('#practiceCatalog .preset-header .drill-target')).toHaveCount(4);
    await expect(page.locator('#practiceCatalog .drill-description')).toHaveCount(4);
    await expect(page.locator('#practiceCatalog button')).toHaveText(Array(4).fill('▶ Start Drill'));
    await page.locator('[data-practice-mode="single"]').click();
    await expect(page.locator('#practiceConfigure')).toBeVisible();
    await expect(page.locator('#practiceStartBtn')).toBeVisible();
    await expect(page.locator('#practiceRun')).not.toBeVisible();
    await page.locator('.tab[data-view="home"]').click();
  }
  await openLegacySequence(page);
  await expect(page.locator('#sessionSteps li')).toHaveText(['Trigger pull']);
});

for (const [width,theme] of [[320,'dark'],[390,'light'],[768,'dark']]) test(`all catalog card text aligns at ${width}px in ${theme} before and after handoff`,async({page})=>{
 const backup=JSON.parse(readFileSync(new URL('./fixtures/library.json',import.meta.url)));
 backup.settings.appearance=theme;
 backup.gunSettings.find(item=>item.key==='customDrills').value[0].title='LongCustomSequenceTitleWithoutSpacesToVerifyWrappingAtNarrowWidths';
 page.on('dialog',dialog=>dialog.accept());await page.setViewportSize({width,height:900});await page.goto('/');await page.locator('#restoreGunBackupBtn').click();await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await expect(page.locator('#homeView')).toBeVisible();
 for(let visit=0;visit<2;visit++){
  await page.locator('.tab[data-view="drills"]').click();
  for(const custom of [false,true]){
   await page.locator(custom?'#customDrillsTab':'#builtInDrillsTab').click();
   const cards=page.locator('#drillsView .preset-card:visible');await expect(cards).toHaveCount(custom?5:7);
   for(const card of await cards.all()){
    await expect(card.locator('.preset-steps,.preset-chip')).toHaveCount(0);
    const box=await card.boundingBox(),catalog=await card.locator('..').boundingBox();
    expect(Math.abs(box.x-catalog.x)).toBeLessThanOrEqual(.5);
    expect(Math.abs(box.width-catalog.width)).toBeLessThanOrEqual(.5);
    const title=await card.locator('h3').boundingBox(),description=await card.locator('.drill-description').boundingBox();
    expect(Math.abs(title.x-description.x)).toBeLessThanOrEqual(.5);
    expect(description.y).toBeGreaterThanOrEqual(title.y+title.height);
    await expect(card.getByRole('button',{name:'Start Drill'})).toBeEnabled();
   }
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('.tab[data-view="home"]').click();
 }
});
