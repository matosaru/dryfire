import { jest } from '@jest/globals';
import { getVibrationCapability, requestFeedbackVibration } from '../src/feedback.js';
import { createStartCuePlayer, playStartCuePreview } from '../src/startCue.js';
import { START_CUE_DURATION_SECONDS, START_CUE_FREQUENCY_HZ, START_CUE_PEAK_GAIN } from '../src/startCueProfile.js';

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
afterEach(() => {
  delete globalThis.AudioContext;
  if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
  else delete globalThis.navigator;
});

test('cue preparation is explicit; GO schedules a bounded tone and close releases resources', async () => {
  const oscillators = [];
  const contexts = [];
  const gains = [];
  globalThis.AudioContext = class {
    constructor() { this.state = 'suspended'; this.currentTime = 2; contexts.push(this); }
    async resume() { this.state = 'running'; }
    async close() { this.state = 'closed'; }
    createGain() { const gain = { connect() {}, disconnect: jest.fn(), gain: {
      setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn(),
    } }; gains.push(gain); return gain; }
    createOscillator() { const oscillator = { frequency: {}, connect() {}, disconnect: jest.fn(), start: jest.fn(), stop: jest.fn() }; oscillators.push(oscillator); return oscillator; }
  };
  const player = createStartCuePlayer();
  expect(player.play()).toBe(false);
  expect(await player.prepare()).toBe(true);
  expect(player.play()).toBe(true);
  expect(oscillators[0].start).toHaveBeenCalledWith(2);
  expect(oscillators[0].frequency.value).toBe(START_CUE_FREQUENCY_HZ);
  expect(oscillators[0].stop).toHaveBeenCalledWith(2 + START_CUE_DURATION_SECONDS);
  expect(gains[0].gain.linearRampToValueAtTime).toHaveBeenCalledWith(START_CUE_PEAK_GAIN, 2.008);
  await player.close();
  expect(contexts[0].state).toBe('closed');
  expect(player.play()).toBe(false);
});

test('unavailable or blocked audio does not claim a successful cue', async () => {
  const unavailable = createStartCuePlayer();
  expect(await unavailable.prepare()).toBe(false);
  expect(unavailable.play()).toBe(false);
  globalThis.AudioContext = class { constructor() { this.state = 'suspended'; } async resume() { throw new Error('blocked'); } async close() {} };
  const blocked = createStartCuePlayer();
  expect(await blocked.prepare()).toBe(false);
  expect(blocked.play()).toBe(false);
  await blocked.close();
});

test('cue preview prepares from a user action and closes its context after playback', async () => {
  jest.useFakeTimers();
  const close=jest.fn(async()=>{}),player={prepare:jest.fn(async()=>true),play:jest.fn(()=>true),close};
  await expect(playStartCuePreview({createPlayer:()=>player})).resolves.toBe(true);
  expect(player.prepare).toHaveBeenCalledTimes(1);expect(player.play).toHaveBeenCalledTimes(1);
  await jest.advanceTimersByTimeAsync(400);expect(close).toHaveBeenCalledTimes(1);
  jest.useRealTimers();
});

test('vibration absence, rejection and acceptance are distinct from physical verification', () => {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
  expect(getVibrationCapability()).toBe(false);
  expect(requestFeedbackVibration('go')).toEqual({ supported: false, accepted: false });
  const vibrate = jest.fn(() => false);
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { vibrate } });
  expect(getVibrationCapability()).toBe(true);
  expect(requestFeedbackVibration('go')).toEqual({ supported: true, accepted: false });
  vibrate.mockReturnValue(true);
  expect(requestFeedbackVibration('completion')).toEqual({ supported: true, accepted: true });
  expect(vibrate.mock.calls[1][0]).toEqual([25, 40, 25]);
  vibrate.mockImplementation(()=>{throw new Error('blocked');});
  expect(requestFeedbackVibration('go')).toEqual({supported:true,accepted:false});
});
