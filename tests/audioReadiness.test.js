import {expect, jest, test} from '@jest/globals';
import { createAmbientReadinessEstimator, describeAmbientReadiness, monitorAudioCapture } from '../src/audioReadiness.js';

const rate = 8000;
const constant = (seconds, amplitude) => new Float32Array(Math.round(rate * seconds)).fill(amplitude);

test('ambient readiness uses robust frame statistics and ignores one short transient', () => {
  const estimator = createAmbientReadinessEstimator(rate, { minimumMs: 600 });
  const room = constant(.7, .002);
  room.fill(.2, 1600, 1680);
  estimator.push(room);
  const result = estimator.snapshot();
  expect(result.ready).toBe(true);
  expect(result.status).toBe('ready');
  expect(result.rmsMedian).toBeCloseTo(.002, 4);
  expect(result.recommendedNoiseFloor).toBeCloseTo(.002, 4);
});

test('ambient readiness does not claim ready before its bounded observation window', () => {
  const estimator = createAmbientReadinessEstimator(rate, { minimumMs: 600 });
  estimator.push(constant(.59, .001));
  expect(estimator.snapshot()).toMatchObject({ ready: false, status: 'preparing' });
  estimator.push(constant(.02, .001));
  expect(estimator.snapshot()).toMatchObject({ ready: true, status: 'ready' });
});

test('noisy rooms receive a plain-language corrective status', () => {
  const estimator = createAmbientReadinessEstimator(rate);
  estimator.push(constant(.7, .03));
  const result = estimator.snapshot();
  expect(result).toMatchObject({ ready: true, status: 'noisy' });
  expect(describeAmbientReadiness(result)).toMatch(/room is noisy/i);
  expect(describeAmbientReadiness({ ready: false, status: 'preparing' })).toMatch(/preparing microphone/i);
});

test.each([
  ['interrupted context', 'MICROPHONE_INTERRUPTED', ({context}) => { context.state = 'suspended'; context.onstatechange?.(); }],
  ['disconnected track', 'MICROPHONE_DISCONNECTED', ({track}) => track.onended()],
  ['muted track', 'MICROPHONE_MUTED', ({track}) => track.onmute()],
])('capture %s failures carry a stable localization code', (_name, code, trigger) => {
  const context = {state: 'running', addEventListener: (_type, listener) => { context.onstatechange = listener; }, removeEventListener: jest.fn()};
  const track = {};
  const stop = jest.fn();
  const onError = jest.fn();
  const monitor = monitorAudioCapture(context, {getAudioTracks: () => [track]}, () => true, () => Date.now(), onError, stop);

  trigger({context, track});

  expect(onError).toHaveBeenCalledWith(expect.objectContaining({code}));
  expect(stop).toHaveBeenCalledTimes(1);
  monitor.stop();
});

test('capture timeout reports a stable code when microphone frames stop arriving', () => {
  jest.useFakeTimers();
  try {
    const now = Date.now();
    const stop = jest.fn();
    const onError = jest.fn();
    const monitor = monitorAudioCapture({state: 'running'}, {getAudioTracks: () => []}, () => true, () => now, onError, stop);
    jest.advanceTimersByTime(3000);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({code: 'MICROPHONE_INPUT_STOPPED'}));
    expect(stop).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(3000);
    expect(onError).toHaveBeenCalledTimes(1);
    monitor.stop();
  } finally {
    jest.useRealTimers();
  }
});
