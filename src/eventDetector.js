/**
 * Foreground audio segmentation. Consecutive events are emitted independently
 * when they have a detectable quiet gap; truly overlapping sounds cannot be
 * reliably separated by this simple energy-based detector.
 *
 * Process frames of ~10 ms rather than arbitrary audio callback chunk sizes.
 * No event is allowed to stop the microphone or mutate recorder state.
 */
export const DETECTOR_DEFAULTS = Object.freeze({
  absoluteFloor: 0.008,
  noiseMultiplier: 5,
  peakFloor: 0.012,
  preRollMs: 85,
  releaseMs: 100,
  maxEventMs: 1550,
  cooldownMs: 45,
  minEventMs: 100,
});

function summarize(buffer) {
  let energy = 0;
  let peak = 0;
  for (const value of buffer) {
    energy += value * value;
    peak = Math.max(peak, Math.abs(value));
  }
  return { rms: Math.sqrt(energy / Math.max(1, buffer.length)), peak };
}

export function createEventDetector(sampleRate, onEvent, options = {}) {
  if (!Number.isFinite(sampleRate) || sampleRate < 1000 || typeof onEvent !== 'function') {
    throw new TypeError('A valid sample rate and event callback are required.');
  }
  const config = { ...DETECTOR_DEFAULTS, ...options };
  const msToSamples = ms => Math.max(1, Math.round(sampleRate * ms / 1000));
  const frameSamples = msToSamples(10);
  const preRollSamples = msToSamples(config.preRollMs);
  const releaseSamples = msToSamples(config.releaseMs);
  const maxEventSamples = msToSamples(config.maxEventMs);
  const minEventSamples = msToSamples(config.minEventMs);
  const cooldownSamples = msToSamples(config.cooldownMs);
  let noiseFloor = 0.001;
  let preRoll = [];
  let preRollLength = 0;
  let chunks = [];
  let eventLength = 0;
  let quietSamples = 0;
  let cooldown = 0;
  let active = false;
  let holdUntilQuiet = false;
  let stopped = false;
  let partial = new Float32Array(frameSamples);
  let partialLength = 0;
  let nextFrame = 0;
  let partialStartFrame = 0;
  let onsetFrame = 0;
  let endedFrame = 0;

  function reset() {
    preRoll = [];
    preRollLength = 0;
    chunks = [];
    eventLength = 0;
    quietSamples = 0;
    cooldown = 0;
    active = false;
    holdUntilQuiet = false;
    partial = new Float32Array(frameSamples);
    partialLength = 0;
    // Keep the adaptive noise floor and clock. A reset must never undo stop().
  }

  function appendPreRoll(frame) {
    preRoll.push(frame);
    preRollLength += frame.length;
    while (preRollLength > preRollSamples && preRoll.length) {
      const first = preRoll[0];
      const excess = preRollLength - preRollSamples;
      if (first.length <= excess) {
        preRoll.shift();
        preRollLength -= first.length;
      } else {
        preRoll[0] = first.slice(excess);
        preRollLength -= excess;
      }
    }
  }

  function finalize() {
    if (eventLength < minEventSamples) return;
    const pcm = new Float32Array(eventLength);
    let offset = 0;
    for (const frame of chunks) {
      pcm.set(frame, offset);
      offset += frame.length;
    }
    // The consumer is responsible for asynchronous classification. Segmentation
    // never awaits it and therefore remains ready for the following sound.
    onEvent(pcm, sampleRate, { onsetMs: onsetFrame / sampleRate * 1000, endedMs: endedFrame / sampleRate * 1000 });
  }

  function endEvent(atLimit = false) {
    finalize();
    chunks = [];
    eventLength = 0;
    quietSamples = 0;
    active = false;
    cooldown = cooldownSamples;
    holdUntilQuiet = atLimit;
    preRoll = [];
    preRollLength = 0;
  }

  function processFrame(frame, startFrame) {
    const { rms, peak } = summarize(frame);
    const threshold = Math.max(config.absoluteFloor, noiseFloor * config.noiseMultiplier);
    const loud = rms >= threshold && peak >= config.peakFloor;

    if (active) {
      endedFrame = startFrame + frame.length;
      chunks.push(frame);
      eventLength += frame.length;
      quietSamples = loud ? 0 : quietSamples + frame.length;
      if (quietSamples >= releaseSamples || eventLength >= maxEventSamples) {
        endEvent(eventLength >= maxEventSamples);
      }
      return;
    }

    cooldown = Math.max(0, cooldown - frame.length);
    if (holdUntilQuiet) {
      quietSamples = loud ? 0 : quietSamples + frame.length;
      if (quietSamples >= releaseSamples) {
        holdUntilQuiet = false;
        quietSamples = 0;
      }
      return;
    }
    if (loud && cooldown === 0) {
      onsetFrame = startFrame;
      endedFrame = startFrame + frame.length;
      active = true;
      chunks = [...preRoll, frame];
      eventLength = preRollLength + frame.length;
      quietSamples = 0;
      preRoll = [];
      preRollLength = 0;
      return;
    }

    if (!loud) noiseFloor = Math.max(0.0001, noiseFloor * 0.98 + rms * 0.02);
    appendPreRoll(frame);
  }

  function push(buffer, startFrame = nextFrame) {
    if (stopped || !(buffer instanceof Float32Array) || !buffer.length) return;
    if (!Number.isFinite(startFrame) || startFrame < 0) return;
    startFrame = Math.round(startFrame);
    // Gaps/cue gates must not stitch stale pre-roll or partial audio to new input.
    if (startFrame !== nextFrame) reset();
    nextFrame = startFrame + buffer.length;
    let offset = 0;
    while (offset < buffer.length) {
      if (stopped) break;
      if (partialLength === 0) partialStartFrame = startFrame + offset;
      const take = Math.min(frameSamples - partialLength, buffer.length - offset);
      partial.set(buffer.subarray(offset, offset + take), partialLength);
      partialLength += take;
      offset += take;
      if (partialLength === frameSamples) {
        processFrame(partial, partialStartFrame);
        partial = new Float32Array(frameSamples);
        partialLength = 0;
      }
    }
  }

  return {
    push,
    reset,
    setNoiseFloor(value) {
      if (!Number.isFinite(value) || value < 0) return false;
      noiseFloor = Math.max(0.0001, Math.min(0.05, value));
      return true;
    },
    get noiseFloor() { return noiseFloor; },
    get active() { return active; },
    stop() {
      stopped = true;
      reset();
    },
  };
}
