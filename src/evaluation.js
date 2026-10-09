/** Manual validation metrics. Only user-confirmed events are counted. */
export const ACTUAL_CLASSES = ['draw', 'rack', 'trigger', 'reload', 'other'];
export const PREDICTED_CLASSES = ['draw', 'rack', 'trigger', 'reload', 'unknown'];

export function evaluateEvents(events) {
  const matrix = Object.fromEntries(ACTUAL_CLASSES.map(actual => [actual,
    Object.fromEntries(PREDICTED_CLASSES.map(predicted => [predicted, 0]))]));
  let verified = 0;
  let correct = 0;
  for (const row of events) {
    if (!ACTUAL_CLASSES.includes(row.actualLabel)) continue;
    const prediction = PREDICTED_CLASSES.includes(row.label) ? row.label : 'unknown';
    matrix[row.actualLabel][prediction] += 1;
    verified += 1;
    if (prediction === row.actualLabel || (row.actualLabel === 'other' && prediction === 'unknown')) correct += 1;
  }
  const recallByClass = Object.fromEntries(ACTUAL_CLASSES.map(actual => {
    const total = Object.values(matrix[actual]).reduce((sum, count) => sum + count, 0);
    const hit = matrix[actual][actual === 'other' ? 'unknown' : actual];
    return [actual, total > 0 ? hit / total : null];
  }));
  const otherCount = Object.values(matrix.other).reduce((a, b) => a + b, 0);
  const falsePositives = otherCount - matrix.other.unknown;
  return {
    verified, correct,
    accuracy: verified > 0 ? correct / verified : null,
    matrix, recallByClass, falsePositives, otherCount,
    otherFalsePositiveRate: otherCount ? falsePositives / otherCount : null,
  };
}
