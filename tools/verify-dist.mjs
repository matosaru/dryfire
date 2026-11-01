import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Script } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { readBuildProfile, resolveBuildEdition } from './build-profile.mjs';

const dist = new URL('../dist/', import.meta.url);
const distPath = fileURLToPath(dist);
const html = await readFile(new URL('index.html', dist), 'utf8');
const expectedEdition = resolveBuildEdition({ defaultEdition: readBuildProfile(), explicit: process.argv.find(arg => arg.startsWith('--edition='))?.slice('--edition='.length) ?? process.env.APP_EDITION });
const edition = JSON.parse(await readFile(new URL('edition.json', dist), 'utf8'));
if (edition.sourceRevision !== execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()) throw new Error('Artifact source revision does not match this checkout.');
if (!['public', 'preview'].includes(expectedEdition) || edition.edition !== expectedEdition ||
    !html.includes(`data-build-edition="${expectedEdition}"`) || !/^[a-f0-9]{40}$/.test(edition.sourceRevision) || !/^[a-f0-9]{64}$/.test(edition.sourceDigest)) {
  throw new Error('Build edition or source metadata does not match the requested artifact.');
}
if(!/^[a-f0-9]{64}$/.test(edition.release??'')||!html.includes(`data-release-id="${edition.release}"`))throw new Error('Release identity does not match the app document.');
if (html.includes('/src/main.js') || html.includes('/src/styles.css')) {
  throw new Error('The deploy directory contains unbundled development sources. Run npm run build.');
}
const files = await readdir(dist, { recursive: true });
if (expectedEdition === 'public' && /previewTestMode|previewTestingSection|previewModeBadge/.test(html)) throw new Error('Private testing controls leaked into public HTML.');
if (expectedEdition === 'preview' && !html.includes('id="previewTestMode"')) throw new Error('Preview testing controls are missing.');
const bundleAssets = files.filter(path => /\.(js|css)$/.test(path)).map(path => `/${path.replaceAll('\\', '/')}`).sort();
if (JSON.stringify(edition.assets) !== JSON.stringify(bundleAssets)) throw new Error('Build asset metadata is incomplete; lazy bundles must be available offline.');
if (!files.some(path => /assets[\\/].*\.js$/.test(path)) || !files.some(path => /assets[\\/].*\.css$/.test(path))) {
  throw new Error('Expected optimized JavaScript and CSS under dist/assets.');
}
if (files.some(path => path.endsWith('.map') || path.startsWith('src/') || path.startsWith('tests/') || path.startsWith('apps/') || path.startsWith('packages/') || path === 'vite.config.js')) {
  throw new Error('Source maps or development sources unexpectedly exposed in the deployment.');
}
const cssAssets = await Promise.all(files.filter(path => path.endsWith('.css')).map(async path => ({ path, css: await readFile(join(distPath, path), 'utf8') })));
const progressStyles = cssAssets.filter(({ css }) => css.includes('.progress-stats'));
if (expectedEdition === 'public' && progressStyles.length) throw new Error('Private progress styles leaked into the public build.');
if (expectedEdition === 'preview' && progressStyles.length) throw new Error('Private progress styles must stay inside their lazy JavaScript owner.');
const criticalStyle = html.match(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/)?.[1];
if (!criticalStyle || cssAssets.find(({ path }) => `/${path.replaceAll('\\', '/')}` === criticalStyle)?.css.includes('.progress-stats')) {
  throw new Error('Private progress styles must not block application startup.');
}
let progressStyleOwners = 0;
for (const file of files.filter(path => path.endsWith('.js'))) {
  const js = await readFile(join(distPath, file), 'utf8');
  if (js.includes('.progress-stats')) { progressStyleOwners++; if (!/assets[\\/]progressView-.*\.js$/.test(file)) throw new Error('Private progress styles escaped their lazy owner.'); }
  if (expectedEdition === 'public' && js.includes('progress-chart')) throw new Error('Optional chart implementation leaked into the public build.');
  if (expectedEdition === 'public' && /dryfire-private-preview-mode|previewTestMode/.test(js)) throw new Error('Private testing override leaked into public JavaScript.');
  if (js.includes('function renderClassCards()') || js.includes('function startContinuousListening(') || js.includes('class PcmCaptureProcessor extends AudioWorkletProcessor')) {
    throw new Error('Development code signatures detected in published JS; verify minifier settings.');
  }
}
if (expectedEdition === 'public' && progressStyleOwners) throw new Error('Private progress styles leaked into public JavaScript.');
if (expectedEdition === 'preview' && progressStyleOwners !== 1) throw new Error('Preview must contain one lazy progress style owner.');
for (const worker of ['sw.js', 'pcm-capture.worklet.js']) {
  if (!files.includes(worker)) throw new Error(`Missing bundled worker ${worker}`);
  new Script(await readFile(join(distPath, worker), 'utf8'), { filename: worker });
}
console.log(`${expectedEdition} assets verified: minified app + workers, matching edition/source metadata, no src/ modules or source maps.`);

await import('./verify-public-site.mjs');
