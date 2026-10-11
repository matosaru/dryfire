import { progressGroups, progressSummary, summarize } from '../src/practiceProgress.js';
const config = { startSource: 'app', soundAtStart: true, delayMode: 'random', randomMinSeconds: 2, randomMaxSeconds: 5, parSeconds: 1.5 };
const row = (elapsedMs, status = 'hit', extra = {}) => ({ elapsedMs, status, intervalMs: null, stepTimings: [{ splitMs: elapsedMs }], ...extra });
const record = (id, values, extra = {}) => ({ id, gunId: 'a', kind: 'practice', practiceMode: 'single', drillTitle: 'Single', drillSteps: ['trigger'], config,
  status: 'completed', startedAt: Number(id) * 86400000, repetitions: values.map(value => row(value)), shots: values.length, elapsedMs: 60000, ...extra });
test('median, mean and population variation use finite completed samples only', () => {
  expect(summarize([100, 200, 900, NaN, null])).toMatchObject({ count: 3, median: 200, mean: 400, min: 100, max: 900 });
  expect(summarize([])).toMatchObject({ count: 0, median: null });
});
test('progress remains gun-owned and separates materially different drills/settings', () => {
  const groups = progressGroups([record('1', [100]), record('2', [100], { gunId: 'b' }), record('3', [100], { config: { ...config, soundAtStart: false } }),
    record('4', [100], { status: 'running' }), record('5', [100], { drillSteps: ['rack', 'trigger'] })], 'a');
  expect(groups).toHaveLength(3); expect(groups.flatMap(group => group.records)).toHaveLength(3);
});
test('four comparable sessions show faster timing without including partial rows', () => {
  const records = [record('1', [1000, 1200]), record('2', [1000]), record('3', [700]), record('4', [600], { status: 'interrupted', repetitions: [row(600), row(1, 'partial')] })];
  const stats = progressSummary(progressGroups(records, 'a')[0]);
  expect(stats.trend).toMatchObject({ before: 1050, after: 650, direction: 'lower', compared: 2 });
  expect(stats.metrics.count).toBe(5); expect(stats.hits).toBe(5);
});
test('par misses remain in hit rate even when only successful timings improve', () => {
  const r = record('1', [], { practiceMode: 'par', repetitions: [row(300), row(null, 'miss'), row(null, 'miss')] });
  const stats = progressSummary(progressGroups([r], 'a')[0]);
  expect(stats.hitRate).toBeCloseTo(100 / 3); expect(stats.metrics.median).toBe(300); expect(stats.misses).toBe(2); expect(stats.trend).toBeNull();
});
test('repeated/control use intervals, reload uses endpoint split, free uses active rate', () => {
  const repeated = record('1', [], { practiceMode: 'repeated', repetitions: [row(100), row(500, 'hit', { intervalMs: 400 }), row(1100, 'hit', { intervalMs: 600 })] });
  expect(progressSummary(progressGroups([repeated], 'a')[0]).metrics.median).toBe(500);
  expect(progressSummary(progressGroups([{ ...repeated, practiceMode: 'control' }], 'a')[0]).points[0].value).toBe(100);
  const reload = record('1', [], { practiceMode: 'reload', repetitions: [row(1200, 'hit', { stepTimings: [{ splitMs: 500 }, { splitMs: 700 }] })] });
  expect(progressSummary(progressGroups([reload], 'a')[0]).metrics.median).toBe(700);
  expect(progressSummary(progressGroups([record('1', [], { practiceMode: 'free', shots: 12, elapsedMs: 120000 })], 'a')[0]).rate).toBe(6);
});
test('range filtering, zero-rate and insufficient-data states are truthful', () => {
  const group = progressGroups([record('1', [1000]), record('20', [500])], 'a')[0];
  const stats = progressSummary(group, { days: 7, now: 21 * 86400000 });
  expect(stats.sessions).toBe(1); expect(stats.points[0].value).toBe(500); expect(stats.trend).toBeNull();
  expect(progressSummary(group, { days: 1, now: 100 * 86400000 }).points).toEqual([]);
});
