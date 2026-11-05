import { START_CUE_ATTACK_SECONDS, START_CUE_DURATION_SECONDS, START_CUE_FREQUENCY_HZ,
  START_CUE_PEAK_GAIN, START_CUE_RELEASE_SECONDS } from './startCueProfile.js';

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
    let oscillator, gain;
    const cleanup = () => { voices.delete(cleanup); try { oscillator?.disconnect(); } catch {} try { gain?.disconnect(); } catch {} };
    cleanup.stop = () => { try { oscillator?.stop(); } catch {} cleanup(); };
    try {
      oscillator = context.createOscillator(); gain = context.createGain(); oscillator.frequency.value = START_CUE_FREQUENCY_HZ;
      const at = context.currentTime;
      gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(START_CUE_PEAK_GAIN, at + START_CUE_ATTACK_SECONDS);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + START_CUE_RELEASE_SECONDS);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.onended = cleanup; voices.add(cleanup);
      oscillator.start(at); oscillator.stop(at + START_CUE_DURATION_SECONDS); return true;
    } catch { cleanup.stop(); return false; }
  }
  async function close() {
    for (const cleanup of [...voices]) cleanup.stop();
    const closing = context; context = null;
    if (closing && closing.state !== 'closed') { try { await closing.close(); } catch {} }
  }
  return { prepare, play, close };
}

/** User-initiated preview; final loudness still depends on device media volume. */
export async function playStartCuePreview({ createPlayer = createStartCuePlayer, closeAfterMs = 350 } = {}) {
  const player = createPlayer();
  if (!await player.prepare() || !player.play()) { await player.close(); return false; }
  setTimeout(() => { void player.close(); }, closeAfterMs);
  return true;
}
