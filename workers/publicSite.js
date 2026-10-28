import {publicRoute,publicAssetPath,CANONICAL_ORIGIN} from '../site/routes.js';
import {isAppPath,parseAppPath,appPathFor,appTitleFor,legacyPathRedirect} from '../src/appPaths.js';
const noindex='noindex, nofollow, noarchive';
const text=(body,status=404)=>new Response(body,{status,headers:{'Content-Type':'text/plain; charset=utf-8','X-Robots-Tag':noindex}});
async function missing(request,env){if(!env.ASSETS)return text('Not found.');const result=await env.ASSETS.fetch(new Request(new URL('/404.html',request.url),request));return new Response(request.method==='HEAD'?null:result.body,{status:404,headers:{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':noindex,'Cache-Control':'no-store'}});}
export default {async fetch(request,env){
 const url=new URL(request.url),production=url.hostname==='easydryfire.com';
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD','X-Robots-Tag':noindex}});
 if(url.pathname.startsWith('/site/'))return missing(request,env);
 const path=url.pathname,legacy=legacyPathRedirect(path);
 const canonical=legacy??(!path.endsWith('/')&&(publicRoute(path+'/')||isAppPath(path+'/'))?path+'/':path);
 if(url.hostname==='www.easydryfire.com'||production&&url.protocol!=='https:')return Response.redirect(CANONICAL_ORIGIN+canonical+url.search,308);
 if(canonical!==path)return Response.redirect(url.origin+canonical+url.search,308);
 const route=publicRoute(path),app=isAppPath(path);
 let asset=route?publicAssetPath(path):app?'/index.html':path,indexable=!!route&&production;
 if(!route&&!app){
  if(path==='/robots.txt'&&!production)return new Response(request.method==='HEAD'?null:'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain; charset=utf-8','X-Robots-Tag':noindex}});
  if(path==='/sitemap.xml'||path==='/robots.txt')indexable=production;
  else if(!/^\/(?:assets\/[a-zA-Z0-9_.-]+\.(?:js|css)|(?:motions|gun-types|guide-examples)\/[a-zA-Z0-9_.-]+\.(?:svg|gif)|(?:logo\.svg|favicon\.ico|icon-192\.png|icon-512\.png|apple-touch-icon\.png|manifest\.webmanifest|edition\.json|sw\.js|pcm-capture\.worklet\.js))$/.test(path))return missing(request,env);
 }
 if(!env.ASSETS)return text('Static assets are unavailable.',503);
 if(production&&/^\/(?:favicon\.ico|logo\.svg|icon-192\.png|icon-512\.png|apple-touch-icon\.png)$/.test(path))indexable=true;
 const target=new URL(url);target.pathname=asset;target.search='';
 const response=await env.ASSETS.fetch(new Request(target,request)),headers=new Headers(response.headers);
 if(indexable&&response.status===200)headers.delete('X-Robots-Tag');else headers.set('X-Robots-Tag',noindex);
 headers.set('X-Content-Type-Options','nosniff');
 if(path==='/favicon.ico')headers.set('Content-Type','image/x-icon');
 if(path==='/sitemap.xml')headers.set('Content-Type','application/xml; charset=utf-8');
 if(path==='/robots.txt')headers.set('Content-Type','text/plain; charset=utf-8');
 let body=request.method==='HEAD'?null:response.body;
 if(response.status===200&&app&&!route&&request.method!=='HEAD'){
  const identity=parseAppPath(path);body=(await response.text()).replace(/<title>[^<]*<\/title>/,'<title>'+appTitleFor(identity)+'</title>').replace(/(<link rel="canonical" href=")[^"]+/, '$1'+CANONICAL_ORIGIN+appPathFor(identity)).replace(/(<meta name="robots" content=")[^"]+/, '$1noindex, nofollow').replace(/<script\b[^>]*id="page-structured-data"[^>]*>[\s\S]*?<\/script>/g,'');
  headers.delete('Content-Length');headers.delete('ETag');
 }
 if(response.status===200&&/^\/assets\/[^/]+-[A-Za-z0-9_-]+\.(?:js|css)$/.test(path))headers.set('Cache-Control','public, max-age=31536000, immutable');
 else if(route||app||/\.(?:js|css|json|webmanifest|svg|png|gif|ico)$/.test(path))headers.set('Cache-Control','public, max-age=0, must-revalidate');
 return new Response(body,{status:response.status,headers});
}};
