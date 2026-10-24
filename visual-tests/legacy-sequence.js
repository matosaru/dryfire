// Reach the retired catalog choice through its supported saved-session flow.
import { createSession, endSession, toSessionRecord } from '../src/drillSession.js';
import { getDrill } from '../src/drills.js';
export function addLegacySequence(backup) {
  const gun = backup.guns.find(item => item.id === backup.activeGunId);
  const state = createSession({ id: 'legacy-trigger-review', gun, drill: getDrill('trigger-only'),
    monoNow: 0, epochNow: Date.parse('2026-10-11T10:00:00Z'), randomValue: 0 });
  backup.sessions.push(toSessionRecord(endSession(state, { monoNow: 0, epochNow: state.startedAt })));
}
export async function openLegacySequence(page) {
  await page.locator('.tab[data-view="history"]').click();
  await page.locator('#savedSessions .saved-session-card').filter({ has: page.getByText('Trigger pull', { exact: true }) }).getByRole('button').click();
  await page.locator('#repeatSessionBtn').click();
  await page.locator('#sessionConfigure').waitFor({ state: 'visible' });
}
