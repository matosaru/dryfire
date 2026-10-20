/** This validates only the deliberate-slowdown control, never a candidate gate.
 * Warm phase diagnostics accompany a confirmed warm regression in the original
 * report. Keep unrelated errors fatal rather than treating every nonzero exit
 * as proof that the timing gate works. */
export function timingProbeRejected(result, report) {
  if (result.error || !Number.isInteger(result.status) || result.status <= 0 || !report?.runtimeProbe) return false;
  const comparisons = report.browsers?.chromium?.comparisons;
  const errors = report.errors;
  if (!comparisons || !Array.isArray(errors) || !errors.length) return false;
  const confirmed = new Set();
  for (const error of errors) {
    if (typeof error !== 'string') return false;
    const match = /^chromium (cold|warm|returning|firstAction|navigation|clickFeedback): confirmed (?:paired median|p95 tail) slowdown /.exec(error);
    if (match && comparisons[match[1]]?.regression === true) confirmed.add(match[1]);
    else if (!error.startsWith('chromium warm navigation phase medians (ms since navigation, diagnostic only): baseline ')) return false;
  }
  if (!['cold', 'warm', 'returning'].some(metric => confirmed.has(metric))) return false;
  return !errors.some(error => error.startsWith('chromium warm navigation phase medians ')) || confirmed.has('warm');
}
