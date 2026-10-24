const valid = value => Number.isFinite(value) && value >= 0;
export function summarize(values) {
  const data = values.filter(valid).sort((a, b) => a - b);
  if (!data.length) return { count: 0, median: null, mean: null, spread: null, min: null, max: null };
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  return { count: data.length, median: (data[Math.floor((data.length - 1) / 2)] + data[Math.floor(data.length / 2)]) / 2,
    mean, spread: Math.sqrt(data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / data.length), min: data[0], max: data.at(-1) };
}
function comparable(record) {
  const config = record.config, mode = record.kind === 'practice' ? record.practiceMode : 'sequence';
  return JSON.stringify([mode, record.drillSteps, config.startSource || 'app', config.soundAtStart,
    config.delayMode, config.delayMode === 'fixed' ? config.fixedDelaySeconds : [config.randomMinSeconds, config.randomMaxSeconds],
    mode === 'par' ? config.parSeconds : null]);
}
export function progressGroups(records, gunId) {
  const groups = new Map();
  for (const record of records.filter(row => row.gunId === gunId && !['running', 'paused'].includes(row.status)).sort((a, b) => a.startedAt - b.startedAt)) {
    const key = comparable(record), mode = record.kind === 'practice' ? record.practiceMode : 'sequence';
    if (!groups.has(key)) groups.set(key, { key, mode, title: record.drillTitle, config: record.config, records: [] });
    groups.get(key).records.push(record);
  }
  return [...groups.values()];
}
export function progressSummary(group, { days = 0, now = Date.now() } = {}) {
  const records = group.records.filter(row => !days || row.startedAt >= now - days * 86400000);
  const points = [], allSamples = []; let hits = 0, misses = 0, shots = 0;
  for (const record of records) {
    const rows = record.repetitions.filter(row => ['hit', 'miss', 'completed'].includes(row.status));
    const hitRows = rows.filter(row => row.status !== 'miss');
    const samples = hitRows.map(row => ['repeated', 'control'].includes(group.mode) ? row.intervalMs : row.elapsedMs).filter(valid);
    const stats = summarize(samples), hitCount = hitRows.length, missCount = rows.length - hitCount;
    hits += hitCount; misses += missCount; shots += record.shots || 0; allSamples.push(...samples);
    const value = group.mode === 'par' ? (rows.length ? hitCount / rows.length * 100 : null)
        : group.mode === 'control' ? (samples.length >= 2 ? stats.spread : null) : stats.median;
    if (valid(value)) points.push({ id: record.id, date: record.startedAt, value, count: samples.length,
      hits: hitCount, misses: missCount, ...stats });
  }
  const metrics = summarize(allSamples), unit = group.mode === 'par' ? '%' : 'ms';
  const metric = group.mode === 'par' ? 'Hit rate'
    : group.mode === 'control' ? 'Interval variation' : group.mode === 'repeated' ? 'Median click interval' : 'Median detected time';
  let trend = null;
  if (points.length >= 4) {
    const half = Math.floor(points.length / 2);
    const before = summarize(points.slice(0, half).map(row => row.value)).median;
    const after = summarize(points.slice(-half).map(row => row.value)).median;
    const change = unit === '%' ? after - before : before > 0 ? (after - before) / before * 100 : after === before ? 0 : null;
    trend = { before, after, change, compared: half, direction: after === before ? 'unchanged' : after < before ? 'lower' : 'higher' };
  }
  return { points, metrics, unit, metric, trend, sessions: records.length, hits, misses, shots,
    hitRate: hits + misses ? hits / (hits + misses) * 100 : null };
}
