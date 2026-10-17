import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performanceSummary, publishPerformanceReport } from '../tools/performance/report.mjs';

test('a paired failure exposes actual payload and timing evidence without hiding the failed gate', () => {
  const sample = { median: 4.2, p95: 8.1, samples: [2, 4.2, 8.1] };
  const report = { measuredAt: '2026-10-17', identicalApplicationAssets: false,
    reports: [0,1].map(value => ({critical:{js:{raw:100+value,gzip:50+value},css:{raw:20,gzip:10}}})),
    browsers: { webkit: {version:'1.2',comparisons:{navigation:{baseline:sample,candidate:sample,slowerPairs:3,regression:true}}} }, errors:['webkit navigation: repeated paired slowdown'] };
  const text = performanceSummary(report);
  expect(text).toContain('| JS gzip bytes | 50 | 51 |');
  expect(text).toContain('| navigation | 4.20 / 8.10 | 4.20 / 8.10 | 3 / 3 | FAIL |');
  expect(text).toContain('webkit navigation: repeated paired slowdown');
});

test('summaries append to the job file and escape workflow command characters', () => {
  const dir = mkdtempSync(join(tmpdir(),'dryfire-perf-summary-')), path = join(dir,'summary.md');
  const annotations = [];
  try {
    const report = {errors:['line%\r\n::warning::unexpected <tag> | data']};
    publishPerformanceReport(report,{summaryPath:path,annotate:value=>annotations.push(value)});
    expect(annotations).toEqual(['::error title=Performance gate::line%25%0D%0A::warning::unexpected <tag> | data']);
    expect(readFileSync(path,'utf8')).toContain('&lt;tag&gt; &#124; data');
  } finally {rmSync(dir,{recursive:true,force:true});}
});

test('an identical-assets pass and a partial/no-browser report remain explicit', () => {
  expect(performanceSummary({identicalApplicationAssets:true,errors:[]})).toContain('Application assets: identical.');
  expect(performanceSummary({errors:['stopped before browser']})).toContain('stopped before browser');
  const annotations = [];
  publishPerformanceReport({}, {annotate:value=>annotations.push(value)});
  expect(annotations).toEqual([]);
});

test('identical-build timing signals are disclosed as controls and never turn a failed candidate green', () => {
  const sample = {median:74,p95:90,samples:[70,74,90]}, annotations = [];
  publishPerformanceReport({identicalApplicationAssets:true,errors:[],browsers:{webkit:{version:'1',comparisons:{returning:{baseline:sample,candidate:sample,slowerPairs:3,observedSignal:true,regression:false}}}}},
    {annotate:value=>annotations.push(value)});
  expect(annotations).toHaveLength(1);
  expect(annotations[0]).toContain('::notice title=Identical-build timing control::');
  expect(annotations[0]).toContain('calibration evidence, not a passing candidate result');
});
