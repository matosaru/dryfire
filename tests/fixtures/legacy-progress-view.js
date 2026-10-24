import { progressGroups, progressSummary, summarize } from '../../src/practiceProgress.js';
const element = (doc, tag, text, className = '') => { const node = doc.createElement(tag); node.textContent = text; node.className = className; return node; };
const format = (value, unit = 'ms') => value === null ? '—' : unit === 'ms' ? `${(value / 1000).toFixed(2)} s` : `${value.toFixed(1)} ${unit}`;
const timing = group => {
  const c = group.config;
  return `${c.startSource === 'external' ? 'External beep' : c.soundAtStart ? 'App beep' : 'Silent start'} · ${c.delayMode === 'fixed' ? `${c.fixedDelaySeconds}s fixed` : `${c.randomMinSeconds}–${c.randomMaxSeconds}s random`}${group.mode === 'par' ? ` · ${c.parSeconds}s par` : ''}`;
};
export function createProgressView(doc, { enabled = () => true } = {}) {
  const $ = id => doc.getElementById(id), select = $('progressGroup'), range = $('progressRange'), host = $('progressContent');
  let groups = [], owner = null;
  function renderSelected() {
    host.replaceChildren();
    if (!enabled()) return;
    const group = groups.find(row => row.key === select.value);
    if (!group) { host.append(element(doc, 'p', 'Complete practice sessions to see your timing and progress here.', 'empty-state')); return; }
    const data = progressSummary(group, { days: Number(range.value) });
    host.append(element(doc, 'p', timing(group), 'muted small'));
    const stats = element(doc, 'div', '', 'progress-stats');
    const card = (label, value) => { const node = element(doc, 'div'); node.append(element(doc, 'span', label), element(doc, 'strong', value)); stats.append(node); };
    card('Sessions', String(data.sessions));
    if (group.mode === 'par') { card('Hit rate', format(data.hitRate, '%')); card('Hits / misses', `${data.hits} / ${data.misses}`); card('Median hit time', format(data.metrics.median)); }
    else if (group.mode === 'free') { card('Median rate', format(data.rate, 'clicks/min')); card('Mean rate', format(summarize(data.points.map(point => point.value)).mean, 'clicks/min')); card('Recognized clicks', String(data.shots)); }
    else { card('Median timing', format(data.metrics.median)); card('Mean timing', format(data.metrics.mean)); card('Timing variation', format(data.metrics.spread)); }
    host.append(stats);
    const trend = data.trend;
    let description = `More sessions needed for comparison · ${data.points.length} of 4 comparable sessions available.`;
    if (trend) {
      const direction = trend.direction === 'unchanged' ? 'Unchanged'
        : group.mode === 'control' ? trend.direction === 'lower' ? 'Steadier intervals' : 'More variable intervals'
          : group.mode === 'par' ? trend.direction === 'higher' ? 'Higher hit rate' : 'Lower hit rate'
            : group.mode === 'free' ? trend.direction === 'higher' ? 'Higher click rate' : 'Lower click rate'
              : trend.direction === 'lower' ? 'Faster detected timing' : 'Slower detected timing';
      description = `${direction}${trend.change === null ? '' : ` · ${Math.abs(trend.change).toFixed(1)} ${data.unit === '%' ? 'percentage points' : '%'}`} · recent ${trend.compared} vs earlier ${trend.compared} sessions.`;
    }
    host.append(element(doc, 'p', description, 'progress-trend'));
    host.append(element(doc, 'h4', data.metric));
    if (!data.points.length) { host.append(element(doc, 'p', 'No completed timing samples in this range. Choose a wider range or finish another session.', 'empty-state')); return; }
    const svgNode = (tag, attrs, text) => { const node = doc.createElementNS('http://www.w3.org/2000/svg', tag); for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value); if (text !== undefined) node.textContent = text; return node; };
    const svg = svgNode('svg', { viewBox: '0 0 600 230', role: 'img', 'aria-label': `${data.metric} across ${data.points.length} saved sessions; values are also listed in the table below.`, class: 'progress-chart' });
    const values = data.points.map(point => point.value), low = data.unit === '%' ? 0 : Math.max(0, Math.min(...values) * .9);
    const high = data.unit === '%' ? 100 : Math.max(low + 1, Math.max(...values) * 1.1);
    const x = index => data.points.length === 1 ? 324 : 72 + index / (data.points.length - 1) * 504;
    const y = value => 180 - (value - low) / (high - low) * 156;
    for (const fraction of [0, .5, 1]) {
      const value = low + (high - low) * fraction;
      svg.append(svgNode('line', { x1: 72, x2: 576, y1: y(value), y2: y(value), class: 'progress-gridline' }),
        svgNode('text', { x: 64, y: y(value) + 4, 'text-anchor': 'end' }, data.unit === 'ms' ? (value / 1000).toFixed(2) : value.toFixed(1)));
    }
    svg.append(svgNode('polyline', { points: data.points.map((point, i) => `${x(i)},${y(point.value)}`).join(' '), fill: 'none', class: 'progress-line' }));
    data.points.forEach((point, i) => {
      const dot = svgNode('circle', { cx: x(i), cy: y(point.value), r: 5, class: 'progress-dot' });
      dot.append(svgNode('title', {}, `${new Date(point.date).toLocaleString()}: ${format(point.value, data.unit)}`)); svg.append(dot);
    });
    for (const [index, anchor] of [[0, 'start'], [data.points.length - 1, 'end']]) svg.append(svgNode('text', { x: x(index), y: 209, 'text-anchor': anchor }, new Date(data.points[index].date).toLocaleDateString()));
    host.append(svg, element(doc, 'p', `One point per session, ordered by date · ${data.unit === 'ms' ? 'seconds' : data.unit}. Completed outcomes only; partial attempts are excluded.`, 'muted small'));
    const details = element(doc, 'details', '', 'progress-data'); details.append(element(doc, 'summary', 'View values and sample counts'));
    const table = element(doc, 'table'); const head = element(doc, 'tr');
    for (const title of ['Session date', data.metric, 'Timed samples', 'Hits / misses']) { const th = element(doc, 'th', title); th.scope = 'col'; head.append(th); }
    const thead = element(doc, 'thead'); thead.append(head); table.append(thead);
    const body = element(doc, 'tbody');
    for (const point of data.points) { const row = element(doc, 'tr'); for (const value of [new Date(point.date).toLocaleString(), format(point.value, data.unit), String(point.count), `${point.hits} / ${point.misses}`]) row.append(element(doc, 'td', value)); body.append(row); }
    table.append(body); details.append(table); host.append(details);
  }
  select.addEventListener('change', renderSelected); range.addEventListener('change', renderSelected);
  return { render(records, gunId) {
    const previous = owner === gunId ? select.value : null; owner = gunId; groups = progressGroups(records, gunId);
    select.replaceChildren(...groups.map(group => { const option = element(doc, 'option', `${group.title} · ${timing(group)}`); option.value = group.key; return option; }));
    select.disabled = !groups.length;
    if (groups.some(group => group.key === previous)) select.value = previous;
    else if (groups.some(group => group.mode === 'single')) select.value = groups.find(group => group.mode === 'single').key;
    renderSelected();
  } };
}
