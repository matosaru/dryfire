export function calibrationProgress(description: string, count: number, maximum: number) {
  return `${description} ${count} / ${maximum} samples.${count >= maximum ? ' Recording limit reached; existing samples are kept.' : ''}`;
}
