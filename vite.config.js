import { resolve } from 'node:path';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vite';
import { readBuildProfile, resolveBuildEdition } from './tools/build-profile.mjs';
import { renderPageTemplates } from './tools/page-templates.mjs';
import { publicPagesPlugin } from './tools/public-pages.mjs';
import {publicRoute,publicAssetPath} from './site/routes.js';
import {isAppPath, offlineAppPaths} from './src/appPaths.js';
import { minifyProductionHtml, prioritizeAppStyles } from './tools/minify-html.mjs';

// Ship minified production code without exposing the readable src/ modules.
// Worker entries also pass through Oxc, unlike files copied from public/.
export default defineConfig(({ mode }) => {
  const edition = resolveBuildEdition({ defaultEdition: readBuildProfile(), explicit: process.env.APP_EDITION, mode });
  const sourceFiles = dir => readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? sourceFiles(`${dir}/${item.name}`) : /\.(js|html|ts|tsx|css)$/.test(item.name) ? [`${dir}/${item.name}`] : []);
  const trackedSources = ['index.html', 'src/styles.css', 'vite.config.js', 'build-profile.json', 'tools/build-profile.mjs', 'tools/page-templates.mjs', 'tools/minify-html.mjs', 'tools/static-catalog.mjs', 'tools/public-pages.mjs', ...sourceFiles('site'), ...sourceFiles('src'), ...sourceFiles('workers'), ...sourceFiles('apps'), ...sourceFiles('packages')].sort();
  const sourceDigest = createHash('sha256');
  for (const path of trackedSources) sourceDigest.update(path).update(readFileSync(path));
  return {
  define: { __APP_OFFLINE_PATHS__: JSON.stringify(offlineAppPaths()), __BUILD_SOURCE_DIGEST__: JSON.stringify(sourceDigest.copy().digest('hex')), __BUILD_EDITION__: JSON.stringify(edition), __FULL_PREVIEW__: JSON.stringify(edition === 'preview') },
  server: { host: '127.0.0.1' },
  // The optimized preview serves same-origin assets, like the production Worker.
  // Avoid development CORS Vary headers invalidating preloaded offline assets.
  preview: { host: '127.0.0.1', cors: false, ...(edition === 'preview' ? { headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' } } : {}) },
  plugins: [publicPagesPlugin(), { name: 'page-templates', transformIndexHtml: { order: 'pre', handler: renderPageTemplates },
    configurePreviewServer(server){server.middlewares.use((req,res,next)=>{const path=new URL(req.url,'http://localhost').pathname;if(isAppPath(path)||path==='/welcome/'||publicRoute(path)&&path!=='/'){const asset=isAppPath(path)?'/index.html':publicAssetPath(path==='/welcome/'?'/':path);try{res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('X-Robots-Tag','noindex, nofollow');res.end(readFileSync(resolve('dist','.'+asset)));return;}catch{res.statusCode=404;res.end('Not found.');return;}}next();});},
    configureServer(server) {
      server.watcher.on('change', path => {
        if (path.startsWith(resolve(import.meta.dirname, 'src/templates') + '/')) server.ws.send({ type: 'full-reload' });
      });
    },
  }, { name: 'build-edition', transformIndexHtml(html) {
    html = html.replace(/<html\b/, `<html data-build-edition="${edition}" data-feature-edition="public"`);
    html = html.replace(/<!-- private-preview:start -->([\s\S]*?)<!-- private-preview:end -->/g, (_, content) => edition === 'preview' ? content : '');
    return html;
  }, generateBundle: { order:'post', handler(options, bundle) {
    this.emitFile({ type: 'asset', fileName: 'edition.json', source: JSON.stringify({ version: 1, edition,
      sourceRevision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), sourceDigest: sourceDigest.digest('hex'),
      assets: Object.keys(bundle).filter(path => /\.(js|css)$/.test(path)).sort().map(path => `/${path}`) }, null, 2) + '\n' });
  } } }, { name: 'compact-production-html', generateBundle: { order: 'post', async handler(_options, bundle) {
    const html = bundle['index.html'];
    if (html?.type === 'asset') html.source = await minifyProductionHtml(prioritizeAppStyles(String(html.source)));
  } } }],
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
