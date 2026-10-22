import { installPausedClock } from './clock.js';
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { installSyntheticMedia } from './media.js';
const library = readFileSync(new URL('./fixtures/library.json', import.meta.url));

async function configure(page, autoReady = true, delay = '1', handoff = false) {
  await page.addInitScript(installSyntheticMedia);
  if (!autoReady) await page.addInitScript(() => { window.__visualAudioAutoReady = false; });
  await installPausedClock(page);
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/');
  await page.locator('#restoreGunBackupBtn').click();
  await page.locator('#importFile').setInputFiles({ name: 'fixture.json', mimeType: 'application/json', buffer: library });
  await expect(page.locator('#homeView')).toBeVisible();
  await page.locator('.tab[data-view="drills"]').click();
  const loaded=handoff?page.waitForResponse(response=>/\/assets\/practiceContents-/.test(response.url())):null;
  await page.locator('[data-practice-mode="single"]').click();
  if(loaded){await loaded;await expect(page.locator('#practiceRun')).not.toHaveAttribute('data-react-session');await page.locator('#practiceBackBtn').click();await page.locator('[data-practice-mode="single"]').click();await expect(page.locator('#practiceRun')).toHaveAttribute('data-react-session','');await expect(page.locator('#practiceView')).toHaveAttribute('data-react-practice','');}
  await page.locator('#practiceDelayMode').selectOption('fixed');
  await page.locator('#practiceFixedDelay').fill(delay);
  await page.locator('#practiceFixedDelay').dispatchEvent('change');
  await page.locator('#practiceRepetitions').fill('2');
  await page.locator('#practiceRepetitions').dispatchEvent('change');
  await page.locator('#practiceStartBtn').click();
  await page.locator('#safetyModalAck').check();
  await page.locator('#safetyConfirmBtn').click();
}
const markInputReady = async page => {
  await expect.poll(() => page.evaluate(() => window.__visualAudio.inputActive())).toBe(true);
  await page.evaluate(() => window.__visualAudio.ready());
};
const countdown = async page => {
  await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'countdown');
  await expect(page.locator('#practicePauseBtn')).toBeEnabled();
};

test('countdown waits for real input and shows microphone before GO', async ({ page }) => {
  await configure(page, false);
  await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'connecting');
  await page.clock.runFor(1200);
  await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'connecting');
  expect(await page.evaluate(() => window.__visualAudio.cues)).toEqual([]);
  await markInputReady(page);
  await countdown(page);
  await expect(page.locator('#practiceSignal')).toHaveText('1');
  await expect(page.locator('#practiceLevelPanel')).toBeVisible();
  await expect(page.locator('#practiceStopBtn')).toBeVisible();
  await page.clock.runFor(1120);
  await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'active');
  expect(await page.evaluate(() => window.__visualAudio.cues.length)).toBe(1);
});

test('cancel during input preparation cannot start later', async ({ page }) => {
  await configure(page, false);
  await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'connecting');
  await page.locator('#practiceEndBtn').click();
  await expect(page.locator('#practiceConfigure')).toBeVisible();
  await page.clock.runFor(6000);
  await expect(page.locator('#practiceConfigure')).toBeVisible();
  expect(await page.evaluate(() => window.__visualAudio.cues)).toEqual([]);
  expect(await page.evaluate(() => window.__visualAudio.inputActive())).toBe(false);
});

test('missing microphone input times out, releases capture and explains the error', async ({ page }) => {
  await configure(page, false);
  await expect.poll(() => page.evaluate(() => window.__visualAudio.inputActive())).toBe(true);
  await page.clock.runFor(5500);
  await expect(page.locator('#practiceConfigure')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('No audio input arriving');
  expect(await page.evaluate(() => window.__visualAudio.inputActive())).toBe(false);
  expect(await page.evaluate(() => window.__visualAudio.cues)).toEqual([]);
});

test('early failure saves, automatically restarts and accepts the first 200 ms click', async ({ page }) => {
  await configure(page);
  await countdown(page);
  await page.clock.runFor(800);
  await page.evaluate(() => window.__visualAudio.emit('trigger'));
  await expect(page.locator('#practiceCompleted')).toHaveText('1');
  await expect(page.locator('#practiceLatest')).toContainText('Miss · early trigger');
  expect(await page.evaluate(() => window.__visualAudio.cues)).toEqual([]);
  await page.clock.runFor(80);
  await countdown(page);
  await page.clock.runFor(1120);
  await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'active');
  const go = await page.evaluate(() => window.__visualAudio.cues.at(-1));
  await page.clock.runFor(800);
  await page.evaluate(go => window.__visualAudio.emit('trigger', go + 200), go);
  await expect(page.locator('#practiceReview')).toBeVisible();
  await expect(page.locator('#practiceSaved')).toHaveText('Saved on this device');
  await expect(page.locator('#practiceSummary')).toContainText('1 accepted shots');
  await expect(page.locator('#practiceResults')).toContainText('Miss · early trigger');
  await page.reload();
  await page.locator('.tab[data-view="history"]').click();
  await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(6);
  await page.locator('#savedSessions .saved-session-card').first().getByRole('button').click();
  await expect(page.locator('#practiceResults')).toContainText('Miss · early trigger');
});

test('zero-delay automatic repetitions re-arm and accept successive clicks', async ({ page }) => {
  await configure(page, true, '0');
  await countdown(page);
  for (let i = 0; i < 2; i++) {
    await page.clock.runFor(80);
    await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'active');
    const go = await page.evaluate(() => window.__visualAudio.cues.at(-1));
    await page.clock.runFor(800);
    await page.evaluate(go => window.__visualAudio.emit('trigger', go + 200), go);
    if (i === 0) { await expect(page.locator('#practiceCompleted')).toHaveText('1'); await expect(page.locator('#practicePauseBtn')).toBeEnabled(); }
  }
  await expect(page.locator('#practiceReview')).toBeVisible();
  await expect(page.locator('#practiceSummary')).toContainText('2 accepted shots');
});


test('React run/review handoff retains microphone identity, readiness, pause/resume and review actions',async({page})=>{
 await configure(page,false,'1',true);
 const meter=await page.locator('#practiceLevelPanel').elementHandle();
 await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase','connecting');
 await markInputReady(page);await countdown(page);
 expect(await meter.evaluate(node=>node===document.getElementById('practiceLevelPanel'))).toBe(true);
 await page.clock.runFor(1120);await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase','active');
 await page.locator('#practicePauseBtn').click();await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase','paused');
 expect(await page.evaluate(()=>window.__visualAudio.inputActive())).toBe(false);
 await page.evaluate(()=>{
  const acquire=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia=(...args)=>new Promise(resolve=>{window.__releaseResumeInput=()=>resolve(acquire(...args));});
 });
 await page.locator('#practiceResumeBtn').click();
 await expect.poll(()=>page.evaluate(()=>typeof window.__releaseResumeInput)).toBe('function');
 await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase','connecting');
 expect(await page.evaluate(()=>window.__visualAudio.inputActive())).toBe(false);
 await page.evaluate(()=>window.__releaseResumeInput());await markInputReady(page);await countdown(page);
 await page.locator('#practiceStopBtn').click();await expect(page.locator('#practiceReview')).toBeVisible();
 await expect(page.locator('#practiceReview')).toHaveAttribute('data-react-session','');
 await expect(page.locator('#practiceSaved')).toHaveText('Saved on this device');
 await page.locator('#practiceDoneBtn').click();await expect(page.locator('#drillsView')).toBeVisible();
});
