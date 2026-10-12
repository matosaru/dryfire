import { resolve } from 'node:path';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vite';

// Ship minified production code without exposing the readable src/ modules.
// Worker entries also pass through Oxc, unlike files copied from public/.
export default defineConfig(({ mode }) => {
  const edition = process.env.APP_EDITION ?? (mode === 'full-preview' ? 'preview' : 'public');
  if (!['public', 'preview'].includes(edition)) throw new Error(`Unknown build edition: ${edition}`);
  const sourceFiles = dir => readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? sourceFiles(`${dir}/${item.name}`) : item.name.endsWith('.js') ? [`${dir}/${item.name}`] : []);
  const trackedSources = ['index.html', 'src/styles.css', 'vite.config.js', ...sourceFiles('src'), ...sourceFiles('workers')].sort();
  const sourceDigest = createHash('sha256');
  for (const path of trackedSources) sourceDigest.update(path).update(readFileSync(path));
  return {
  define: { __BUILD_EDITION__: JSON.stringify(edition), __FULL_PREVIEW__: JSON.stringify(edition === 'preview') },
  server: { host: '127.0.0.1' },
  // The optimized preview serves same-origin assets, like the production Worker.
  // Avoid development CORS Vary headers invalidating preloaded offline assets.
  preview: { host: '127.0.0.1', cors: false },
  plugins: [{ name: 'build-edition', transformIndexHtml(html) {
    html = html.replace(/<html\b/, `<html data-build-edition="${edition}"`);
    if (edition === 'preview') {
      html = html.replace('Choose a built-in or an existing saved preset. Each requires only the sounds in its sequence.', 'These require only the sounds in their sequence. Create your own or choose a built-in preset.');
      html = html.replace('Create up to two gun profiles. Existing saved profiles remain available.', 'You can save up to 5 guns.');
      html = html.replace('Learn your trigger click, choose a built-in practice mode and review saved timing results. Other sound categories are optional unless your drill uses them.', 'Keep separate profiles for up to five guns, create custom drills and view timing trends. Other sound categories are optional unless your drill uses them.');
    }
    return html;
  }, generateBundle(options, bundle) {
    this.emitFile({ type: 'asset', fileName: 'edition.json', source: JSON.stringify({ version: 1, edition,
      sourceRevision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), sourceDigest: sourceDigest.digest('hex'),
      assets: Object.keys(bundle).filter(path => /\.(js|css)$/.test(path)).sort().map(path => `/${path}`) }, null, 2) + '\n' });
  } }],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'oxc',
    cssMinify: 'lightningcss',
    sourcemap: false,
    target: 'safari16.4',
    rolldownOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        sw: resolve(import.meta.dirname, 'workers/sw.js'),
        'pcm-capture.worklet': resolve(import.meta.dirname, 'workers/pcm-capture.worklet.js'),
      },
      output: {
        entryFileNames: chunk =>
          ['sw', 'pcm-capture.worklet'].includes(chunk.name)
            ? `${chunk.name}.js`
            : 'assets/[name]-[hash].js',
      },
    },
  },
  };
});
