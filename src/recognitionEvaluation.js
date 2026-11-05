function validate(rows, variant) {
  if (!Array.isArray(rows) || !rows.length) throw new TypeError('A non-empty labelled event corpus is required.');
  const ids = new Set();
  for (const row of rows) {
    if (typeof row?.id !== 'string' || !row.id || ids.has(row.id)) throw new TypeError('Evaluation event IDs must be unique.');
    ids.add(row.id);
    if (!['trigger', 'negative'].includes(row.expected)) throw new TypeError('Each event needs a trigger or negative label.');
    const decision = row[variant];
    if (!decision || !Number.isInteger(decision.count) || decision.count < 0) throw new TypeError(`Missing valid ${variant} decision count.`);
  }
}

const ratio = (value, total) => total ? value / total : 0;

/** Aggregate labelled decisions only; no raw PCM is accepted or retained. */
export function evaluateRecognitionCorpus(rows, variant = 'candidate') {
  validate(rows, variant);
  const triggers = rows.filter(row => row.expected === 'trigger');
  const negatives = rows.filter(row => row.expected === 'negative');
  const recognizedTriggers = triggers.filter(row => row[variant].count > 0).length;
  const falseShots = negatives.reduce((sum, row) => sum + row[variant].count, 0);
  const duplicateShots = triggers.reduce((sum, row) => sum + Math.max(0, row[variant].count - 1), 0);
  const timingErrors = triggers.filter(row => row[variant].count > 0 && Number.isFinite(row.onsetMs) && Number.isFinite(row[variant].onsetMs))
    .map(row => Math.abs(row[variant].onsetMs - row.onsetMs));
  return {
    triggerEvents: triggers.length,
    negativeEvents: negatives.length,
    recognizedTriggers,
    missedTriggers: triggers.length - recognizedTriggers,
    falseShots,
    duplicateShots,
    triggerRecall: ratio(recognizedTriggers, triggers.length),
    falseShotRate: ratio(falseShots, negatives.length),
    duplicateRate: ratio(duplicateShots, triggers.length),
    meanAbsoluteTimingErrorMs: timingErrors.length ? timingErrors.reduce((sum, value) => sum + value, 0) / timingErrors.length : null,
  };
}

export function compareRecognitionCorpus(rows) {
  validate(rows, 'baseline');
  validate(rows, 'candidate');
  let improved = 0, regressed = 0, unchanged = 0;
  for (const row of rows.filter(item => item.expected === 'trigger')) {
    const baseline = row.baseline.count > 0, candidate = row.candidate.count > 0;
    if (!baseline && candidate) improved += 1;
    else if (baseline && !candidate) regressed += 1;
    else unchanged += 1;
  }
  return { baseline: evaluateRecognitionCorpus(rows, 'baseline'), candidate: evaluateRecognitionCorpus(rows, 'candidate'), pairedTriggerChanges: { improved, regressed, unchanged } };
}

