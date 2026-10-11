/** Capture preferences are copied before permission prompts; active tracks never change. */
export function normalizeAudioPreferences(preferences = {}) {
  return Object.freeze({ noiseFilter: preferences?.noiseFilter === true, autoGain: preferences?.autoGain === true });
}

export function getAudioCapabilities(mediaDevices = globalThis.navigator?.mediaDevices) {
  let supported = {};
  try { supported = mediaDevices?.getSupportedConstraints?.() || {}; } catch {}
  return Object.freeze({
    microphone: typeof mediaDevices?.getUserMedia === 'function',
    noiseFilter: supported.noiseSuppression === true,
    autoGain: supported.autoGainControl === true,
  });
}

export function buildAudioConstraints(preferences, capabilities = getAudioCapabilities()) {
  const snapshot = normalizeAudioPreferences(preferences);
  const audio = { echoCancellation: false };
  // Boolean hints let an unsupported device continue capturing rather than reject it.
  if (capabilities.noiseFilter) audio.noiseSuppression = snapshot.noiseFilter;
  if (capabilities.autoGain) audio.autoGainControl = snapshot.autoGain;
  return { audio, video: false };
}

export function inspectAudioProcessing(track, preferences, capabilities = getAudioCapabilities()) {
  const snapshot = normalizeAudioPreferences(preferences);
  let settings = {};
  try { settings = track?.getSettings?.() || {}; } catch {}
  return Object.freeze(Object.fromEntries([
    ['noiseFilter', 'noiseSuppression'], ['autoGain', 'autoGainControl'],
  ].map(([name, constraint]) => {
    const supported = capabilities[name] === true;
    const requested = snapshot[name];
    const applied = typeof settings[constraint] === 'boolean' ? settings[constraint] : null;
    const status = !supported ? 'unsupported' : applied === null ? 'unconfirmed' : applied === requested ? 'confirmed' : 'not-applied';
    return [name, Object.freeze({ supported, requested, applied, status })];
  })));
}
