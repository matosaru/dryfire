import site from '../workers/publicSite.js';
import {PUBLIC_ROUTES,CANONICAL_ORIGIN,publicAssetPath,sitemapXML} from '../site/routes.js';
const env=()=>({ASSETS:{fetch:async request=>new Response(new URL(request.url).pathname,{headers:{'Content-Type':'text/html'}})}});
test('production public pages have canonical asset routing; app and legacy previews remain noindex',async()=>{
 const root=await site.fetch(new Request('https://easydryfire.com/'),env());expect(await root.text()).toBe(publicAssetPath('/'));expect(root.headers.get('X-Robots-Tag')).toBeNull();
 const app=await site.fetch(new Request('https://easydryfire.com/app/settings/'),env());expect(await app.text()).toBe('/index.html');expect(app.headers.get('X-Robots-Tag')).toContain('noindex');
 const legacy=await site.fetch(new Request('https://dryfire.matosaru.workers.dev/'),env());expect(await legacy.text()).toBe('/index.html');expect(legacy.headers.get('X-Robots-Tag')).toContain('noindex');
});
test('unknown/internal paths are real404s, public variants redirect once, HEAD has no body and unsafe methods fail',async()=>{
 expect((await site.fetch(new Request('https://easydryfire.com/not-a-page/'),env())).status).toBe(404);
 expect((await site.fetch(new Request('https://easydryfire.com/site/index.html'),env())).status).toBe(404);
 const redirect=await site.fetch(new Request('https://easydryfire.com/help?q=1'),env());expect(redirect.status).toBe(308);expect(redirect.headers.get('Location')).toBe('https://easydryfire.com/help/?q=1');
 expect(await(await site.fetch(new Request('https://easydryfire.com/help/',{method:'HEAD'}),env())).text()).toBe('');expect((await site.fetch(new Request('https://easydryfire.com/help/',{method:'POST'}),env())).status).toBe(405);
});
test('public sitemap contains only unique canonical public pages, never personal screens',()=>{
 expect(CANONICAL_ORIGIN).toBe('https://easydryfire.com');const xml=sitemapXML();expect(PUBLIC_ROUTES).toHaveLength(11);for(const route of PUBLIC_ROUTES)expect(xml).toContain(CANONICAL_ORIGIN+route.path);expect(xml).not.toContain('/app/');expect(new Set(PUBLIC_ROUTES.map(r=>r.title)).size).toBe(PUBLIC_ROUTES.length);
});
