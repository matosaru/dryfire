/**
 * Microphone adapter: only this module touches Web Audio and MediaDevices.
 * Pure analysis helpers below are usable in Jest/Node without a microphone.
 */
import { normalizeAudioPreferences, getAudioCapabilities, buildAudioConstraints, inspectAudioProcessing } from './audioPreferences.js';

export const FEATURE_VERSION = 2;
export const RECORD_MS = 2000;
const PREP_SECONDS = 2;
const MIN_PEAK = 0.012;
const MIN_RMS = 0.0012;

function rms(data) {
  let sum = 0;
  for (const sample of data) sum += sample * sample;
  return Math.sqrt(sum / Math.max(1, data.length));
}

function zeroCrossingRate(data) {
  let crossings = 0;
  for (let i = 1; i < data.length; i += 1) {
    if ((data[i - 1] >= 0) !== (data[i] >= 0)) crossings += 1;
  }
  return crossings / Math.max(1, data.length - 1);
}

function peak(data) {
  let value = 0;
  for (const sample of data) value = Math.max(value, Math.abs(sample));
  return value;
}

function frameFeatures(data, sampleRate) {
  const frameSize = Math.max(128, Math.floor(sampleRate * 0.025));
  const hop = Math.max(64, Math.floor(frameSize / 2));
  const energy = [];
  const zcr = [];
  const peaks = [];
  for (let start = 0; start + frameSize <= data.length; start += hop) {
    const frame = data.subarray(start, start + frameSize);
    energy.push(rms(frame));
    zcr.push(zeroCrossingRate(frame));
    peaks.push(peak(frame));
  }
  return { energy, zcr, peaks };
}

function stats(values) {
  if (!values.length) return [0, 0, 0, 0];
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const q = p => sorted[Math.floor((sorted.length - 1) * p)];
  return [mean, Math.sqrt(variance), q(0.5), q(0.9)];
}

function transientFeatures(energy) {
  if (!energy.length) return [0, 0, 0];
  const max = Math.max(...energy);
  const maxIndex = energy.indexOf(max);
  const mean = energy.reduce((a, b) => a + b, 0) / energy.length;
  const threshold = mean + (max - mean) * 0.35;
  const active = energy.filter(value => value >= threshold).length;
  return [max, maxIndex / Math.max(1, energy.length - 1), active / energy.length];
}

/** 15 features; the event-centred input is what defines version 2. */
export function extractFeatures(samples, sampleRate) {
  if (!(samples instanceof Float32Array) || !Number.isFinite(sampleRate) || sampleRate < 1000) {
    throw new TypeError('Expected Float32Array PCM samples and a valid sample rate.');
  }
  const frames = frameFeatures(samples, sampleRate);
  const features = [
    ...stats(frames.energy),
    ...stats(frames.zcr),
    ...stats(frames.peaks),
    ...transientFeatures(frames.energy),
  ];
  return features.map(value => Number.isFinite(value) ? value : 0);
}

/**
 * Find the dominant acoustic event, reject quiet/clipped recordings, and
 * analyse a bounded window centred on it. Not equivalent to a trained VAD.
 */
