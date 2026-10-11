import {
  normalizeAudioPreferences, getAudioCapabilities, buildAudioConstraints, inspectAudioProcessing,
} from '../src/audioPreferences.js';

describe('next-capture audio preferences', () => {
  test('defaults stay off and snapshots do not retain caller mutations', () => {
    const preferences = { noiseFilter: true, autoGain: false };
    const snapshot = normalizeAudioPreferences(preferences);
    preferences.noiseFilter = false;
    expect(snapshot).toEqual({ noiseFilter: true, autoGain: false });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(normalizeAudioPreferences({ noiseFilter: 'true', autoGain: 1 }))
      .toEqual({ noiseFilter: false, autoGain: false });
  });

  test('requests supported boolean hints without exact constraints', () => {
    const capabilities = getAudioCapabilities({
      getUserMedia() {}, getSupportedConstraints: () => ({ noiseSuppression: true, autoGainControl: true }),
    });
    expect(buildAudioConstraints({ noiseFilter: true, autoGain: false }, capabilities)).toEqual({
      audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: false }, video: false,
    });
  });

  test('omits unsupported processing without blocking microphone capture', () => {
    const capabilities = getAudioCapabilities({ getUserMedia() {}, getSupportedConstraints: () => ({ noiseSuppression: true }) });
    expect(buildAudioConstraints({ noiseFilter: false, autoGain: true }, capabilities)).toEqual({
      audio: { echoCancellation: false, noiseSuppression: false }, video: false,
    });
    expect(getAudioCapabilities(null)).toEqual({ microphone: false, noiseFilter: false, autoGain: false });
    expect(getAudioCapabilities({ getUserMedia() {} }).noiseFilter).toBe(false);
  });

  test('reports applied settings, rejected hints and missing confirmation honestly', () => {
    const capabilities = { microphone: true, noiseFilter: true, autoGain: true };
    const report = inspectAudioProcessing({ getSettings: () => ({ noiseSuppression: true, autoGainControl: false }) },
      { noiseFilter: true, autoGain: true }, capabilities);
    expect(report.noiseFilter).toEqual({ supported: true, requested: true, applied: true, status: 'confirmed' });
    expect(report.autoGain).toEqual({ supported: true, requested: true, applied: false, status: 'not-applied' });
    expect(inspectAudioProcessing({}, {}, capabilities).autoGain.status).toBe('unconfirmed');
    expect(inspectAudioProcessing({}, { noiseFilter: true }, { noiseFilter: false, autoGain: false }).noiseFilter.status)
      .toBe('unsupported');
  });
});
