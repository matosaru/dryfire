const DEFAULT_MINIMUM_MS = 600;
const FRAME_MS = 10;

function percentile(values, proportion) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * proportion)];
}

function frameRms(samples) {
  let energy = 0;
  for (const sample of samples) energy += sample * sample;
  return Math.sqrt(energy / Math.max(1, samples.length));
}

/** Robust room-level observation. Raw PCM is discarded after frame RMS values are calculated. */
export function createAmbientReadinessEstimator(sampleRate, { minimumMs = DEFAULT_MINIMUM_MS } = {}) {
  if (!Number.isFinite(sampleRate) || sampleRate < 1000) throw new TypeError('A valid sample rate is required.');
  const frameSize = Math.max(1, Math.round(sampleRate * FRAME_MS / 1000));
  const minimumSamples = Math.max(frameSize, Math.round(sampleRate * minimumMs / 1000));
  const levels = [];
  let observedSamples = 0;
  let partial = new Float32Array(frameSize);
  let partialLength = 0;

  function push(samples) {
    if (!(samples instanceof Float32Array) || !samples.length) return;
    observedSamples += samples.length;
    let offset = 0;
    while (offset < samples.length) {
      const take = Math.min(frameSize - partialLength, samples.length - offset);
      partial.set(samples.subarray(offset, offset + take), partialLength);
      partialLength += take;
      offset += take;
      if (partialLength === frameSize) {
        levels.push(frameRms(partial));
        partial = new Float32Array(frameSize);
        partialLength = 0;
      }
    }
  }

  function snapshot() {
    if (observedSamples < minimumSamples) {
      return { ready: false, status: 'preparing', observedMs: Math.round(observedSamples / sampleRate * 1000), rmsMedian: 0, rmsP90: 0, recommendedNoiseFloor: 0.001 };
    }
    const rmsMedian = percentile(levels, .5);
    const rmsP90 = percentile(levels, .9);
    const status = rmsP90 >= .02 ? 'noisy' : 'ready';
    return {
      ready: true,
      status,
      observedMs: Math.round(observedSamples / sampleRate * 1000),
      rmsMedian,
      rmsP90,
      recommendedNoiseFloor: Math.max(.0001, Math.min(.05, rmsMedian)),
    };
  }

  return { push, snapshot };
}

export function describeAmbientReadiness(result) {
  if (!result?.ready) return 'Preparing microphone…';
  if (result.status === 'noisy') return 'Room is noisy · Move closer or reduce background sound';
  return 'Microphone ready · Listening before the signal';
}

