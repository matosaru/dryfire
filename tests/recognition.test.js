import { analyzeRecording } from '../src/audio.js';
import { createEventDetector } from '../src/eventDetector.js';
import { recognizeRecording } from '../src/recognition.js';
const rate = 48000;
function recording(frequency, amplitude = .065) {
  const pcm = new Float32Array(rate * 2);
  for (let i = 0; i < rate * .12; i++) pcm[Math.round(rate * .6) + i] = Math.sin(2 * Math.PI * frequency * i / rate) * amplitude;
  return pcm;
}
function segmented(pcm) { let event; createEventDetector(rate, data => { event = data; }).push(pcm); return event; }
const examples = pcm => Array.from({ length: 3 }, () => ({ label: 'trigger', features: analyzeRecording(pcm, rate).features }));
test('live segmentation recognizes a click calibrated from an actual two-second Learn window', () => {
  const pcm = recording(2800);
  expect(recognizeRecording(examples(pcm), segmented(pcm), rate).label).toBe('trigger');
});
test('existing short-window profiles continue to match without replacing their data', () => {
  const pcm = segmented(recording(2800));
  expect(recognizeRecording(examples(pcm), pcm, rate).label).toBe('trigger');
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
