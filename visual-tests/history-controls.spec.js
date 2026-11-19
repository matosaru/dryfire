import { installPausedClock } from './clock.js';
import { edition } from './catalog.js';
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { installSyntheticMedia } from './media.js';

const library = readFileSync(new URL('./fixtures/library.json', import.meta.url));

test('narrow History retains readable choices and working native filters', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.addInitScript(installSyntheticMedia);
  await installPausedClock(page);
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/');
  await page.locator('#restoreGunBackupBtn').click();
  await page.locator('#importFile').setInputFiles({ name: 'fixture.json', mimeType: 'application/json', buffer: library });
  await expect(page.locator('#homeView')).toBeVisible();
  await page.locator('.tab[data-view="history"]').click();
  await page.clock.runFor(100);
  await page.locator('.tab[data-view="home"]').click();
  await page.locator('.tab[data-view="history"]').click();
  await expect(page.locator('#historyView')).toHaveAttribute('data-react-history', '');
  if (edition === 'public') {
    await expect(page.locator('#progressSection')).not.toBeVisible();
    await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);
    await expect(page.locator('#historyList select').first()).toBeVisible();
    expect(await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - innerWidth)).toBe(0);
    return;
  }
  const group = page.getByRole('combobox', { name: 'Comparable drill and settings' });
  await expect(group).toBeEnabled();
  await expect(group.locator('option', { hasText: 'Single trigger press · App beep · 2–5s random' })).toHaveCount(1);
  await expect(page.locator('.progress-stats strong').first()).toHaveText('4');
  // Exercise the real native control and its change handler, not a CSS-only mock.
  await group.focus();
  await expect(group).toBeFocused();
  await group.selectOption({ label: 'Par-time practice · Silent start · 0s fixed · 1s par' });
  await expect(page.locator('.progress-stats')).toContainText('Hit rate');
  await expect(page.locator('.progress-stats strong').first()).toHaveText('1');
  await page.getByRole('combobox', { name: 'Time range' }).selectOption('7');
  await expect(page.locator('.progress-stats strong').first()).toHaveText('1');
  await group.selectOption({ label: 'Single trigger press · App beep · 2–5s random' });
  await expect(page.locator('.progress-stats')).toContainText('Median timing');
  await expect(page.locator('.progress-stats strong').first()).toHaveText('4');
  await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);
  expect(await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - innerWidth)).toBe(0);
});

test('History deletes one saved session and one recognition result without clearing their lists', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(installSyntheticMedia);
  await installPausedClock(page);
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/');
  await page.locator('#restoreGunBackupBtn').click();
  await page.locator('#importFile').setInputFiles({ name: 'fixture.json', mimeType: 'application/json', buffer: library });
  await expect(page.locator('#homeView')).toBeVisible();
  await page.locator('.tab[data-view="history"]').click();
  await page.clock.runFor(100);
  await page.locator('.tab[data-view="home"]').click();
  await page.locator('.tab[data-view="history"]').click();
  await expect(page.locator('#historyView')).toHaveAttribute('data-react-history', '');
  const sessions = page.locator('#savedSessions .saved-session-card');
  const events = page.locator('#historyList .history-item');
  const sessionCount = await sessions.count();
  const eventCount = await events.count();
  await sessions.first().getByRole('button', { name: /^Delete / }).click();
  await expect(sessions.first()).toContainText('Delete this saved session?');
  await sessions.first().getByRole('button', { name: /^Cancel deleting/ }).click();
  await expect(sessions).toHaveCount(sessionCount);
  await sessions.first().getByRole('button', { name: /^Delete / }).click();
  await sessions.first().getByRole('button', { name: /^Confirm deleting/ }).click();
  await expect(sessions).toHaveCount(sessionCount - 1);
  await events.first().getByRole('button', { name: /^Delete / }).click();
  await events.first().getByRole('button', { name: /^Confirm deleting/ }).click();
  await expect(events).toHaveCount(eventCount - 1);
});
