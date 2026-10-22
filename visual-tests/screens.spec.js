import { installPausedClock } from './clock.js';
import { addLegacySequence, openLegacySequence } from './legacy-sequence.js';
import {freezeMotionArtwork} from './motion-fixture.js';
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { cases, baselineName } from './catalog.js';
import { installSyntheticMedia } from './media.js';

const library = JSON.parse(readFileSync(new URL('./fixtures/library.json', import.meta.url)));
const environment = JSON.parse(readFileSync(new URL('./environment.json', import.meta.url)));
const visible = async (page, id) => expect(page.locator(`#${id}`)).toBeVisible();
const tab = async (page, name) => { await page.locator(`.tab[data-view="${name}"]`).click(); await visible(page, `${name}View`); };
const practice = async (page, mode = 'single') => { await tab(page, 'drills'); await page.locator(`[data-practice-mode="${mode}"]`).click(); await visible(page, 'practiceConfigure'); };
const session = openLegacySequence;

async function confirmSafety(page) {
  await visible(page, 'safetyModal');
  await page.locator('#safetyModalAck').check();
  await page.locator('#safetyConfirmBtn').click();
  await expect(page.locator('#safetyModal')).not.toBeVisible();
}
async function startPractice(page, countdown = false, repetitions) {
  await practice(page);
  if (repetitions) { await page.locator('#practiceRepetitions').fill(String(repetitions)); await page.locator('#practiceRepetitions').dispatchEvent('change'); }
  if (!countdown) {
    await page.locator('#practiceDelayMode').selectOption('fixed');
    await page.locator('#practiceFixedDelay').fill('0');
    await page.locator('#practiceFixedDelay').dispatchEvent('change');
    await page.locator('#practiceStartSound').uncheck();
  }
  await page.locator('#practiceStartBtn').click();
  await confirmSafety(page);
  await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'countdown');
  await expect(page.locator('#practicePauseBtn')).toBeEnabled();
  if (!countdown) { await page.clock.runFor(80); await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'active'); }
}
async function emit(page, label = 'trigger') {
  await page.clock.runFor(1000);
  await page.evaluate(label => window.__visualAudio.emit(label), label);
}

