// Advisory only. Compare parser representations on the pinned WebKit runner.
import {createServer} from 'node:http';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {gzipSync} from 'node:zlib';
import {webkit} from '@playwright/test';
import {JSDOM} from 'jsdom';
import {minify} from 'html-minifier-terser';
import {measureArtifact} from './artifact.mjs';
import {usableInitialScreen} from './readiness.mjs';
import {observeReadiness} from './observe-readiness.mjs';
import {installSyntheticMedia} from '../../visual-tests/media.js';
const old=resolve('.performance-baseline/dist'),current=resolve('dist');
const html=readFileSync(current+'/index.html','utf8');
const typed=kind=>html.replace(/(<div id="(?:practiceCatalog|calibrationCards)"[^>]*?) data-catalog="([^"]*)">/g,(_,start,value)=>{
 const markup=JSDOM.fragment('<div data-catalog="'+value+'"></div>').firstChild.dataset.catalog;
 return start+'>'+(kind==='template'?'<template>'+markup+'</template>':markup);
});
const variants={baseline:readFileSync(old+'/index.html','utf8'),current:html,template:typed('template'),direct:typed('direct')};
variants.compact=await minify(variants.template,{removeAttributeQuotes:true,caseSensitive:true,keepClosingSlash:true,collapseWhitespace:false,removeComments:false,ignoreCustomFragments:[/\bclass="[^"]*"/,/\bid="previewTestMode"/]});
const main=Object.fromEntries([['baseline',old],['current',current]].map(([k,root])=>[k,measureArtifact(root).critical.js.files[0]]));
variants.oldHtmlNewJs=variants.baseline.replace(main.baseline,main.current);
variants.newHtmlOldJs=variants.current.replace(main.current,main.baseline);
// Every candidate variant uses the same module/Ready contract. Capture module boundaries only in these diagnostic responses.
const server=createServer((req,res)=>{try{
 const u=new URL(req.url,'http://localhost');let body,mime;
 if(u.pathname==='/'){body=variants[u.searchParams.get('variant')];mime='text/html';}
 else{const root=u.pathname===main.baseline?old:existsSync(resolve(current,'.'+u.pathname))?current:old;body=readFileSync(resolve(root,'.'+u.pathname));mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.json':'application/json'}[extname(u.pathname)]||'application/octet-stream';if(Object.values(main).includes(u.pathname))body='globalThis.__moduleStart=performance.now();\n'+body+'\nglobalThis.__moduleEnd=performance.now();';}
 res.writeHead(200,{'Content-Type':mime,'Content-Encoding':'gzip','Cache-Control':'public,max-age=3600'});res.end(gzipSync(body));
 }catch(e){res.writeHead(500).end(String(e));}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await webkit.launch();const samples=Object.fromEntries(Object.keys(variants).map(k=>[k,[]]));
try{for(let i=0;i<12;i++)for(let j=0;j<Object.keys(variants).length;j++){
 const key=Object.keys(variants)[(i+j)%Object.keys(variants).length];const context=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844},reducedMotion:'reduce'});
 try{await context.addInitScript(installSyntheticMedia);await context.addInitScript({content:`window.__performanceUsableScreen=(${usableInitialScreen.toString()});`});await context.addInitScript(observeReadiness);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/?variant=${key}`);await page.waitForFunction(()=>Number.isFinite(window.__performanceReview.ready));await page.locator('#settingsShortcut').click();await page.locator('#settingsView:not(.hidden)').waitFor();await page.waitForLoadState('networkidle');await page.reload();await page.waitForFunction(()=>Number.isFinite(window.__performanceReview.ready));samples[key].push({...await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return{responseEnd:n.responseEnd,domInteractive:n.domInteractive,moduleStart:window.__moduleStart,moduleEnd:window.__moduleEnd,ready:window.__performanceReview.ready};}),errors});}finally{await context.close();}
}}finally{await browser.close();await new Promise(r=>server.close(r));}
const median=a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)];const medians=Object.fromEntries(Object.entries(samples).map(([k,a])=>[k,Object.fromEntries(['responseEnd','domInteractive','moduleStart','moduleEnd','ready'].map(p=>[p,median(a.map(v=>v[p]))]))]));const result={kind:'Advisory parser representation probe, not acceptance',medians,samples};mkdirSync('performance-results',{recursive:true});writeFileSync('performance-results/parser-diagnostic.json',JSON.stringify(result,null,2));console.log('::notice title=Parser representation experiment::'+JSON.stringify(medians));
