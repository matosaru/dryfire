import{readFileSync}from'node:fs';import assert from'node:assert/strict';
import{PUBLIC_ROUTES,CANONICAL_ORIGIN,publicAssetPath,sitemapXML,robotsTXT}from'../site/routes.js';
import{offlineAppPaths,isIndexableAppPath,legacyPathRedirect}from'../src/appPaths.js';
import site from'../workers/publicSite.js';
const dist=new URL('../dist/',import.meta.url);
const read=path=>readFileSync(new URL('.'+path,dist),'utf8');
const assets={fetch:async request=>{try{const path=new URL(request.url).pathname;return new Response(readFileSync(new URL('.'+path,dist)),{headers:{'Content-Type':path.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'}});}catch{return new Response('Not found.',{status:404});}}};
for(const route of PUBLIC_ROUTES){
 const html=read(publicAssetPath(route.path)),head=html.split('</head>')[0];
 assert.equal((head.match(/<title>/g)||[]).length,1);assert.equal((head.match(/name="description"/g)||[]).length,1);assert.equal((head.match(/rel="canonical"/g)||[]).length,1);
 assert(head.includes(`href="${CANONICAL_ORIGIN}${route.path}"`));assert(!head.includes('workers.dev'));
 assert.equal(html.includes('type="module"'),!!route.appView,`Shared app entry: ${route.path}`);
 const json=JSON.parse(head.match(/application\/ld\+json">([^<]+)<\/script>/)[1]);assert.equal(json.url,CANONICAL_ORIGIN+route.path);
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
 if(route.path==='/')assert(html.includes('id=gunSetupView')||html.includes('id="gunSetupView"'));
 else if(route.appView)assert(html.includes(route.heading),`Missing prerendered content ${route.path}`);
 const result=await site.fetch(new Request(CANONICAL_ORIGIN+route.path),{ASSETS:assets});assert.equal(result.status,200);assert.equal(result.headers.get('X-Robots-Tag'),null);assert.equal(await result.text(),html);
 for(const match of html.matchAll(/href=(?:"([^"]+)"|([^\s>]+))/g)){const target=match[1]??match[2];if(target.startsWith('/')){const res=await site.fetch(new Request(CANONICAL_ORIGIN+target),{ASSETS:assets});assert.equal(res.status,200,`Broken link ${target} in ${route.path}`);}}
}
const icon=readFileSync(new URL('favicon.ico',dist));assert.equal(icon.readUInt16LE(0),0);assert.equal(icon.readUInt16LE(2),1);assert.equal(icon.readUInt16LE(4),3);const favicon=await site.fetch(new Request(CANONICAL_ORIGIN+'/favicon.ico'),{ASSETS:assets});assert.equal(favicon.status,200);assert.equal(favicon.headers.get('Content-Type'),'image/x-icon');
assert.equal(read('/sitemap.xml'),sitemapXML());assert.equal(read('/robots.txt'),robotsTXT);
for(const path of offlineAppPaths().filter(path=>!isIndexableAppPath(path))){const result=await site.fetch(new Request(CANONICAL_ORIGIN+path),{ASSETS:assets});assert.equal(result.status,200);assert.match(result.headers.get('X-Robots-Tag'),/noindex/);}
for(const path of ['/app/','/app/history/','/app/settings/','/app/practice/par-time/','/welcome/']){const result=await site.fetch(new Request(CANONICAL_ORIGIN+path+'?keep=1'),{ASSETS:assets});assert.equal(result.status,308);assert.equal(result.headers.get('Location'),CANONICAL_ORIGIN+legacyPathRedirect(path)+'?keep=1');}
for(const path of ['/unknown/','/site/index.html','/app/unknown/'])assert.equal((await site.fetch(new Request(CANONICAL_ORIGIN+path),{ASSETS:assets})).status,404);
const preview=await site.fetch(new Request('https://preview.example/help/'),{ASSETS:assets});assert.match(preview.headers.get('X-Robots-Tag'),/noindex/);
console.log(`Public site verified: ${PUBLIC_ROUTES.length} canonical pages, app root, shared prerendered guides/About, flat routes, legacy redirects, metadata, links and XML/robots. Local Worker execution; live edge not verified.`);
