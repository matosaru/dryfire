import site from '../workers/publicSite.js';
import {PUBLIC_ROUTES,CANONICAL_ORIGIN,publicAssetPath,sitemapXML} from '../site/routes.js';
const env=()=>({ASSETS:{fetch:async request=>new Response(new URL(request.url).pathname,{headers:{'Content-Type':'text/html'}})}});
test('the application is the homepage on production and preview; About retains the editorial entry',async()=>{
 for(const origin of ['https://easydryfire.com','https://dryfire.matosaru.workers.dev']){const response=await site.fetch(new Request(origin+'/'),env());expect(await response.text()).toBe('/index.html');expect(response.headers.get('X-Robots-Tag')?.includes('noindex')??false).toBe(origin.includes('workers.dev'));}
 const about=await site.fetch(new Request(CANONICAL_ORIGIN+'/about/'),env());expect(await about.text()).toBe(publicAssetPath('/about/'));expect(about.headers.get('X-Robots-Tag')).toBeNull();
 const app=await site.fetch(new Request(CANONICAL_ORIGIN+'/settings/'),env());expect(await app.text()).toBe('/index.html');expect(app.headers.get('X-Robots-Tag')).toContain('noindex');
});
test('legacy app and editorial links redirect to their clean equivalent while preserving queries',async()=>{
 for(const[path,target]of Object.entries({'/app/':'/','/app/learn/':'/learn/','/app/practice/par-time/':'/par-time-practice/','/practice/par-time/':'/par-time-practice-guide/','/app/sequence/':'/drills/','/welcome/':'/about/'})){
  const response=await site.fetch(new Request(CANONICAL_ORIGIN+path+'?keep=1'),env());expect(response.status).toBe(308);expect(response.headers.get('Location')).toBe(CANONICAL_ORIGIN+target+'?keep=1');
 }
});
test('each sequence path is recognized independently, not collapsed to a generic session endpoint',async()=>{
 for(const path of ['/rack-slide-trigger-pull/','/magazine-change-trigger-pull/','/draw-magazine-change-trigger-pull/']){const response=await site.fetch(new Request(CANONICAL_ORIGIN+path),env());expect(response.status).toBe(200);expect(response.headers.get('X-Robots-Tag')).toContain('noindex');}
});
test('unknown/internal paths are real404s, canonical variants redirect once, HEAD is empty and unsafe methods fail',async()=>{
 for(const path of ['/not-a-page/','/site/index.html','/app/unknown/'])expect((await site.fetch(new Request(CANONICAL_ORIGIN+path),env())).status).toBe(404);
 const redirect=await site.fetch(new Request(CANONICAL_ORIGIN+'/learn?q=1'),env());expect(redirect.status).toBe(308);expect(redirect.headers.get('Location')).toBe(CANONICAL_ORIGIN+'/learn/?q=1');
 expect(await(await site.fetch(new Request(CANONICAL_ORIGIN+'/help/',{method:'HEAD'}),env())).text()).toBe('');expect((await site.fetch(new Request(CANONICAL_ORIGIN+'/help/',{method:'POST'}),env())).status).toBe(405);
});
test('sitemap contains canonical public content, including the app homepage and unique manuals, without private setup URLs',()=>{
 const xml=sitemapXML();expect(PUBLIC_ROUTES).toHaveLength(14);for(const route of PUBLIC_ROUTES)expect(xml).toContain(CANONICAL_ORIGIN+route.path);for(const path of ['/app/','/settings/','/history/','/rack-slide-trigger-pull/'])expect(xml).not.toContain('<loc>'+CANONICAL_ORIGIN+path+'</loc>');expect(new Set(PUBLIC_ROUTES.map(r=>r.title)).size).toBe(PUBLIC_ROUTES.length);
});
