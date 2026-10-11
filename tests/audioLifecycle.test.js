import { jest } from '@jest/globals';
import { recordFeatureVector, startContinuousListening } from '../src/audio.js';

const rate = 8000;
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
let contexts;
let nodes;
let track;
let stream;
let mediaDevices;

function node() { return { connect: jest.fn(), disconnect: jest.fn() }; }
function deferredCall(mock) {
  let notifyRequested;
  let resolve;
  const requested = new Promise(notify => { notifyRequested = notify; });
  const result = new Promise(finish => { resolve = finish; });
  mock.mockImplementation(() => {
    notifyRequested();
    return result;
  });
  return { requested, resolve };
}
function samples(seconds, sounds = []) {
  const pcm = new Float32Array(seconds * rate);
  for (let i = 0; i < pcm.length; i++) {
    if (sounds.some(([start, duration]) => i / rate >= start && i / rate < start + duration)) pcm[i] = 0.36 * Math.sin(i * 2 * Math.PI * 750 / rate);
  }
  return pcm;
}

beforeEach(() => {
  contexts = [];
  nodes = [];
  track = { stop: jest.fn(), getSettings: () => ({ noiseSuppression: false, autoGainControl: false }) };
  stream = { getTracks: () => [track], getAudioTracks: () => [track] };
  mediaDevices = {
    getUserMedia: jest.fn(async () => stream),
    getSupportedConstraints: () => ({ noiseSuppression: true, autoGainControl: true }),
  };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices } });
  globalThis.AudioContext = class {
    constructor() {
      Object.assign(this, { sampleRate: rate, currentTime: 1, state: 'running', destination: {},
        close: jest.fn(async () => { this.state = 'closed'; }), resume: jest.fn(async () => { this.state = 'running'; }) });
      contexts.push(this);
    }
    createMediaStreamSource() { return node(); }
    createGain() { return { ...node(), gain: { value: 0 } }; }
    createScriptProcessor() { const processor = { ...node(), onaudioprocess: null }; nodes.push(processor); return processor; }
  };
});

afterEach(() => {
  jest.useRealTimers();
  delete globalThis.AudioContext;
  delete globalThis.AudioWorkletNode;
  if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
  else delete globalThis.navigator;
});

test('captures a processing snapshot before asynchronous microphone permission', async () => {
  const permission = deferredCall(mediaDevices.getUserMedia);
  const preferences = { noiseFilter: true, autoGain: true };
  const pending = startContinuousListening({ onEvent() {}, audioPreferences: preferences });
  preferences.noiseFilter = false;
  preferences.autoGain = false;
  await permission.requested;
  permission.resolve(stream);
  const session = await pending;
  expect(mediaDevices.getUserMedia.mock.calls[0][0].audio).toMatchObject({ noiseSuppression: true, autoGainControl: true });
  await session.stop();
  await session.stop();
  expect(track.stop).toHaveBeenCalledTimes(1);
  expect(contexts[0].close).toHaveBeenCalledTimes(1);
});

test('reports actual continuous-track processing and does not apply live constraints', async () => {
  const reports = [];
  const session = await startContinuousListening({ onEvent() {}, audioPreferences: { noiseFilter: true }, onProcessing: report => reports.push(report) });
  expect(reports[0].noiseFilter.status).toBe('not-applied');
  expect(reports[0].autoGain.status).toBe('confirmed');
  await session.stop();
});

test('abort during pending permission closes a late stream before creating Web Audio', async () => {
  const permission = deferredCall(mediaDevices.getUserMedia);
  const controller = new AbortController();
  const pending = startContinuousListening({ onEvent() {}, signal: controller.signal });
  await permission.requested;
  controller.abort();
  permission.resolve(stream);
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(track.stop).toHaveBeenCalledTimes(1);
  expect(contexts).toHaveLength(0);
});

test('training uses the same saved processing options and releases its microphone on cancellation', async () => {
  jest.useFakeTimers();
  const controller = new AbortController();
  const report = jest.fn();
  const pending = recordFeatureVector(() => {}, { audioPreferences: { noiseFilter: true, autoGain: true }, onProcessing: report, signal: controller.signal });
  await jest.advanceTimersByTimeAsync(100);
  controller.abort();
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(mediaDevices.getUserMedia.mock.calls[0][0].audio).toMatchObject({ noiseSuppression: true, autoGainControl: true });
  expect(report).toHaveBeenCalled();
  expect(track.stop).toHaveBeenCalledTimes(1);
  expect(contexts[0].close).toHaveBeenCalledTimes(1);
});

test('cancellation from a processing report does not open a new recording context', async () => {
  const controller = new AbortController();
  const pending = recordFeatureVector(() => {}, { signal: controller.signal,
    onProcessing: () => controller.abort(),
  });
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(track.stop).toHaveBeenCalledTimes(1);
  expect(contexts).toHaveLength(0);
});

test('abort while the worklet loads releases acquired resources and prevents fallback startup', async () => {
  globalThis.AudioContext.prototype.audioWorklet = { addModule: jest.fn() };
  const module = deferredCall(globalThis.AudioContext.prototype.audioWorklet.addModule);
  globalThis.AudioWorkletNode = class { constructor() { throw new Error('Must not construct an aborted node'); } };
  const controller = new AbortController();
  const pending = startContinuousListening({ onEvent() {}, signal: controller.signal });
  await module.requested;
  controller.abort();
  expect(track.stop).toHaveBeenCalledTimes(1);
  module.resolve();
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(nodes).toHaveLength(0);
  expect(contexts[0].close).toHaveBeenCalledTimes(1);
});

