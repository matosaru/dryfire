import { readFileSync } from 'node:fs';
import { createEventDetector } from '../../src/eventDetector.js';

const read = name => readFileSync(new URL(`../../src/templates/${name}.html`, import.meta.url), 'utf8');
// Use the exact maintained page/run/review markup, rather than a test-only UI.
export function controllerPage(name) {
  return read(`pages/${name}`).replace(/\{\{(practice|session)(Run|Review)\}\}/g,
    (_, kind, state) => read(`shared/${kind}-${state.toLowerCase()}`));
}

export function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

export function clickPcm() {
  const rate = 48000, samples = new Float32Array(rate * 0.72);
  for (let i = 0; i < rate * 0.12; i++) samples[Math.round(rate * 0.2) + i] = Math.sin(2 * Math.PI * 2800 * i / rate) * 0.065;
  let segmented;
  createEventDetector(rate, pcm => { segmented = pcm; }).push(samples);
  if (!segmented) throw new Error('Synthetic click was not segmented by the real detector.');
  return { rate, samples: segmented };
}