export function analyzeRecording(samples, sampleRate) {
  if (!(samples instanceof Float32Array) || samples.length < sampleRate * 0.11 || !Number.isFinite(sampleRate) || sampleRate < 1000) {
    throw new Error('Recording is too short to analyse.');
  }
  const overallPeak = peak(samples);
  const overallRms = rms(samples);
  if (overallPeak < MIN_PEAK || overallRms < MIN_RMS) {
    throw new Error('No clear sound detected. Move closer to the microphone or try a quieter room.');
  }
  let clipped = 0;
  for (const sample of samples) if (Math.abs(sample) >= 0.985) clipped += 1;
  if (clipped / samples.length > 0.02) {
    throw new Error('Audio was distorted. Move the microphone farther from the source.');
  }

  const frameLength = Math.max(64, Math.floor(sampleRate * 0.01));
  let loudestStart = 0;
  let loudestEnergy = 0;
  for (let start = 0; start + frameLength <= samples.length; start += frameLength) {
    const energy = rms(samples.subarray(start, start + frameLength));
    if (energy > loudestEnergy) {
      loudestEnergy = energy;
      loudestStart = start;
    }
  }
  // A short window around the transient reduces sensitivity to when recording began.
  const width = Math.min(samples.length, Math.floor(sampleRate * 0.8));
  const start = Math.max(0, Math.min(samples.length - width, loudestStart - Math.floor(width * 0.35)));
  const event = samples.subarray(start, start + width);
  return {
    features: extractFeatures(event, sampleRate),
    peak: overallPeak,
    rms: overallRms,
    durationMs: Math.round(event.length / sampleRate * 1000),
  };
}

function throwIfAborted(signal) {
  if (!signal?.aborted) return;
  const error = new Error('Audio capture was cancelled.');
  error.name = 'AbortError';
  throw error;
}

function sleep(ms, signal) {
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const aborted = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', aborted);
      try { throwIfAborted(signal); } catch (error) { reject(error); }
    };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', aborted); resolve(); }, ms);
    signal?.addEventListener('abort', aborted, { once: true });
  });
}

/**
 * The ScriptProcessor path is a WebView-compatible MVP fallback; a native
 * AudioWorklet/PCM plugin is the next step for low-latency streaming detection.
 */
export async function recordFeatureVector(onState = () => {}, { audioPreferences, onProcessing = () => {}, signal } = {}) {
  const preferences = normalizeAudioPreferences(audioPreferences);
  const capabilities = getAudioCapabilities();
  throwIfAborted(signal);
  if (!globalThis.navigator?.mediaDevices?.getUserMedia) {
    throw new Error('Microphone access requires HTTPS or localhost and a compatible browser.');
  }
  const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AudioContextClass) throw new Error('Web Audio is unavailable on this device.');

  let stream;
  let context;
  let source;
  let processor;
  let silentOutput;
  let closePromise;
  const onAbort = () => { void cleanup(); };
  function cleanup() {
    if (closePromise) return closePromise;
    signal?.removeEventListener('abort', onAbort);
    if (processor) { processor.onaudioprocess = null; try { processor.disconnect(); } catch {} }
    if (source) { try { source.disconnect(); } catch {} }
    if (silentOutput) { try { silentOutput.disconnect(); } catch {} }
    stream?.getTracks().forEach(track => track.stop());
    closePromise = context && context.state !== 'closed' ? context.close().catch(() => {}) : Promise.resolve();
    return closePromise;
  }
  try {
    onState('Requesting microphone permission…');
    stream = await navigator.mediaDevices.getUserMedia(buildAudioConstraints(preferences, capabilities));
    throwIfAborted(signal);
    onProcessing(inspectAudioProcessing(stream.getAudioTracks()[0], preferences, capabilities));
    throwIfAborted(signal);
    context = new AudioContextClass();
    signal?.addEventListener('abort', onAbort, { once: true });
    if (context.state === 'suspended') await context.resume();
    throwIfAborted(signal);
    source = context.createMediaStreamSource(stream);
    if (typeof context.createScriptProcessor !== 'function') {
      throw new Error('This WebView does not support PCM recording. Native audio capture is required.');
    }
    processor = context.createScriptProcessor(2048, 1, 1);
    silentOutput = context.createGain();
    silentOutput.gain.value = 0;
    processor.connect(silentOutput);
    silentOutput.connect(context.destination); // Required to keep ScriptProcessor active; muted.
    source.connect(processor);

    for (let remaining = PREP_SECONDS; remaining >= 1; remaining -= 1) {
      onState(`Get ready… ${remaining}`);
      await sleep(1000, signal);
    }
    const chunks = [];
    processor.onaudioprocess = event => {
      const input = event.inputBuffer.getChannelData(0);
      chunks.push(new Float32Array(input));
      // Processor output stays silent; never play microphone input through speakers.
      for (let channel = 0; channel < event.outputBuffer.numberOfChannels; channel += 1) {
        event.outputBuffer.getChannelData(channel).fill(0);
      }
    };
    onState('Recording… one sound now');
    await sleep(RECORD_MS, signal);
    throwIfAborted(signal);
    processor.onaudioprocess = null;
    onState('Analysing sound…');
    const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
    if (!length) throw new Error('No audio arrived from the microphone.');
    const samples = new Float32Array(length);
    let offset = 0;
    for (const chunk of chunks) { samples.set(chunk, offset); offset += chunk.length; }
    return analyzeRecording(samples, context.sampleRate).features;
  } catch (error) {
    if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
      throw new Error('Microphone permission was denied. Enable it in browser or app settings.');
    }
    throw error;
  } finally {
    await cleanup();
  }
}

