/** Install before the target instant, then freeze exactly at the reviewed time.
 * Installing at the pause target races elapsed protocol time in WebKit. No
 * practice is running when callers install this clock; screenshot dates stay exact. */
export async function installPausedClock(page, time = new Date('2026-10-11T11:00:00Z')) {
  const target = new Date(time);
  await page.clock.install({ time: new Date(target.getTime() - 60_000) });
  await page.clock.pauseAt(target);
}
