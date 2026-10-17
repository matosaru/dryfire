import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const cell = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('|', '&#124;').replaceAll('\n', ' ');
export function performanceSummary(report) {
  const lines = ['## Performance comparison', '', `Application assets: ${report.identicalApplicationAssets ? 'identical' : 'changed'}. Measurement: ${cell(report.measuredAt ?? 'not started')}.`, ''];
  if(report.runtimeProbe) lines.push(`Controlled runtime probe: ${cell(report.runtimeProbe)}`,'');
  if (report.reports?.length === 2) {
    lines.push('| Initial payload | Original | Candidate |', '| --- | ---: | ---: |');
    for (const kind of ['js', 'css']) for (const encoding of ['raw', 'gzip']) {
      lines.push(`| ${kind.toUpperCase()} ${encoding} bytes | ${report.reports[0].critical[kind][encoding]} | ${report.reports[1].critical[kind][encoding]} |`);
    }
    lines.push('');
  }
  for (const [browser, data] of Object.entries(report.browsers ?? {})) {
    lines.push(`### ${cell(browser)} ${cell(data.version)}`, '', '| Metric (ms) | Original median / p95 | Candidate median / p95 | Slower pairs | Gate |', '| --- | ---: | ---: | ---: | --- |');
    for (const [metric, value] of Object.entries(data.comparisons)) {
      lines.push(`| ${cell(metric)} | ${value.baseline.median.toFixed(2)} / ${value.baseline.p95.toFixed(2)} | ${value.candidate.median.toFixed(2)} / ${value.candidate.p95.toFixed(2)} | ${value.slowerPairs} / ${value.candidate.samples.length} | ${value.regression ? 'FAIL' : 'pass'} |`);
      if(value.confidence) lines.push(`| ${cell(metric)} 99% difference interval | median ${value.confidence.median.lower.toFixed(2)} to ${value.confidence.median.upper.toFixed(2)} | p95 ${value.confidence.p95.lower.toFixed(2)} to ${value.confidence.p95.upper.toFixed(2)} | | ${cell(value.interpretation)} |`);
    }
    lines.push('');
  }
  lines.push('### Errors', '', ...(report.errors?.length ? report.errors.map(error => `- ${cell(error)}`) : ['None.']), '', 'Detailed samples, frame/resource/cleanup observations and source metadata are in the downloadable performance artifact.', '');
  return lines.join('\n');
}

// Make the reason visible in public check annotations and the job summary,
// without needing authenticated access to raw logs/artifact downloads.
export function publishPerformanceReport(report, { summaryPath, annotate = value => process.stdout.write(value + '\n') } = {}) {
  const summary = performanceSummary(report);
  if (summaryPath) appendFileSync(summaryPath, summary);
  const command = value => String(value).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
  for (const error of report.errors ?? []) annotate(`::error title=Performance gate::${command(error)}`);
  if (report.identicalApplicationAssets && !report.runtimeProbe) for (const [browser, data] of Object.entries(report.browsers ?? {})) {
    for (const [metric, value] of Object.entries(data.comparisons)) if (value.observedSignal) {
      annotate(`::notice title=Identical-build timing control::${command(`${browser} ${metric}: point signal on identical code (confirmed: ${value.confirmedSignal ?? 'not measured'}); baseline median/p95 ${value.baseline.median}/${value.baseline.p95}, candidate ${value.candidate.median}/${value.candidate.p95}, ${value.slowerPairs}/${value.candidate.samples.length} slower pairs. This is calibration evidence, not a passing candidate result.`)}`);
    }
  }
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2] ?? 'performance-results/report.json';
  let report;
  try { report = JSON.parse(readFileSync(path, 'utf8')); }
  catch (error) {
    // This does not replace the failing measurement step's outcome.
    report = { errors: [`No readable performance report: ${error.message}. The comparison may have failed before measurements.`] };
  }
  const summary = publishPerformanceReport(report, { summaryPath: process.env.GITHUB_STEP_SUMMARY });
  if (!process.env.GITHUB_STEP_SUMMARY) process.stdout.write(summary);
}
