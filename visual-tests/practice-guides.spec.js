import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { installSyntheticMedia } from './media.js';
const library = JSON.parse(readFileSync(new URL('./fixtures/library.json', import.meta.url)));

async function openLibrary(page, theme = 'dark', synthetic = false) {
  if (synthetic) await page.addInitScript(installSyntheticMedia);
  else await page.addInitScript(() => {
    window.__guideMicRequests = 0;
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: {
      getUserMedia: () => { window.__guideMicRequests++; return Promise.reject(new Error('Guide must not acquire a microphone')); },
      getSupportedConstraints: () => ({}),
    } });
  });
  await page.goto('/'); await expect(page.locator('#gunSetupView')).toBeVisible();
  await page.locator('#restoreGunBackupBtn').click();
  const backup = structuredClone(library); backup.settings.appearance = theme;
  page.on('dialog', dialog => dialog.accept());
  await page.locator('#importFile').setInputFiles({ name: 'guide-library.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.locator('#homeView')).toBeVisible();
}
async function practice(page, mode = 'single') {
  await page.locator('.tab[data-view="drills"]').click();
  await page.locator(`[data-practice-mode="${mode}"]`).click();
  await expect(page.locator('#practiceConfigure')).toBeVisible();
}

test('all six guides preserve invalid and unsaved setup values, without microphone or safety prompts', async ({ page }) => {
  await openLibrary(page);
  for (const mode of ['single', 'repeated', 'par', 'control', 'reload', 'free']) {
    await practice(page, mode);
    const count = mode === 'free' ? '#practiceDuration' : '#practiceRepetitions';
    await page.locator(count).fill('17'); await page.locator('#practiceMinDelay').fill('');
    await page.locator('#practiceGuideLink').click();
    await expect(page.locator('#practiceGuideView')).toBeVisible();
    await expect(page.locator('#practiceGuideSteps li')).toHaveCount(3);
    await expect(page.getByLabel('Beta version', { exact: true })).toBeVisible();
    await expect(page.locator('.tab[data-view="drills"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#safetyModal')).not.toBeVisible();
    await expect(page.locator('#safetyAck')).not.toBeChecked();
    await page.locator('#practiceGuideReturnBtn').click();
    await expect(page.locator('#practiceConfigure')).toBeVisible();
    await expect(page.locator(count)).toHaveValue('17'); await expect(page.locator('#practiceMinDelay')).toHaveValue('');
  }
  expect(await page.evaluate(() => window.__guideMicRequests)).toBe(0);
});

test('browser Back/Forward restores the same setup and guide; refresh does not restart capture', async ({ page }) => {
  await openLibrary(page); await practice(page);
  await page.locator('#practiceRepetitions').fill('23'); await page.locator('#practiceGuideLink').click();
  await expect(page.locator('#practiceGuideView')).toBeVisible(); await page.goBack();
  await expect(page.locator('#practiceConfigure')).toBeVisible(); await expect(page.locator('#practiceRepetitions')).toHaveValue('23');
  await page.goForward(); await expect(page.locator('#practiceGuideView')).toBeVisible();
  await page.reload(); await expect(page.locator('#homeView')).toBeVisible();
  expect(await page.evaluate(() => window.__guideMicRequests)).toBe(0);
});

test('animation is initially static, pauses, resumes, stops at review and offers replay', async ({ page }) => {
  await openLibrary(page); await page.clock.install(); await practice(page);
  await page.locator('#practiceGuideLink').click(); await expect(page.locator('#practiceGuideView')).toBeVisible();
  await expect(page.locator('#example-practiceStopBtn')).toBeVisible();
  await expect(page.locator('#example-practiceLevelPanel')).toBeVisible();
  await expect(page.locator('#example-practiceCompleted')).toHaveText('1');
  await expect(page.locator('#example-practiceShots')).toHaveText('1');
  const pixels = () => page.locator('#practiceGuideExample').evaluate(el => el.innerHTML);
  const poster = await pixels(); await page.clock.runFor(500); expect(await pixels()).toBe(poster);
  await page.locator('#practiceGuidePlayBtn').click(); await page.clock.runFor(1700);
  expect(await pixels()).not.toBe(poster); await page.locator('#practiceGuidePlayBtn').click();
  const paused = await pixels(); await page.clock.runFor(700); expect(await pixels()).toBe(paused);
  await expect(page.locator('#practiceGuidePlayBtn')).toHaveText('Resume example');
  await page.locator('#practiceGuidePlayBtn').click(); await page.clock.runFor(10000);
  await expect(page.locator('#practiceGuidePlayBtn')).toHaveText('Replay example');
  await expect(page.locator('#example-practiceReview')).toBeVisible();
  await expect(page.locator('#example-practiceSaved')).toHaveText('Example only · nothing saved');
  await page.locator('#practiceGuideEarlyBtn').click(); await expect(page.locator('#practiceGuideEarlyBtn')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#practiceGuideExample')).toHaveAttribute('aria-label', /early trigger fails with zero shots/);
  await expect(page.locator('#practiceGuidePlayBtn')).toHaveText('Play example');
  expect(await page.evaluate(() => window.__guideMicRequests)).toBe(0);
});

test('actual Reload endpoints and external/silent setup descriptions are retained', async ({ page }) => {
  await openLibrary(page); await practice(page, 'reload');
  await page.locator('#practiceReloadStart').selectOption('trigger'); await page.locator('#practiceReloadEnd').selectOption('draw');
  await page.locator('#practiceStartSource').selectOption('external'); await page.locator('#practiceGuideLink').click();
  await expect(page.locator('#practiceGuideSequence')).toContainText('Trigger pull');
  await expect(page.locator('#practiceGuideSequence')).toContainText('Draw from holster');
  await expect(page.locator('#practiceGuideCurrentSetup')).toContainText('no app countdown');
  await page.locator('#practiceGuideReturnBtn').click(); await expect(page.locator('#practiceReloadStart')).toHaveValue('trigger');
  await expect(page.locator('#practiceReloadEnd')).toHaveValue('draw');
  await page.locator('#practiceStartSource').selectOption('app'); await page.locator('#practiceStartSound').uncheck();
  await page.locator('#practiceGuideLink').click(); await expect(page.locator('#practiceGuideCurrentSetup')).toContainText('silent visual start');
  await page.locator('#practiceGuideReturnBtn').click(); await page.locator('#practiceReloadEnd').selectOption('trigger');
  await page.locator('#practiceGuideLink').click(); await expect(page.locator('#practiceGuideRequires')).toContainText('two different endpoints');
});

test('built-in and existing custom sequence guides keep their actual steps and edited values', async ({ page }) => {
  await openLibrary(page); await page.locator('.tab[data-view="drills"]').click();
  await page.locator('#drillCatalog .preset-card').nth(1).getByRole('button', { name: 'Start Drill' }).click();
  await expect(page.locator('#sessionConfigure')).toBeVisible(); await page.locator('#sessionRepetitions').fill('29');
  await page.locator('#sessionGuideLink').click(); await expect(page.locator('#practiceGuideKind')).toHaveText('ORDERED SEQUENCE GUIDE');
  await expect(page.locator('#practiceGuideSequence .preset-chip')).toHaveText(['Rack slide', 'Trigger pull']);
  await page.locator('#practiceGuideReturnBtn').click(); await expect(page.locator('#sessionRepetitions')).toHaveValue('29');
  await page.locator('.tab[data-view="drills"]').click(); await page.locator('#customDrillsTab').click();
  await page.locator('#customDrillCatalog').getByRole('button', { name: 'Start Drill' }).first().click();
  await page.locator('#sessionGuideLink').click(); await expect(page.locator('#practiceGuideName')).toHaveText('QA saved sequence');
  const preset = library.gunSettings.find(row => row.gunId === library.activeGunId && row.key === 'customDrills').value[0];
  await expect(page.locator('#practiceGuideSequence .preset-chip')).toHaveText(preset.steps.map(s => ({ draw: 'Draw from holster', rack: 'Rack slide', trigger: 'Trigger pull', reload: 'Change magazine' })[s]));
  expect(await page.evaluate(() => window.__guideMicRequests)).toBe(0);
});

test('a forced guide click cannot leave a pending microphone start', async ({ page }) => {
  await openLibrary(page); await practice(page);
  await page.evaluate(() => { navigator.mediaDevices.getUserMedia = () => { window.__guideMicRequests++; return new Promise(() => {}); }; });
  await page.locator('#practiceStartBtn').click(); await page.locator('#safetyModalAck').check(); await page.locator('#safetyConfirmBtn').click();
  await expect.poll(() => page.evaluate(() => window.__guideMicRequests)).toBe(1);
  await expect(page.locator('#practiceGuideLink')).not.toBeVisible();
  await page.locator('#practiceGuideLink').dispatchEvent('click');
  await expect(page.locator('#practiceGuideView')).not.toBeVisible();
  await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'connecting');
});

test('an old guide history entry cannot reopen a setup guide after practice has started', async ({ page }) => {
  await openLibrary(page, 'dark', true);
  const now = new Date('2026-10-11T11:00:00Z'); await page.clock.install({ time: now }); await page.clock.pauseAt(now);
  await practice(page);
  await page.locator('#practiceDelayMode').selectOption('fixed'); await page.locator('#practiceFixedDelay').fill('0');
  await page.locator('#practiceStartSound').uncheck();
  await page.locator('#practiceGuideLink').click(); await expect(page.locator('#practiceGuideView')).toBeVisible();
  await page.locator('#practiceGuideReturnBtn').click(); await expect(page.locator('#practiceConfigure')).toBeVisible();
  await page.locator('#practiceStartBtn').click(); await page.locator('#safetyModalAck').check(); await page.locator('#safetyConfirmBtn').click();
  await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'countdown');
  await page.clock.runFor(160); await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'active');
  await page.goForward(); await expect(page.locator('#drillsView')).toBeVisible();
  await expect(page.locator('#practiceGuideView')).not.toBeVisible();
  expect(await page.evaluate(() => window.__visualAudio.inputActive())).toBe(false);
  await page.locator('.tab[data-view="history"]').click();
  await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(6);
});
