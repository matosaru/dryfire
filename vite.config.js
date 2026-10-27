import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { buildIdentity } from './tools/build-identity.mjs';
import { defineConfig } from 'vite';
import { readBuildProfile, resolveBuildEdition } from './tools/build-profile.mjs';
import { renderPageTemplates } from './tools/page-templates.mjs';
import { publicPagesPlugin } from './tools/public-pages.mjs';
import {publicRoute,publicAssetPath} from './site/routes.js';
import {isAppPath, offlineAppPaths, legacyPathRedirect, legacyRedirects} from './src/appPaths.js';
import { minifyProductionHtml, prioritizeAppStyles } from './tools/minify-html.mjs';

// Ship minified production code without exposing the readable src/ modules.
// Worker entries also pass through Oxc, unlike files copied from public/.
export default defineConfig(({ mode }) => {
  const edition = resolveBuildEdition({ defaultEdition: readBuildProfile(), explicit: process.env.APP_EDITION, mode });
  const identity=buildIdentity();
  return {
  define: { __BUILD_RELEASE_ID__: JSON.stringify(identity.release), __APP_NAV_REDIRECTS__: JSON.stringify(legacyRedirects()), __APP_OFFLINE_PATHS__: JSON.stringify(offlineAppPaths()), __BUILD_SOURCE_DIGEST__: JSON.stringify(identity.sourceDigest), __BUILD_EDITION__: JSON.stringify(edition), __FULL_PREVIEW__: JSON.stringify(edition === 'preview') },
  server: { host: '127.0.0.1' },
  // The optimized preview serves same-origin assets, like the production Worker.
  // Avoid development CORS Vary headers invalidating preloaded offline assets.
  preview: { host: '127.0.0.1', cors: false, ...(edition === 'preview' ? { headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' } } : {}) },
  plugins: [publicPagesPlugin(), { name: 'page-templates', transformIndexHtml: { order: 'pre', handler: renderPageTemplates },
    configurePreviewServer(server){server.middlewares.use((req,res,next)=>{
      const url=new URL(req.url,'http://localhost'),path=url.pathname,legacy=legacyPathRedirect(path);
      const target=legacy??(!path.endsWith('/')&&(isAppPath(path+'/')||publicRoute(path+'/'))?path+'/':null);
      if(target){res.statusCode=308;res.setHeader('Location',target+url.search);res.end();return;}
      const route=publicRoute(path);if(isAppPath(path)||route){
        try{res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('X-Robots-Tag','noindex, nofollow');res.end(readFileSync(resolve('dist','.'+(route?publicAssetPath(path):'/index.html'))));return;}
        catch{res.statusCode=404;res.end('Not found.');return;}
      }next();
    });},
    configureServer(server) {
      server.watcher.on('change', path => {
        if (path.startsWith(resolve(import.meta.dirname, 'src/templates') + '/')) server.ws.send({ type: 'full-reload' });
      });
    },
  }, { name: 'build-edition', transformIndexHtml(html) {
    html = html.replace(/<html\b/, `<html data-release-id="${identity.release}" data-build-edition="${edition}" data-feature-edition="public"`);
    html = html.replace(/<!-- private-preview:start -->([\s\S]*?)<!-- private-preview:end -->/g, (_, content) => edition === 'preview' ? content : '');
    return html;
  }, generateBundle: { order:'post', handler(options, bundle) {
    this.emitFile({ type: 'asset', fileName: 'edition.json', source: JSON.stringify({ version: 1, edition,
      sourceRevision: identity.sourceRevision, sourceDigest: identity.sourceDigest, release: identity.release,
      assetDigests: {...identity.assetDigests,...Object.fromEntries(Object.entries(bundle).filter(([path])=>/\.(?:js|css|gif|svg|png|ico)$/.test(path)).map(([path,item])=>['/'+path,createHash('sha256').update(item.type==='chunk'?item.code:item.source).digest('hex')]))},
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
        // Keep tiny shared page primitives together without pulling React into startup.
        codeSplitting: { groups: [{ name: 'pageFields', test: /\/packages\/ui\/src\/(?:PageHeading|GunContext|PreferenceToggle)\//, includeDependenciesRecursively: false }] },
        entryFileNames: chunk =>
          ['sw', 'pcm-capture.worklet'].includes(chunk.name)
            ? `${chunk.name}.js`
            : 'assets/[name]-[hash].js',
      },
    },
  },
  };
});
