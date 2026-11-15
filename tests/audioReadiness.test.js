import { jest } from '@jest/globals';
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

test('capture loss stops listening with an actionable message and releases monitor handlers when closed', () => {
  const listeners = new Map();
  const context = {
    state: 'running',
    addEventListener: jest.fn((name, handler) => listeners.set(name, handler)),
    removeEventListener: jest.fn(name => listeners.delete(name)),
  };
  const track = { onended: null, onmute: null };
  const stop = jest.fn();
  const onError = jest.fn();

  monitorAudioCapture(context, { getAudioTracks: () => [track] }, () => true, () => Date.now(), onError, stop);
  track.onmute();

  expect(stop).toHaveBeenCalledTimes(1);
  expect(onError.mock.calls[0][0].message).toMatch(/microphone muted.*check microphone access.*restart listening/i);
  context.state = 'closed';
  listeners.get('statechange')();
  expect(context.removeEventListener).toHaveBeenCalledWith('statechange', expect.any(Function));
  expect(track.onended).toBeNull();
  expect(track.onmute).toBeNull();
});
