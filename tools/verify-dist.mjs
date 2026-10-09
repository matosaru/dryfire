import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);
const distPath = fileURLToPath(dist);
const html = await readFile(new URL('index.html', dist), 'utf8');
if (html.includes('/src/main.js') || html.includes('/src/styles.css')) {
  throw new Error('The deploy directory contains unbundled development sources. Run npm run build.');
}
const files = await readdir(dist, { recursive: true });
if (!files.some(path => /assets[\\/].*\.js$/.test(path)) || !files.some(path => /assets[\\/].*\.css$/.test(path))) {
  throw new Error('Expected optimized JavaScript and CSS under dist/assets.');
}
if (files.some(path => path.endsWith('.map') || path.startsWith('src/') || path.startsWith('tests/') || path === 'vite.config.js')) {
  throw new Error('Source maps or development sources unexpectedly exposed in the deployment.');
}
for (const file of files.filter(path => path.endsWith('.js'))) {
  const js = await readFile(join(distPath, file), 'utf8');
  if (js.includes('function renderClassCards()') || js.includes('function startContinuousListening(') || js.includes('class PcmCaptureProcessor extends AudioWorkletProcessor')) {
    throw new Error('Development code signatures detected in published JS; verify minifier settings.');
  }
}
for (const worker of ['sw.js', 'pcm-capture.worklet.js']) {
  if (!files.includes(worker)) throw new Error(`Missing bundled worker ${worker}`);
}
console.log('Production assets verified: minified app + workers, no src/ modules or source maps.');
