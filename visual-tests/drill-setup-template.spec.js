import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {installSyntheticMedia} from './media.js';
const library=JSON.parse(readFileSync(new URL('./fixtures/library.json',import.meta.url)));
for(const width of [320,390])test(`shared trigger setup preserves controls, draft and Sequence card geometry at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.addInitScript(installSyntheticMedia);page.on('dialog',d=>d.accept());await page.goto('/');await page.locator('#restoreGunBackupBtn').click();await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(library))});await expect(page.locator('#homeView')).toBeVisible();
 for(const mode of ['single','repeated','par','control']){
  await page.locator('.tab[data-view="drills"]').click();await page.locator(`[data-practice-mode="${mode}"]`).click();await expect(page.locator('#practiceConfigure')).toBeVisible();
  await expect(page.locator('#practiceCountRow')).toHaveClass(/session-repetition-field/);await expect(page.locator('#practiceSteps')).toHaveClass('drill-steps session-sequence');await expect(page.locator('#practiceSteps > li.drill-step')).toHaveCount(1);
  if(mode==='par')await expect(page.locator('#practiceParRow')).toBeVisible();else await expect(page.locator('#practiceParRow')).not.toBeVisible();
  await page.locator('#practiceDelayMode').selectOption('fixed');await expect(page.locator('#practiceFixedRow')).toBeVisible();await expect(page.locator('#practiceRandomFields')).not.toBeVisible();
  await page.locator('#practiceStartSource').selectOption('external');await expect(page.locator('#practiceAppTiming')).not.toBeVisible();await expect(page.locator('#practiceStartSound')).not.toBeVisible();await expect(page.locator('#practiceCueNote')).toContainText('calibrated beep');
  await page.locator('#practiceStartSource').selectOption('app');await expect(page.locator('#practiceStartSound')).toBeVisible();await page.locator('#practiceDelayMode').selectOption('random');await expect(page.locator('#practiceRandomFields')).toBeVisible();
  await page.locator('#practiceRepetitions').fill('');await page.locator('#practiceGuideLink').click();await expect(page.locator('#practiceGuideView')).toBeVisible();await page.locator('#practiceGuideBackBtn').click();await expect(page.locator('#practiceRepetitions')).toHaveValue('');await expect(page.locator('#practiceStartBtn')).toBeDisabled();await page.locator('#practiceRepetitions').fill('10');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(0);
 }
});
