/** Best-effort foreground feedback; accepted APIs do not establish physical output. */
export function getVibrationCapability(navigator = globalThis.navigator) {
  return typeof navigator?.vibrate === 'function';
}

export function requestFeedbackVibration(kind, navigator = globalThis.navigator) {
  const supported = getVibrationCapability(navigator);
  if (!supported) return { supported: false, accepted: false };
  try {
    const pattern = kind === 'completion' ? [25, 40, 25] : 40;
    return { supported: true, accepted: navigator.vibrate(pattern) === true };
  } catch { return { supported: true, accepted: false }; }
}
