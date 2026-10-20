export const NUMBER_INPUTS = Object.freeze({
  practiceRepetitions: { min: 1, max: 100, step: 1, label: 'Repetitions or clicks' },
  sessionRepetitions: { min: 1, max: 100, step: 1, label: 'Repetitions' },
  practiceDuration: { min: 1, max: 3600, step: 1, label: 'Active seconds' },
  practicePar: { min: .1, max: 30, step: .1, label: 'Par seconds' },
  practiceFixedDelay: { min: 0, max: 30, step: .1, label: 'Delay seconds' },
  sessionFixedDelay: { min: 0, max: 30, step: .1, label: 'Delay seconds' },
  practiceMinDelay: { min: 0, max: 30, step: .1, label: 'Random minimum seconds' },
  sessionMinDelay: { min: 0, max: 30, step: .1, label: 'Random minimum seconds' },
  practiceMaxDelay: { min: 0, max: 30, step: .1, label: 'Random maximum seconds' },
  sessionMaxDelay: { min: 0, max: 30, step: .1, label: 'Random maximum seconds' },
  maxResults: { min: 1, max: 500, step: 1, label: 'Recent results retained' },
});
export function parseNumberInput(value, id) {
  const rule = NUMBER_INPUTS[id];
  if (!rule) throw new TypeError('Unknown numeric input.');
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  if (!Number.isFinite(n) || n < rule.min || n > rule.max || Math.abs(n / rule.step - Math.round(n / rule.step)) > 1e-8) {
    throw new TypeError(`${rule.label}: choose ${rule.min}–${rule.max}${rule.step === 1 ? ' in whole numbers.' : ' in steps of 0.1.'}`);
  }
  return n;
}
export function readNumberInput(input) { return parseNumberInput(input.value, input.id); }
