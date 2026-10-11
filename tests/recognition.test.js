import { analyzeRecording } from '../src/audio.js';
import { createEventDetector } from '../src/eventDetector.js';
import { recognizeRecording } from '../src/recognition.js';
const rate = 48000;
function recording(frequency, amplitude = .065, start = .6, duration = .12) {
  const pcm = new Float32Array(rate * 2);
  for (let i = 0; i < rate * duration; i++) pcm[Math.round(rate * start) + i] = Math.sin(2 * Math.PI * frequency * i / rate) * amplitude;
  return pcm;
}
function segmented(pcm) { let event; createEventDetector(rate, data => { event = data; }).push(pcm); return event; }
const examples = pcm => Array.from({ length: 3 }, () => ({ label: 'trigger', features: analyzeRecording(pcm, rate).features }));
function withRoomNoise(pcm, seed) {
  return pcm.map(value => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return value + (seed / 0x100000000 - .5) * .001;
  });
}
test('live segmentation recognizes a click calibrated from an actual two-second Learn window', () => {
  const pcm = recording(2800);
  expect(recognizeRecording(examples(pcm), segmented(pcm), rate).label).toBe('trigger');
});
test('existing short-window profiles continue to match without replacing their data', () => {
  const pcm = segmented(recording(2800));
  expect(recognizeRecording(examples(pcm), pcm, rate).label).toBe('trigger');
});
test('an early click in Learn matches a later streaming click without retraining', () => {
  const model = examples(recording(2800, .065, .08));
  expect(recognizeRecording(model, segmented(recording(2800)), rate).label).toBe('trigger');
});
test('the same learned click still matches after a modest microphone-volume change', () => {
  const model = [.064, .065, .066].map(amplitude => ({ label: 'trigger', features: analyzeRecording(recording(2800, amplitude), rate).features }));
  for (const amplitude of [.052, .078]) {
    expect(recognizeRecording(model, segmented(recording(2800, amplitude)), rate).label).toBe('trigger');
  }
});
test('a quiet click accepted in Learn reaches live recognition', () => {
  const pcm = recording(2800, .02, .6, .025);
  const model = examples(pcm);
  const event = segmented(pcm);
  expect(event).toBeDefined();
  expect(recognizeRecording(model, event, rate).label).toBe('trigger');
});
test('streaming matching retains the quiet background present in real Learn recordings', () => {
  const model = [1, 2, 3].map(seed => ({ label: 'trigger', features: analyzeRecording(withRoomNoise(recording(2800), seed), rate).features }));
  const event = segmented(withRoomNoise(recording(2800), 4));
  expect(recognizeRecording(model, event, rate).label).toBe('trigger');
});
test('recorded reset/noise evidence still vetoes a shot and distant sound remains unknown', () => {
  const positive = recording(2800), reset = recording(900, .12), noise = recording(600);
  const negatives = [reset, noise].map(pcm => ({ features: analyzeRecording(pcm, rate).features }));
  const model = examples(positive), options = { negativeExamples: negatives };
  expect(recognizeRecording(model, segmented(positive), rate, options).label).toBe('trigger');
  expect(recognizeRecording(model, segmented(reset), rate, options).label).toBeNull();
  expect(recognizeRecording(model, segmented(noise), rate, options).label).toBeNull();
  expect(recognizeRecording(model, segmented(recording(15000)), rate, options).label).toBeNull();
});

test('near-identical recorded reset and press remain conservatively unknown', () => {
  const press = recording(2800), reset = recording(2800, .066);
  const options = { negativeExamples: [{ features: analyzeRecording(reset, rate).features }] };
  expect(recognizeRecording(examples(press), segmented(press), rate, options).label).toBeNull();
  expect(recognizeRecording(examples(press), segmented(reset), rate, options).label).toBeNull();
});