/**
 * Continuous listening keeps one microphone session active until stopped.
 * AudioWorklet is preferred; ScriptProcessor is an explicitly documented fallback.
 * All raw PCM stays in transient memory, and no audio is played or uploaded.
 */
export async function startContinuousListening({ onEvent, onLevel = () => {}, onState = () => {}, onError = () => {}, sensitivity = 'normal',
  audioPreferences, onProcessing = () => {}, signal, detectionEnabled = true } = {}) {
  const preferences = normalizeAudioPreferences(audioPreferences);
  const capabilities = getAudioCapabilities();
  throwIfAborted(signal);
  if (typeof onEvent !== 'function') throw new TypeError('onEvent callback is required.');
  if (!globalThis.navigator?.mediaDevices?.getUserMedia) {
    throw new Error('Microphone requires HTTPS/localhost and permission.');
  }
  const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AudioContextClass) throw new Error('Web Audio is unavailable on this device.');
  const { createEventDetector } = await import('./eventDetector.js');
  throwIfAborted(signal);
  const noiseMultiplier = { high: 3.5, normal: 5, low: 7 }[sensitivity] ?? 5;
  let stream, context, source, node, output;
  let running = true;
  let stopped = false;
  let detector;
  let lastLevelAt = 0;
  let pendingLevel = 0;
  let pendingActivity = false;
  let closePromise;
  let detectionArmed = detectionEnabled !== false;
  let armedAfterFrame = 0;
  const onAbort = () => { void stop(); };

  function armDetection({ guardMs = 0 } = {}) {
    if (stopped || !context || context.state === 'closed') return false;
    detector.reset();
    detectionArmed = true;
    const guard = Number.isFinite(guardMs) ? Math.max(0, guardMs) : 0;
    armedAfterFrame = Math.ceil((context.currentTime + guard / 1000) * context.sampleRate);
    return true;
  }

  function disarmDetection() {
    detectionArmed = false;
    detector?.reset();
  }

  async function stop() {
    if (closePromise) return closePromise;
    stopped = true;
    running = false;
    signal?.removeEventListener('abort', onAbort);
    detector?.stop();
    if (node) {
      if ('onaudioprocess' in node) node.onaudioprocess = null;
      if (node.port) node.port.onmessage = null;
      try { node.disconnect(); } catch {}
    }
    if (source) { try { source.disconnect(); } catch {} }
    if (output) { try { output.disconnect(); } catch {} }
    stream?.getTracks().forEach(track => { track.onended = null; track.stop(); });
    closePromise = context && context.state !== 'closed' ? context.close().catch(() => {}) : Promise.resolve();
    await closePromise;
    return undefined;
  }

  try {
    onState('Requesting microphone access…');
    stream = await navigator.mediaDevices.getUserMedia(buildAudioConstraints(preferences, capabilities));
    throwIfAborted(signal);
    if (stopped) throw new Error('Listening stopped.');
    context = new AudioContextClass();
    signal?.addEventListener('abort', onAbort, { once: true });
    if (context.state === 'suspended') await context.resume();
    throwIfAborted(signal);
    onProcessing(inspectAudioProcessing(stream.getAudioTracks()[0], preferences, capabilities));
    throwIfAborted(signal);
    detector = createEventDetector(context.sampleRate, onEvent, { noiseMultiplier });
    source = context.createMediaStreamSource(stream);
    output = context.createGain();
    output.gain.value = 0;
    const onChunk = (samples, startFrame) => {
      if (!running || !(samples instanceof Float32Array) || !samples.length || !Number.isFinite(startFrame)) return;
      if (detectionArmed) {
        // Gate by captured sample time, not delivery time: delayed chunks may contain the cue.
        const skip = Math.max(0, armedAfterFrame - startFrame);
        if (skip < samples.length) {
          // Silence the guarded prefix without shifting the 10 ms analysis frames.
          // Truncation at an arbitrary sample changed later event feature windows.
          const gated = skip > 0 ? samples.slice() : samples;
          if (skip > 0) gated.fill(0, 0, skip);
          detector.push(gated, startFrame);
        }
      }
      let energy = 0;
      for (let i = 0; i < samples.length; i++) energy += samples[i] ** 2;
      pendingLevel = Math.max(pendingLevel, Math.min(100, Math.round(1000 * Math.sqrt(energy / samples.length))));
      pendingActivity ||= detector.active;
      const now = Date.now();
      if (now - lastLevelAt >= 100) {
        lastLevelAt = now;
        onLevel(pendingLevel, pendingActivity);
        pendingLevel = 0;
        pendingActivity = false;
      }
    };

    if (context.audioWorklet && typeof globalThis.AudioWorkletNode === 'function') {
      try {
        await context.audioWorklet.addModule(import.meta.env?.DEV ? '/workers/pcm-capture.worklet.js' : '/pcm-capture.worklet.js');
        throwIfAborted(signal);
        if (stopped) throw new Error('Listening stopped.');
        node = new AudioWorkletNode(context, 'pcm-capture', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
        node.port.onmessage = event => onChunk(event.data?.samples, event.data?.startFrame);
        onState('Live listening (AudioWorklet)');
      } catch (error) {
        if (signal?.aborted || stopped) throw error;
        console.warn('AudioWorklet failed; trying compatibility recorder:', error);
      }
    }
    if (!node) {
      if (typeof context.createScriptProcessor !== 'function') {
        throw new Error('Neither AudioWorklet nor the compatibility recorder is available.');
      }
      node = context.createScriptProcessor(2048, 1, 1);
      node.onaudioprocess = event => {
        for (let c = 0; c < event.outputBuffer.numberOfChannels; c++) event.outputBuffer.getChannelData(c).fill(0);
        const samples = new Float32Array(event.inputBuffer.getChannelData(0));
        const duration = samples.length / context.sampleRate;
        const playbackTime = Number.isFinite(event.playbackTime) ? event.playbackTime : context.currentTime;
        // Input was captured before the output buffer's playback time.
        const startFrame = Math.max(0, Math.round((playbackTime - duration) * context.sampleRate));
        onChunk(samples, startFrame);
      };
      onState('Live listening (compatibility mode)');
    }
    source.connect(node);
    node.connect(output);
    output.connect(context.destination);
    stream.getAudioTracks().forEach(track => {
      track.onended = () => { if (!stopped) { onError(new Error('Microphone disconnected.')); void stop(); } };
    });
    throwIfAborted(signal);
    return { stop, armDetection, disarmDetection, nowMs: () => context.currentTime * 1000 };
  } catch (error) {
    await stop();
    if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
      throw new Error('Microphone permission was denied. Check browser or app permissions.');
    }
    throw error;
  }
}
