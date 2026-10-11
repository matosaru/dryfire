import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeRecording, extractFeatures } from '../src/audio.js';
import { classify, labels } from '../src/classifier.js';
import { normalizeMaxResults } from '../src/storage.js';
import { createEventDetector } from '../src/eventDetector.js';
import { evaluateEvents } from '../src/evaluation.js';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

test('audio analysis rejects silence and produces finite features', () => {
  const sound = new Float32Array(16000);
  for (let i = 4000; i < 6000; i++) sound[i] = Math.sin(i * Math.PI / 6) * 0.3;
  assert.equal(extractFeatures(sound, 8000).length, 15);
  assert.equal(analyzeRecording(sound, 8000).features.length, 15);
  assert.throws(() => analyzeRecording(new Float32Array(16000), 8000));
});

test('unknown sound is rejected; learned sound is matched', () => {
  const xs = labels.flatMap((label, i) => [0, 1, 2].map(j => ({
    label, features: [i * 10 + j * 0.1, i * 10 + j * 0.1, i * 10 + j * 0.1],
  })));
  assert.equal(classify(xs, [0.1, 0.1, 0.1]).label, 'draw');
  assert.equal(classify(xs, [100, 100, 100]).status, 'unknown');
});

test('history limit validation', () => {
  assert.equal(normalizeMaxResults(0), 1);
  assert.equal(normalizeMaxResults(501), 500);
});

test('continuous segmentation emits one foreground event', () => {
  const chunks = [];
  const detector = createEventDetector(8000, pcm => chunks.push(pcm));
  for (let chunk = 0; chunk < 50; chunk++) {
    const data = new Float32Array(256);
    if (chunk >= 10 && chunk < 13) {
      for (let i = 0; i < data.length; i++) data[i] = 0.3 * Math.sin(i / 3);
    }
    detector.push(data);
  }
  assert.equal(chunks.length, 1);
});

test('verified accuracy excludes unlabeled events', () => {
  const metrics = evaluateEvents([
    { label: 'draw', actualLabel: 'draw' },
    { label: 'reload', actualLabel: 'other' },
    { label: 'reload' },
  ]);
  assert.equal(metrics.verified, 2);
  assert.equal(metrics.accuracy, 0.5);
});

test('two separated mechanical-like transients become two detections', () => {
  const found = [];
  const detector = createEventDetector(8000, pcm => found.push(pcm));
  for (let chunk = 0; chunk < 110; chunk++) {
    const b = new Float32Array(256);
    if ((chunk >= 12 && chunk <= 14) || (chunk >= 70 && chunk <= 73)) {
      for (let i = 0; i < b.length; i++) b[i] = 0.32 * Math.sin(i / 3);
    }
    detector.push(b);
  }
  assert.equal(found.length, 2);
});

test('AudioWorklet produces output-muted chunks without external dependencies', () => {
  let processorClass;
  const messages = [];
  const scope = {
    AudioWorkletProcessor: class { constructor() { this.port = { postMessage: x => messages.push(x) }; } },
    registerProcessor: (_, klass) => { processorClass = klass; },
    Float32Array,
    currentFrame: 6400,
  };
  vm.runInNewContext(readFileSync(new URL('../workers/pcm-capture.worklet.js', import.meta.url), 'utf8'), scope);
  const processor = new processorClass();
  for (let i = 0; i < 8; i++) {
    const source = new Float32Array(128).fill(0.4);
    const destination = new Float32Array(128).fill(1);
    assert.equal(processor.process([[source]], [[destination]]), true);
    assert.ok(destination.every(value => value === 0));
    scope.currentFrame += 128;
  }
  assert.equal(messages.length, 1);
  assert.equal(messages[0].samples.length, 1024);
  assert.equal(messages[0].startFrame, 6400);
  assert.ok(messages[0].samples.every(value => Math.abs(value - 0.4) < 0.000001));
  for (let i = 0; i < 8; i++) {
    processor.process([[new Float32Array(128).fill(0.2)]], [[new Float32Array(128)]]);
    scope.currentFrame += 128;
  }
  assert.equal(messages[1].startFrame, 7424);
});


test('the four learned sound classes are distinct', () => {
  assert.deepEqual(labels, ['draw', 'rack', 'trigger', 'reload']);
});

test('continuous mic segmentation handles four consecutive actions', () => {
  const found = [];
  const rate = 8000;
  const detector = createEventDetector(rate, pcm => found.push(pcm));
  const sounds = [[0.35, 0.06], [0.77, 0.07], [1.22, 0.05], [1.66, 0.08]];
  const audio = new Float32Array(rate * 3);
  for (let i = 0; i < audio.length; i++) {
    const s = i / rate;
    if (sounds.some(([start, length]) => s >= start && s < start + length)) {
      audio[i] = 0.3 * Math.sin(i / 4);
    }
  }
  for (let i = 0; i < audio.length; i += 2048) detector.push(audio.slice(i, i + 2048));
  assert.equal(found.length, 4);
});

// The same sequence code powers both the app and dependency-free tests.
import { DRILLS, createDrillState, advanceDrill } from '../src/drills.js';

test('four initial drills preserve the exact requested order', () => {
  assert.deepEqual(DRILLS.map(d => [...d.steps]), [
    ['trigger'], ['rack', 'trigger'], ['reload', 'trigger'], ['draw', 'reload', 'trigger'],
  ]);
});

test('each preset can complete repeated sequences without stopping listening', () => {
  for (const drill of DRILLS) {
    let state = createDrillState(drill.id);
    for (let attempt = 0; attempt < 3; attempt++) {
      for (const step of drill.steps) state = advanceDrill(state, step);
      assert.equal(state.completed, attempt + 1);
      assert.equal(state.stepIndex, 0);
    }
  }
});

test('drill state ignores unknowns and resets on out-of-order sound', () => {
  let state = advanceDrill(createDrillState('draw-mag-trigger'), 'draw');
  state = advanceDrill(state, null);
  assert.equal(state.stepIndex, 1);
  state = advanceDrill(state, 'trigger');
  assert.equal(state.incorrect, 1);
  assert.equal(state.stepIndex, 0);
  assert.equal(state.completed, 0);
});
