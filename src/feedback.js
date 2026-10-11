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

/** Call prepare directly from Start/Resume; play never resumes audio late at GO. */
export function createStartCuePlayer() {
  let context;
  const voices = new Set();

  async function prepare() {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return false;
    let preparing;
    try {
      if (!context || context.state === 'closed') context = new AudioContextClass();
      preparing = context;
      if (preparing.state === 'suspended') await preparing.resume();
      return context === preparing && preparing.state === 'running';
    } catch { return false; }
  }

  function play() {
    if (!context || context.state !== 'running') return false;
    let oscillator;
    let gain;
    const cleanup = () => {
      voices.delete(cleanup);
      try { oscillator?.disconnect(); } catch {}
      try { gain?.disconnect(); } catch {}
    };
    cleanup.stop = () => { try { oscillator?.stop(); } catch {} cleanup(); };
    try {
      oscillator = context.createOscillator();
      gain = context.createGain();
      oscillator.frequency.value = 880;
      const at = context.currentTime;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.06, at + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.onended = cleanup;
      voices.add(cleanup);
      oscillator.start(at);
      oscillator.stop(at + 0.095);
      return true;
    } catch { cleanup.stop(); return false; }
  }

  async function close() {
    for (const cleanup of [...voices]) cleanup.stop();
    const closing = context;
    context = null;
    if (closing && closing.state !== 'closed') { try { await closing.close(); } catch {} }
  }

  return { prepare, play, close };
}
