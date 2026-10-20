/** Frozen pre-prerender initializer and rules; parity oracle only, never application code. */
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
export function configureNumberInputs(doc) {
  for (const [id, rule] of Object.entries(NUMBER_INPUTS)) {
    const input = doc.getElementById(id);
    if (!input) continue;
    input.min = rule.min; input.max = rule.max; input.step = rule.step;
    const hint = doc.createElement('small'); hint.id = `${id}Limit`; hint.className = 'numeric-hint';
    hint.textContent = `${rule.min}–${rule.max} · ${rule.step === 1 ? 'whole numbers' : '0.1 increments'}`;
    input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), hint.id].filter(Boolean).join(' '));
    input.parentElement.append(hint);
  }
}