test('disarmed countdown and capture-time cue guard reject queued PCM but retain the next real sound', async () => {
  globalThis.AudioContext.prototype.audioWorklet = { addModule: jest.fn(async () => {}) };
  globalThis.AudioWorkletNode = class {
    constructor() { Object.assign(this, node(), { port: { onmessage: null } }); nodes.push(this); }
  };
  const found = [];
  const session = await startContinuousListening({ detectionEnabled: false, onEvent: (_pcm, _rate, metadata) => found.push(metadata) });
  nodes[0].port.onmessage({ data: { samples: samples(1, [[0.2, 0.1]]), startFrame: 0 } });
  session.armDetection({ guardMs: 300 });
  // Delivered after GO, but captured entirely before it: must remain excluded.
  nodes[0].port.onmessage({ data: { samples: samples(1, [[0.2, 0.1]]), startFrame: 0 } });
  // One queued buffer crosses the guard. The beep is discarded; the real sound survives.
  nodes[0].port.onmessage({ data: { samples: samples(1, [[0.05, 0.1], [0.6, 0.1]]), startFrame: rate } });
  expect(found).toHaveLength(1);
  expect(found[0].onsetMs).toBeCloseTo(1600, 0);
  expect(session.nowMs()).toBe(1000);
  session.disarmDetection();
  nodes[0].port.onmessage({ data: { samples: samples(1, [[0.2, 0.1]]), startFrame: 2 * rate } });
  expect(found).toHaveLength(1);
  await session.stop();
});

test('silent arm has no guard and ScriptProcessor timestamps describe capture onset', async () => {
  const found = [];
  const session = await startContinuousListening({ detectionEnabled: false, onEvent: (_pcm, _rate, metadata) => found.push(metadata) });
  session.armDetection();
  const pcm = samples(1, [[0.05, 0.1]]);
  nodes[0].onaudioprocess({ playbackTime: 2,
    inputBuffer: { duration: 1, getChannelData: () => pcm },
    outputBuffer: { numberOfChannels: 1, getChannelData: () => new Float32Array(pcm.length) },
  });
  expect(found).toHaveLength(1);
  expect(found[0].onsetMs).toBeCloseTo(1050, 0);
  await session.stop();
});

test('default continuous listening still emits successive sounds until explicitly stopped', async () => {
  const found = [];
  const session = await startContinuousListening({ onEvent: (_pcm, _rate, metadata) => found.push(metadata) });
  const pcm = samples(2.5, [[0.2, 0.1], [0.7, 0.1], [1.2, 0.1], [1.7, 0.1]]);
  for (let offset = 0; offset < pcm.length; offset += 2048) {
    const chunk = pcm.slice(offset, offset + 2048);
    const startTime = 1 + offset / rate;
    nodes[0].onaudioprocess({ playbackTime: startTime + chunk.length / rate,
      inputBuffer: { getChannelData: () => chunk },
      outputBuffer: { numberOfChannels: 1, getChannelData: () => new Float32Array(chunk.length) },
    });
  }
  expect(found).toHaveLength(4);
  expect(found.map(row => row.onsetMs)).toEqual([1200, 1700, 2200, 2700]);
  await session.stop();
  expect(nodes[0].onaudioprocess).toBeNull();
  expect(track.stop).toHaveBeenCalledTimes(1);
});

test('the level indicator retains a short click between throttled updates', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(1000);
  globalThis.AudioContext.prototype.audioWorklet = { addModule: jest.fn(async () => {}) };
  globalThis.AudioWorkletNode = class {
    constructor() { Object.assign(this, node(), { port: { onmessage: null } }); nodes.push(this); }
  };
  const onLevel = jest.fn();
  const session = await startContinuousListening({ onEvent() {}, onLevel });
  const push = (amplitude, startFrame) => nodes[0].port.onmessage({ data: { samples: new Float32Array(128).fill(amplitude), startFrame } });
  push(0, 0);
  jest.advanceTimersByTime(25);
  push(.025, 128);
  jest.advanceTimersByTime(75);
  push(0, 256);
  expect(onLevel.mock.calls.at(-1)[0]).toBeGreaterThan(0);
  await session.stop();
});

test('a cue gate inside a PCM chunk preserves the later genuine event signature', async () => {
  const { createEventDetector } = await import('../src/eventDetector.js');
  const { analyzeRecording } = await import('../src/audio.js');
  const { classify } = await import('../src/classifier.js');
  const pcm = samples(.8, [[.2, .12]]);
  let expected;
  createEventDetector(rate, data => { expected = analyzeRecording(data, rate).features; }).push(pcm, rate);
  globalThis.AudioContext.prototype.audioWorklet = { addModule: jest.fn(async () => {}) };
  globalThis.AudioWorkletNode = class {
    constructor() { Object.assign(this, node(), { port: { onmessage: null } }); nodes.push(this); }
  };
  let actual;
  const session = await startContinuousListening({ detectionEnabled: false, onEvent: data => { actual = analyzeRecording(data, rate).features; } });
  contexts[0].currentTime = 1.002;
  session.armDetection({ guardMs: 80 });
  nodes[0].port.onmessage({ data: { samples: pcm, startFrame: rate } });
  const positives = Array.from({ length: 3 }, () => ({ label: 'trigger', features: expected }));
  expect(classify(positives, actual, { enabledLabels: ['trigger'] }).label).toBe('trigger');
  expect(actual).toEqual(expected);
  await session.stop();
});