async function prepare(page, item) {
  page.on('dialog', dialog => dialog.accept());
  await page.addInitScript(installSyntheticMedia);
  // External SVG documents can retain their own CSS/SMIL animation clock.
  // Freeze the existing artwork at its initial frame without changing its shapes.
  await freezeMotionArtwork(page);
  await installPausedClock(page, environment.clock);
  if (item.edition === 'preview' && item.state.startsWith('preview-free')) await page.addInitScript(() => localStorage.setItem('dryfire-private-preview-mode', 'free'));
  await page.goto('/');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await visible(page, 'gunSetupView');
  if (item.state !== 'first-gun.dark') {
    const backup = structuredClone(library);
    if (item.screen === 'session' || item.state.startsWith('sequence-trigger-only')) addLegacySequence(backup);
    backup.settings.appearance = item.state.endsWith('.light') ? 'light' : 'dark';
    if (item.state.startsWith('add-second-gun')) {
      backup.guns = backup.guns.filter(gun => gun.id === backup.activeGunId);
      for (const key of ['examples', 'events', 'sessions', 'gunSettings']) backup[key] = backup[key].filter(row => row.gunId === backup.activeGunId);
    }
    if (item.state === 'recording-limit.dark') {
      const example = backup.examples.find(row => row.gunId === backup.activeGunId && row.label === 'trigger');
      const count = backup.examples.filter(row => row.gunId === backup.activeGunId && row.label === 'trigger').length;
      for (let i = count; i < 10; i++) backup.examples.push({ ...example, id: `visual-cap-${i}` });
    }
    await page.locator('#restoreGunBackupBtn').click();
    await visible(page, 'settingsView');
    await page.locator('#importFile').setInputFiles({ name: 'synthetic-library.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
    await visible(page, 'homeView');
    await expect(page.locator('#activeGunName')).toHaveText('QA Handgun');
  }
  switch (item.screen) {
    case 'gunSetup':
      if (item.state.startsWith('first-gun')) break;
      await page.locator('#gunSwitcherBtn').click(); await visible(page, 'gunsView');
      await page.locator(item.state.startsWith('add-') ? '#addGunBtn' : '[data-edit-gun-id="qa-gun-a"]').click();
      await expect(page.locator('#gunName')).toHaveValue(item.state.startsWith('add-') ? '' : 'QA Handgun');
      break;
    case 'home': break;
    case 'guns':
      await page.locator('#gunSwitcherBtn').click(); await visible(page, 'gunsView');
      await expect(page.locator('#gunList .gun-profile')).toHaveCount(3);
      if (item.state.startsWith('deleted')) {
        await page.locator('[data-delete-gun-id="qa-gun-b"]').click();
        await expect(page.locator('[data-delete-gun-id="qa-gun-b"]')).toHaveCount(0);
        await expect(page.locator('#gunCapacity')).toContainText(item.edition === 'public' ? '2 saved guns' : '2 of');
        await expect(page.locator('#gunList .gun-profile')).toHaveCount(2);
      }
      break;
    case 'learn':
      await tab(page, 'learn');
      if (item.state.startsWith('optional-sounds')) await page.locator('details.optional-sounds').nth(0).locator('summary').click();
      if (item.state.startsWith('calibration')) await page.locator('details.optional-sounds').nth(1).locator('summary').click();
      if (item.state.startsWith('recording-limit')) await expect(page.locator('[data-sound-label="trigger"] .record-example')).toBeDisabled();
      break;
    case 'drills':
      await tab(page, 'drills');
      await expect(page.locator('[data-practice-mode]')).toHaveCount(4);
      await expect(page.locator('#drillCatalog .preset-card')).toHaveCount(3);
      if (item.state.startsWith('custom')) await page.locator('#customDrillsTab').click();
      if (item.state.startsWith('custom-editor')) {
        await page.locator('#newCustomDrillBtn').click(); await page.locator('#customDrillName').fill('Draw and press');
        for (const label of ['draw', 'trigger']) { await page.locator('#customAction').selectOption(label); await page.locator('#addCustomActionBtn').click(); }
      }
      if (item.state.startsWith('edit-custom')) {
        await page.locator('#customDrillsTab').click();
        await page.locator('#customDrillCatalog').getByRole('button', { name: 'Edit sequence' }).click();
        await expect(page.locator('#customDrillName')).toHaveValue('QA saved sequence');
      }
      break;
    case 'practice':
      if (item.state.startsWith('configure-')) { await practice(page, item.state.split('.')[0].replace('configure-', '')); break; }
      if (item.state.startsWith('early-review')) {
        await startPractice(page, true, 1); await emit(page);
        await expect(page.locator('#practiceReview')).toBeVisible();
        await expect(page.locator('#practiceResults')).toContainText('Miss · early trigger');
        await expect(page.locator('#practiceSaved')).toHaveText('Saved on this device'); break;
      }
      if (item.state.startsWith('review')) {
        await tab(page, 'history'); await page.locator('#savedSessions .saved-session-card').filter({ hasText: 'Single trigger press' }).first().getByRole('button').click();
        await expect(page.locator('#practiceSaved')).toHaveText('Saved on this device'); break;
      }
      await startPractice(page, item.state.startsWith('countdown'));
      if (item.state.startsWith('active')) { await emit(page, 'unknown'); await expect(page.locator('#practiceLevelMeter')).not.toHaveAttribute('aria-valuenow', '0'); await expect(page.locator('#practiceStopBtn')).toBeVisible(); }
      if (item.state.startsWith('paused')) { await page.locator('#practicePauseBtn').click(); await expect(page.locator('#practiceRun')).toHaveAttribute('data-phase', 'paused'); }
      break;
    case 'session':
      await session(page);
      if (item.state.startsWith('configure')) break;
      await page.locator('#sessionFixedDelay').fill('0'); await page.locator('#sessionFixedDelay').dispatchEvent('change');
      await page.locator('#sessionStartSound').uncheck();
      if (item.state.startsWith('review')) { await page.locator('#sessionRepetitions').fill('1'); await page.locator('#sessionRepetitions').dispatchEvent('change'); }
      await page.locator('#sessionStartBtn').click(); await confirmSafety(page);
      await expect(page.locator('#sessionCountdown')).toHaveText('GO');
      await expect(page.locator('#pauseSessionBtn')).toBeEnabled();
      const sessionGo = await page.evaluate(() => window.__visualAudio.nowMs());
      await page.clock.runFor(80);
      if (item.state.startsWith('paused')) { await page.locator('#pauseSessionBtn').click(); await expect(page.locator('#sessionCountdown')).toHaveText('Paused'); }
      if (item.state.startsWith('review')) {
        await page.clock.runFor(1000); await page.evaluate(go => window.__visualAudio.emit('trigger', go + 500), sessionGo);
        await expect(page.locator('#sessionCompletedCount')).toHaveText('1');
        await expect(page.locator('#sessionAnnouncement')).toHaveText('Repetition completed and saved.');
        await page.clock.runFor(1100); await visible(page, 'sessionReview');
        await expect(page.locator('#sessionReview .session-saved-note')).toContainText('Saved');
      }
      break;
    case 'practiceGuide': {
      const state = item.state.split('.')[0];
      if (state.startsWith('sequence-')) {
        await tab(page, 'drills');
        if (state === 'sequence-custom') {
          await page.locator('#customDrillsTab').click();
          await page.locator('#customDrillCatalog').getByRole('button', { name: 'Start Drill' }).first().click();
        } else if (state === 'sequence-trigger-only') {
          await openLegacySequence(page);
        } else {
          const ids = ['rack-trigger', 'mag-trigger', 'draw-mag-trigger'];
          await page.locator('#drillCatalog .preset-card').nth(ids.indexOf(state.replace('sequence-', ''))).getByRole('button', { name: 'Start Drill' }).click();
        }
        await page.locator('#sessionGuideLink').click();
      } else {
        const mode = ['single-early', 'external-start', 'silent-start'].includes(state) ? 'single' : state;
        await practice(page, mode);
        if (state === 'external-start') await page.locator('#practiceStartSource').selectOption('external');
        if (state === 'silent-start') await page.locator('#practiceStartSound').uncheck();
        await page.locator('#practiceGuideLink').click();
      }
      await visible(page, 'practiceGuideView');
      if (state === 'single-early') await page.locator('#practiceGuideEarlyBtn').click();
      await expect(page.locator('#practiceGuideSteps li')).toHaveCount(3);
      await expect(page.locator('#practiceGuidePlayBtn')).toHaveText('Play example');
      break;
    }
    case 'recognize':
      await tab(page, 'recognize');
      if (item.state.startsWith('listening')) { await page.locator('#listenBtn').click(); await confirmSafety(page); await expect(page.locator('#listeningIndicator')).toContainText('Microphone active'); await emit(page); await expect(page.locator('#sessionTimeline li')).toHaveCount(1); }
      break;
    case 'history':
      await tab(page, 'history'); await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);
      if (item.state.startsWith('data-table')) await page.locator('.progress-data summary').click();
      if (item.state.startsWith('recognition-cleared')) { await page.locator('#clearHistoryBtn').click(); await expect(page.locator('#historyClearOutcome')).toContainText('was cleared'); await expect(page.locator('#historyList .history-item')).toHaveCount(0); }
      if (item.state.startsWith('sessions-cleared')) { await page.locator('#clearSessionsBtn').click(); await expect(page.locator('#sessionsClearOutcome')).toContainText('were cleared'); await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(0); }
      break;
    case 'settings':
      await page.locator('#settingsShortcut').click(); await visible(page, 'settingsView');
      if (item.state.startsWith('installation-help')) { await page.locator('.install-details summary').click(); await expect(page.locator('.install-card')).toBeVisible(); }
      if (item.state.startsWith('sounds-reset')) { await page.locator('#resetModelBtn').click(); await expect(page.locator('#soundResetOutcome')).toContainText('reset'); await expect(page.locator('#soundResetSummary')).toContainText('0 learned samples'); }
      break;
    case 'about':
      await page.locator('#aboutBtn').click(); await visible(page, 'aboutView');
      break;
    case 'contact':
      await page.locator('#contactBtn').click(); await visible(page, 'contactView');
      await expect(page.getByRole('link', { name: 'easydryfire@gmail.com', exact: true })).toHaveAttribute('href', 'mailto:easydryfire@gmail.com');
      break;
    case 'safety':
      await practice(page); await page.locator('#practiceStartBtn').click();
      await expect(page.locator('#safetyConfirmBtn')).toBeDisabled();
      break;
    default: throw new Error(`Missing visual setup for ${item.screen}`);
  }
  await visible(page, item.view); await visible(page, item.anchor);
}

for (const item of cases) {
  test(`${item.folder}/${item.state} at ${item.width}px`, async ({ page, browser }, testInfo) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: item.width, height: environment.viewport.height });
    await prepare(page, item);
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const images = [...document.images].filter(image => image.checkVisibility() && image.currentSrc);
      // Full-content capture must not depend on viewport-triggered lazy loading.
      for (const image of images) image.loading = 'eager';
      await Promise.all(images.map(image => image.decode()));
    });
    // Measure only after all asserted records, fonts and illustrations are ready.
    // The native safety modal keeps the mobile viewport to validate its real positioning.
    if (item.screen !== 'safety') {
      const height = await page.evaluate(() => Math.max(innerHeight, document.documentElement.scrollHeight));
      await page.setViewportSize({ width: item.width, height });
    }
    // Native WebKit controls paint a different accent in an inactive page.
    // Capture an explicitly active page, rather than depending on worker order.
    await page.bringToFront();
    // Set hover only after activating/resizing the native control surface.
    if (item.screen === 'practice' && item.state.startsWith('configure-')) {
      await page.mouse.move(0, 0);
      // Preserve reviewed native hover states by field, never source-card coordinates.
      if (item.width === 390 && item.state === 'configure-single.dark' && testInfo.project.name === 'chromium') await page.locator('#practiceRepetitions').hover();
      if (item.state === 'configure-repeated.dark' && testInfo.project.name === 'webkit') await page.locator('#practiceDelayMode').hover();
    }
    await expect.poll(() => page.evaluate(() => document.hasFocus())).toBe(true);
    if (item.screen === 'learn') expect(await page.locator('#learnView img').first().evaluate(image => image.currentSrc)).toMatch(/\.svg$/);
    const overflow = await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - innerWidth);
    const offenders = overflow > 0 ? await page.evaluate(() => [...document.querySelectorAll('*')]
      .filter(node => {
        if (!node.checkVisibility() || node.getBoundingClientRect().right <= innerWidth) return false;
        for (let parent = node.parentElement; parent; parent = parent.parentElement) {
          if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(parent).overflowX) && parent.getBoundingClientRect().right <= innerWidth) return false;
        }
        return true;
      })
      .map(node => ({ tag: node.tagName, id: node.id, class: node.getAttribute('class'), right: node.getBoundingClientRect().right,
        parent: node.parentElement?.className, text: node.textContent?.trim().slice(0, 70) }))
      .sort((a, b) => b.right - a.right).slice(0, 20)) : [];
    expect(overflow, `Horizontal overflow ${overflow}px; visible offenders: ${JSON.stringify(offenders)}`).toBeLessThanOrEqual(0);
    expect(errors, 'Unexpected browser errors').toEqual([]);
    await testInfo.attach('screen-state', { body: JSON.stringify({ ...item, viewport: page.viewportSize(), browser: testInfo.project.name, browserVersion: browser.version(), clock: environment.clock }), contentType: 'application/json' });
    if (process.env.VISUAL_DIFF_PROBE === '1') await page.addStyleTag({ content: '.button.primary{background:#ff00ff!important}' });
    await expect(page).toHaveScreenshot(baselineName(item).split('/'));
  });
}
