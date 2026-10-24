import {publicRoute,publicAssetPath,CANONICAL_ORIGIN} from '../site/routes.js';
import {isAppPath,parseAppPath,appPathFor,appTitleFor} from '../src/appPaths.js';
const noindex='noindex, nofollow, noarchive';
const text=(body,status=404)=>new Response(body,{status,headers:{'Content-Type':'text/plain; charset=utf-8','X-Robots-Tag':noindex}});
async function missing(request,env){if(!env.ASSETS)return text('Not found.');const result=await env.ASSETS.fetch(new Request(new URL('/404.html',request.url),request));return new Response(request.method==='HEAD'?null:result.body,{status:404,headers:{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':noindex,'Cache-Control':'no-store'}});}
export default {async fetch(request,env){
 const url=new URL(request.url),production=url.hostname==='easydryfire.com';
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD','X-Robots-Tag':noindex}});
 if(url.hostname==='www.easydryfire.com'||production&&url.protocol!=='https:')return Response.redirect(CANONICAL_ORIGIN+url.pathname+url.search,308);
 if(url.pathname.startsWith('/site/'))return missing(request,env);
 const path=url.pathname,route=publicRoute(path),slashRoute=!path.endsWith('/')&&(publicRoute(path+'/')||isAppPath(path+'/'));
 if(slashRoute)return Response.redirect(url.origin+path+'/'+url.search,308);
 if(path==='/welcome/'&&production)return Response.redirect(CANONICAL_ORIGIN+'/',308);
 let asset=path,indexable=false;
 if(path==='/'&&!production||path==='/index.html'||isAppPath(path))asset='/index.html';
 else if(route||path==='/welcome/'){asset=publicAssetPath(path==='/welcome/'?'/':path);indexable=production;}
 else if(path==='/robots.txt'&&!production)return new Response(request.method==='HEAD'?null:'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain; charset=utf-8','X-Robots-Tag':noindex}});
 else if(path==='/sitemap.xml'||path==='/robots.txt')indexable=production;
 else if(!/^\/(?:assets\/[a-zA-Z0-9_.-]+\.(?:js|css)|(?:motions|gun-types|guide-examples)\/[a-zA-Z0-9_.-]+\.(?:svg|gif)|(?:logo\.svg|favicon\.ico|icon-192\.png|icon-512\.png|apple-touch-icon\.png|manifest\.webmanifest|edition\.json|sw\.js|pcm-capture\.worklet\.js))$/.test(path))return missing(request,env);
 if(!env.ASSETS)return text('Static assets are unavailable.',503);
 if(production&&/^\/(?:favicon\.ico|logo\.svg|icon-192\.png|icon-512\.png|apple-touch-icon\.png)$/.test(path))indexable=true;
 const target=new URL(url);target.pathname=asset;target.search='';
 const response=await env.ASSETS.fetch(new Request(target,request));const headers=new Headers(response.headers);
 if(!indexable||response.status!==200)headers.set('X-Robots-Tag',noindex);
 headers.set('X-Content-Type-Options','nosniff');
 if(path==='/favicon.ico')headers.set('Content-Type','image/x-icon');
 if(path==='/sitemap.xml')headers.set('Content-Type','application/xml; charset=utf-8');
 if(path==='/robots.txt')headers.set('Content-Type','text/plain; charset=utf-8');
 let body=request.method==='HEAD'?null:response.body;
 if(response.status===200&&isAppPath(path)&&request.method!=='HEAD'){const identity=parseAppPath(path);body=(await response.text()).replace(/<title>[^<]*<\/title>/,'<title>'+appTitleFor(identity)+'</title>').replace(/(<link rel="canonical" href=")[^"]+/, '$1'+CANONICAL_ORIGIN+appPathFor(identity));headers.delete('Content-Length');headers.delete('ETag');}
 if(route||isAppPath(path))headers.set('Cache-Control','public, max-age=0, must-revalidate');
 return new Response(body,{status:response.status,headers});
}};
