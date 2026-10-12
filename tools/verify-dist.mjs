import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const dist = new URL('../dist/', import.meta.url);
const distPath = fileURLToPath(dist);
const html = await readFile(new URL('index.html', dist), 'utf8');
const expectedEdition = process.argv.find(arg => arg.startsWith('--edition='))?.slice('--edition='.length) ?? 'public';
const edition = JSON.parse(await readFile(new URL('edition.json', dist), 'utf8'));
if (edition.sourceRevision !== execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()) throw new Error('Artifact source revision does not match this checkout.');
if (!['public', 'preview'].includes(expectedEdition) || edition.edition !== expectedEdition ||
    !html.includes(`data-build-edition="${expectedEdition}"`) || !/^[a-f0-9]{40}$/.test(edition.sourceRevision) || !/^[a-f0-9]{64}$/.test(edition.sourceDigest)) {
  throw new Error('Build edition or source metadata does not match the requested artifact.');
}
if (html.includes('/src/main.js') || html.includes('/src/styles.css')) {
  throw new Error('The deploy directory contains unbundled development sources. Run npm run build.');
}
const files = await readdir(dist, { recursive: true });
const bundleAssets = files.filter(path => /\.(js|css)$/.test(path)).map(path => `/${path.replaceAll('\\', '/')}`).sort();
if (JSON.stringify(edition.assets) !== JSON.stringify(bundleAssets)) throw new Error('Build asset metadata is incomplete; lazy bundles must be available offline.');
if (!files.some(path => /assets[\\/].*\.js$/.test(path)) || !files.some(path => /assets[\\/].*\.css$/.test(path))) {
  throw new Error('Expected optimized JavaScript and CSS under dist/assets.');
}
if (files.some(path => path.endsWith('.map') || path.startsWith('src/') || path.startsWith('tests/') || path === 'vite.config.js')) {
  throw new Error('Source maps or development sources unexpectedly exposed in the deployment.');
}
for (const file of files.filter(path => path.endsWith('.js'))) {
  const js = await readFile(join(distPath, file), 'utf8');
  if (expectedEdition === 'public' && js.includes('progress-chart')) throw new Error('Optional chart implementation leaked into the public build.');
  if (js.includes('function renderClassCards()') || js.includes('function startContinuousListening(') || js.includes('class PcmCaptureProcessor extends AudioWorkletProcessor')) {
    throw new Error('Development code signatures detected in published JS; verify minifier settings.');
  }
}
for (const worker of ['sw.js', 'pcm-capture.worklet.js']) {
  if (!files.includes(worker)) throw new Error(`Missing bundled worker ${worker}`);
}
console.log(`${expectedEdition} assets verified: minified app + workers, matching edition/source metadata, no src/ modules or source maps.`);
