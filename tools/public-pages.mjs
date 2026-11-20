import{readFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{renderToStaticMarkup}from'react-dom/server';
import{createElement}from'react';
import{transform}from'lightningcss';
import{PublicPage}from'../apps/web/src/public-site/PublicPage/PublicPage.tsx';
import{PUBLIC_ROUTES,ALL_PUBLIC_ROUTES,CANONICAL_ORIGIN,publicAssetPath,sitemapXML,robotsTXT}from'../site/routes.js';
import{publicLocaleCatalog}from'../site/locales.js';
import{LocalizationProvider}from'../apps/web/src/localization/runtime.ts';
import{minifyProductionHtml,prioritizeAppStyles}from'./minify-html.mjs';
import{prerenderAppScreen}from'./app-document.mjs';
import{renderNotFoundHTML}from'../site/fallbacks.js';
const escape=text=>String(text).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function publicHead(route){
 const canonical=CANONICAL_ORIGIN+route.path;
 const locale=route.locale??'en';
 const basePath=locale==='en'?route.path:route.path.replace(/^\/(?:de|nl)(?=\/)/,'');
 const alternates=['en','de','nl'].map(language=>`<link rel="alternate" hreflang="${language}" href="${CANONICAL_ORIGIN}${language==='en'?basePath:`/${language}${basePath==='/'?'/':basePath}`}">`).join('');
 const defaultAlternate=`<link rel="alternate" hreflang="x-default" href="${CANONICAL_ORIGIN}${basePath}">`;
 const structured={'@context':'https://schema.org','@type':route.id==='home'?'SoftwareApplication':'WebPage',name:route.id==='home'?'Dry Fire With Ease':route.heading,url:canonical,description:route.description,...(route.id==='home'?{applicationCategory:'SportsApplication',operatingSystem:'Web browser'}:{})};
 return `<title>${escape(route.title)}</title><meta name="description" content="${escape(route.description)}"><link rel="canonical" href="${canonical}">${alternates}${defaultAlternate}<meta name="robots" content="index, follow"><meta property="og:type" content="website"><meta property="og:site_name" content="Dry Fire With Ease"><meta property="og:locale" content="${{en:'en_US',de:'de_DE',nl:'nl_NL'}[locale]}"><meta property="og:title" content="${escape(route.title)}"><meta property="og:description" content="${escape(route.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${CANONICAL_ORIGIN}/icon-512.png"><meta property="og:image:alt" content="Dry Fire With Ease app icon"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escape(route.title)}"><meta name="twitter:description" content="${escape(route.description)}"><meta name="twitter:image" content="${CANONICAL_ORIGIN}/icon-512.png"><script id="page-structured-data" type="application/ld+json">${JSON.stringify(structured).replaceAll('<','\\u003c')}</script>`;
}
export function appDocumentHead(html,route){
 return html.replace(/<head\b[^>]*>[\s\S]*?<\/head>/i,head=>head.replace(/<title>[\s\S]*?<\/title>/gi,'').replace(/<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/gi,'').replace(/<link\b[^>]*rel="canonical"[^>]*>/gi,'').replace(/<script\b[^>]*id="page-structured-data"[^>]*>[\s\S]*?<\/script>/gi,'').replace('</head>',publicHead(route)+'</head>'));
}
export function renderPublicHTML(route,styles){
 const locale=route.locale??'en';
 const provider={value:{locale,catalog:publicLocaleCatalog(locale)}};
 const markup=renderToStaticMarkup(createElement(LocalizationProvider,provider,createElement(PublicPage,{route,routes:ALL_PUBLIC_ROUTES}))).replace(/<link rel="preload"[^>]+>/g,'');
 return `<!doctype html><html lang="${locale}" data-theme="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#0a0e11">${publicHead(route)}<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" type="image/x-icon"><link rel="apple-touch-icon" href="/apple-touch-icon.png">${styles.map(path=>`<link rel="stylesheet" href="/${path}">`).join('')}</head><body class="public-site">${markup}</body></html>`;
}
export function publicPagesPlugin(){return{name:'public-pages',generateBundle:{order:'post',async handler(_options,bundle){
 const css=transform({filename:'public-site.css',code:Buffer.from(readFileSync('apps/web/src/public-site/PublicPage/PublicPage.css')),minify:true}).code;
 const name=`assets/public-site-${createHash('sha256').update(css).digest('hex').slice(0,8)}.css`;
 this.emitFile({type:'asset',fileName:name,source:css});
 const shared=Object.keys(bundle).find(file=>file.endsWith('.css')&&file!==name);
 if(!shared)throw new Error('Public pages need the existing shared application styles.');
 const index=bundle['index.html'];if(index?.type!=='asset')throw new Error('Public pages require the compiled app document.');
 const app=String(index.source);
 for(const route of ALL_PUBLIC_ROUTES){
  const html=route.appView?appDocumentHead(prerenderAppScreen(app,route),route):renderPublicHTML(route,[shared,name]);
  const release=app.match(/data-release-id="([a-f0-9]{64})"/)?.[1];
  const versioned=release&&!html.includes('data-release-id=')?html.replace('<html',`<html data-release-id="${release}"`):html;
  const source=await minifyProductionHtml(prioritizeAppStyles(versioned));
  if(route.path==='/')index.source=source;
  else this.emitFile({type:'asset',fileName:publicAssetPath(route.path).slice(1),source});
 }
 for(const route of PUBLIC_ROUTES.filter(row=>row.guide))this.emitFile({type:'asset',fileName:`guide-examples/${route.id}.gif`,source:readFileSync(`docs/design/screens/practice-guide/examples/${route.id}.gif`)});
 this.emitFile({type:'asset',fileName:'sitemap.xml',source:sitemapXML()});this.emitFile({type:'asset',fileName:'robots.txt',source:robotsTXT});
 this.emitFile({type:'asset',fileName:'404.html',source:renderNotFoundHTML('en')});
}}};}
