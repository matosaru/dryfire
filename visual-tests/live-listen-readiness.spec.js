import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { installSyntheticMedia } from './media.js';
const library = JSON.parse(readFileSync(new URL('./fixtures/library.json', import.meta.url)));

async function openLibrary(page, triggerSamples) {
  await page.addInitScript(installSyntheticMedia);
  page.on('dialog', dialog => dialog.accept());
  const backup = structuredClone(library);
  let seen = 0;
  backup.examples = backup.examples.filter(row => row.gunId !== backup.activeGunId || (row.label === 'trigger' && seen++ < triggerSamples));
  await page.goto('/');
  await page.locator('#restoreGunBackupBtn').click();
  await page.locator('#importFile').setInputFiles({ name: 'readiness-library.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.locator('#homeView')).toBeVisible();
}

for (const count of [0, 2]) test(`all Live Listen entries open the same setup guidance with ${count} trigger samples`, async ({ page }) => {
  await openLibrary(page, count);
  for (let visit = 0; visit < 2; visit++) {
    // Second pass also exercises the shared React chrome/page owners.
    await page.locator('#aboutBtn').click(); await page.locator('#contactBtn').click();
    await page.locator('.tab[data-view="home"]').click();
    await expect(page.locator('#homeListenBtn')).toBeEnabled();
    await page.locator('#homeListenBtn').click();
    await expect(page.locator('#recognizeView')).toBeVisible();
    await expect(page.locator('#listenBtn')).toBeDisabled();
    await expect(page.locator('#singleShotBtn')).toBeDisabled();
    await expect(page.locator('#trainingSummary')).toContainText(`${count}/3`);
    await expect(page.locator('#trainingSummary')).toContainText('Learn');
    await expect(page.locator('#safetyModal')).not.toBeVisible();
    await page.locator('.tab[data-view="drills"]').click();
    await expect(page.locator('#freeListenBtn')).toBeEnabled();
    await page.locator('#freeListenBtn').click(); await expect(page.locator('#recognizeView')).toBeVisible();
    await page.locator('.tab[data-view="home"]').click();
    await expect(page.locator('.tab[data-view="recognize"]')).toBeEnabled();
    await page.locator('.tab[data-view="recognize"]').click(); await expect(page.locator('#recognizeView')).toBeVisible();
  }
});

test('three trigger samples enable capture without requiring optional sounds', async ({ page }) => {
  await openLibrary(page, 3);
  await expect(page.locator('#homeListenBtn')).toBeEnabled();
  await page.locator('#homeListenBtn').click();
  await expect(page.locator('#listenBtn')).toBeEnabled();
  await expect(page.locator('#singleShotBtn')).toBeEnabled();
  await expect(page.locator('#trainingSummary')).toContainText('Ready');
});

test('readiness follows the selected gun and recovers after its trigger recordings are reset', async ({page}) => {
  await openLibrary(page,3);
  await page.locator('#gunSwitcherBtn').click(); await page.locator('[data-gun-id="qa-gun-c"]').click();
  await expect(page.locator('#activeGunName')).toHaveText('QA Shotgun');
  await page.locator('.tab[data-view="home"]').click();await expect(page.locator('#homeListenBtn')).toBeEnabled();await page.locator('#homeListenBtn').click();
  await expect(page.locator('#trainingSummary')).toContainText('0/3');await expect(page.locator('#listenBtn')).toBeDisabled();
  await page.locator('#gunSwitcherBtn').click();await page.locator('[data-gun-id="qa-gun-b"]').click();
  await page.locator('.tab[data-view="recognize"]').click();await expect(page.locator('#listenBtn')).toBeEnabled();
  await page.locator('.tab[data-view="learn"]').click();await page.locator('[data-sound-label="trigger"] .reset-class').click();
  await expect(page.locator('[data-sound-label="trigger"] .progress-label')).toContainText('0 / 10');
  await page.locator('.tab[data-view="recognize"]').click();await expect(page.locator('#trainingSummary')).toContainText('0/3');await expect(page.locator('#listenBtn')).toBeDisabled();
  await page.locator('.tab[data-view="home"]').click();await expect(page.locator('#homeListenBtn')).toBeEnabled();
});

test('connection guidance disables capture and an active listener always retains Stop',async({page})=>{
  await openLibrary(page,3);
  await page.evaluate(()=>{const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=(...args)=>new Promise((resolve,reject)=>{window.__releaseMicrophone=()=>original(...args).then(resolve,reject);});});
  await page.locator('#homeListenBtn').click();await page.locator('#listenBtn').click();
  await expect(page.locator('#safetyModal')).toBeVisible();await page.locator('#safetyModalAck').check();await page.locator('#safetyConfirmBtn').click();
  await expect(page.locator('#trainingSummary')).toContainText('Connecting');await expect(page.locator('#listenBtn')).toBeDisabled();await expect(page.locator('#singleShotBtn')).toBeDisabled();
  await page.evaluate(()=>window.__releaseMicrophone());
  await expect(page.locator('#listenBtn')).toHaveText('Stop listening');await expect(page.locator('#listenBtn')).toBeEnabled();await expect(page.locator('#singleShotBtn')).toBeDisabled();
  await expect.poll(()=>page.evaluate(()=>window.__visualAudio.inputActive())).toBe(true);
  await page.locator('#listenBtn').click();await expect.poll(()=>page.evaluate(()=>window.__visualAudio.inputActive())).toBe(false);
  await expect(page.locator('#listenBtn')).toBeEnabled();await expect(page.locator('#singleShotBtn')).toBeEnabled();await expect(page.locator('#trainingSummary')).toContainText('Ready');
});
