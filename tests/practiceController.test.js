/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { serialize, deserialize } from 'node:v8';
import { controllerPage, deferred, clickPcm } from './helpers/controllerDom.js';

const audio = await import('../src/audio.js');
const capture = jest.fn(), save = jest.fn(), set = jest.fn(), get = jest.fn();
const cue = { prepare: jest.fn(), play: jest.fn(), close: jest.fn() };
jest.unstable_mockModule('../src/audio.js', () => ({ ...audio, startContinuousListening: capture }));
jest.unstable_mockModule('../src/storage.js', () => ({ getGunSetting: get, setGunSetting: set, saveSession: save }));
jest.unstable_mockModule('../src/feedback.js', () => ({ createStartCuePlayer: () => cue, requestFeedbackVibration: () => ({ supported: true, accepted: true }) }));
const { createPracticeController } = await import('../src/practiceController.js');
const library = JSON.parse(readFileSync(new URL('../visual-tests/fixtures/library.json', import.meta.url)));
const originalClone = globalThis.structuredClone;
let controller, context, callbacks, input, captureCalled, session, options, cueTimes;
const $ = id => document.getElementById(id);
const submit = () => $('practiceConfigForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
const config = { repetitions: 2, delayMode: 'fixed', fixedDelaySeconds: 1, soundAtStart: true };
beforeEach(() => {
  globalThis.structuredClone = value => deserialize(serialize(value));
  jest.useFakeTimers();
  document.body.innerHTML = '<input id="safetyAck" type="checkbox" checked><div id="practiceCatalog"></div>' + controllerPage('practice');
  context = { gun: library.guns[0], examples: library.examples.filter(row => row.gunId === library.guns[0].id), calibration: [], available: true, audioPreferences: { noiseFilter: true } };
  callbacks = Object.fromEntries(['onNavigate','onBack','onChange','onError','onStatus','onProcessing','onVibration'].map(key => [key, jest.fn()]));
  callbacks.ensureSafe = jest.fn(() => true);
  input = deferred(); captureCalled = deferred(); cueTimes = [];
  session = { nowMs: () => performance.now(), waitForInput: () => input.promise,
    stop: jest.fn(async () => {}), armDetection: jest.fn(), suppressDetection: jest.fn(), disarmDetection: jest.fn() };
  capture.mockReset().mockImplementation(async value => { options = value; captureCalled.resolve(); return session; });
  get.mockReset().mockImplementation(async (_key, fallback) => fallback); set.mockReset().mockResolvedValue(undefined); save.mockReset().mockResolvedValue(undefined);
  cue.prepare.mockReset().mockResolvedValue(true); cue.play.mockReset().mockImplementation(() => { cueTimes.push(performance.now()); return true; }); cue.close.mockReset().mockResolvedValue(undefined);
  controller = createPracticeController({ ...callbacks, getContext: () => context, titleFor: label => label, vibrationEnabled: () => false });
});
afterEach(async () => {
  await controller.interrupt('test-cleanup');
  jest.useRealTimers(); globalThis.structuredClone = originalClone; document.body.replaceChildren();
});

test.each(['single','repeated','par','control','reload','free'])('%s configuration keeps a focused, editable setup without requesting audio', async mode => {
  await controller.open(mode, config);
  expect(document.activeElement).toBe($('practice-title'));
  expect($('practiceConfigure').classList.contains('hidden')).toBe(false);
  expect($('practiceStartBtn').disabled).toBe(false);
  expect(capture).not.toHaveBeenCalled();
  expect($('practiceDuration').disabled).toBe(mode !== 'free');
  expect($('practicePar').disabled).toBe(mode !== 'par');
});

test('invalid drafts stay visible and do not overwrite the saved gun configuration', async () => {
  await controller.open('single', config);
  $('practiceRepetitions').value = '';
  $('practiceConfigForm').dispatchEvent(new Event('change', { bubbles: true }));
  await controller.flush();
  expect($('practiceRepetitions').value).toBe('');
  expect($('practiceStartBtn').disabled).toBe(true);
  expect(set).not.toHaveBeenCalled();
});

test('a pending safety confirmation cannot acquire microphone input', async () => {
  callbacks.ensureSafe.mockReturnValue(false);
  await controller.open('single', config); submit();
  await jest.advanceTimersByTimeAsync(0);
  expect(callbacks.ensureSafe).toHaveBeenCalledTimes(1);
  expect(capture).not.toHaveBeenCalled();
  expect(controller.locked()).toBe(false);
});

test('countdown waits for input; a duplicate submit cannot acquire another microphone', async () => {
  await controller.open('single', config); submit(); submit();
  await captureCalled.promise;
  await jest.advanceTimersByTimeAsync(2000);
  expect($('practiceRun').dataset.phase).toBe('connecting');
  expect(cue.play).not.toHaveBeenCalled(); expect(capture).toHaveBeenCalledTimes(1);
  input.resolve(); await jest.advanceTimersByTimeAsync(0); await controller.flush();
  expect($('practiceRun').dataset.phase).toBe('countdown');
  expect(session.armDetection).toHaveBeenCalledWith({ guardMs: 0 });
});

test('stop during input preparation cancels late completion without a countdown or beep', async () => {
  await controller.open('single', config); submit(); await captureCalled.promise;
  await jest.advanceTimersByTimeAsync(0);
  await controller.interrupt();
  input.resolve(); await jest.advanceTimersByTimeAsync(3000);
  expect(options.signal.aborted).toBe(true); expect(session.stop).toHaveBeenCalled();
  expect(cue.play).not.toHaveBeenCalled(); expect(controller.locked()).toBe(false);
  expect($('practiceConfigure').classList.contains('hidden')).toBe(false);
});

test('early miss automatically re-arms and a first 200 ms click completes the second attempt', async () => {
  await controller.open('single', config); submit(); await captureCalled.promise;
  input.resolve(); await jest.advanceTimersByTimeAsync(0); await controller.flush();
  const { samples, rate } = clickPcm();
  await jest.advanceTimersByTimeAsync(400); options.onEvent(samples, rate, { onsetMs: 200 }); await controller.flush();
  expect($('practiceLatest').textContent).toContain('early trigger'); expect(cue.play).not.toHaveBeenCalled();
  await jest.advanceTimersByTimeAsync(1200); await controller.flush();
  expect($('practiceRun').dataset.phase).toBe('active'); expect(cueTimes).toHaveLength(1);
  await jest.advanceTimersByTimeAsync(800); // Segmentation delivers after the acoustic onset.
  options.onEvent(samples, rate, { onsetMs: cueTimes[0] + 200 }); await controller.flush();
  expect($('practiceReview').classList.contains('hidden')).toBe(false);
  expect(save.mock.calls.at(-1)[0]).toMatchObject({ gunId: context.gun.id, completed: 2, shots: 1 });
  expect(save.mock.calls.at(-1)[0].repetitions[0]).toMatchObject({ status: 'miss', reason: 'early' });
  expect(session.stop).toHaveBeenCalled(); expect(callbacks.onError).not.toHaveBeenCalled();
});

test('failed input readiness releases capture and leaves an actionable error', async () => {
  await controller.open('single', config); submit(); await captureCalled.promise;
  input.reject(new Error('No audio input arriving'));
  await jest.advanceTimersByTimeAsync(0);
  expect(callbacks.onError.mock.calls[0][0].message).toBe('No audio input arriving');
  expect(session.stop).toHaveBeenCalled(); expect(cue.close).toHaveBeenCalled();
  expect(controller.locked()).toBe(false); expect(cue.play).not.toHaveBeenCalled();
});

test('a changed gun cannot apply a late saved configuration or restore another gun review', async () => {
  const stored = deferred(); get.mockReturnValueOnce(stored.promise);
  const opening = controller.open('single'); context = { ...context, gun: library.guns[1] };
  stored.resolve({ single: config }); await opening;
  expect(callbacks.onNavigate).not.toHaveBeenCalled();
  controller.showRecord({ kind: 'practice', gunId: library.guns[0].id });
  expect(callbacks.onNavigate).not.toHaveBeenCalled();
});

test('failed persistence retains the owned record and retry saves the same session', async () => {
  save.mockRejectedValueOnce(new Error('Storage full'));
  await controller.open('single', config); submit(); await captureCalled.promise;
  input.resolve(); await jest.advanceTimersByTimeAsync(0); await controller.flush();
  expect(controller.hasUnsavedResults()).toBe(true);
  expect($('practiceSaved').textContent).toContain('Not saved');
  expect(session.stop).toHaveBeenCalled();
  const id = save.mock.calls[0][0].id;
  $('practiceRetryBtn').click(); await controller.flush();
  expect(controller.hasUnsavedResults()).toBe(false);
  expect(save.mock.calls.at(-1)[0]).toMatchObject({id,gunId:context.gun.id});
  expect($('practiceSaved').textContent).toBe('Saved on this device');
});

test('ten start/stop cycles release every capture and leave no timer running', async () => {
  const sessions = [];
  capture.mockImplementation(async value => {
    options = value;
    const current = {...session,waitForInput:async()=>{},stop:jest.fn(async()=>{})};
    sessions.push(current); return current;
  });
  for(let i=0;i<10;i++) {
    await controller.open('single',{...config,fixedDelaySeconds:0}); submit();
    await jest.advanceTimersByTimeAsync(80); await controller.flush();
    expect(controller.locked()).toBe(true);
    await controller.interrupt(); await controller.flush();
    expect(controller.locked()).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  }
  expect(sessions).toHaveLength(10);
  for(const current of sessions) expect(current.stop).toHaveBeenCalledTimes(1);
  expect(callbacks.onError).not.toHaveBeenCalled();
});
