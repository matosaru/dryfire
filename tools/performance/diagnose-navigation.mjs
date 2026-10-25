// Advisory only: instrument real Settings navigation without changing acceptance.
import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,relative,extname} from 'node:path';
import {gzipSync} from 'node:zlib';
import {webkit,chromium} from '@playwright/test';
import {installSyntheticMedia} from '../../visual-tests/media.js';
import {usableInitialScreen} from './readiness.mjs';
import {observeReadiness} from './observe-readiness.mjs';
const arg=n=>process.argv.find(v=>v.startsWith('--'+n+'='))?.slice(n.length+3);
const environment=JSON.parse(readFileSync('visual-tests/environment.json'));
if(process.env.CI&&process.env.VISUAL_IMAGE!==environment.image)throw new Error('Pinned renderer required');
const servers=await Promise.all([arg('baseline'),arg('candidate')||'dist'].map(async dir=>{
 const root=resolve(dir),server=createServer((req,res)=>{try{
  const path=new URL(req.url,'http://localhost').pathname,file=resolve(root,'.'+(path==='/'?'/index.html':path));
  if(relative(root,file).startsWith('..'))throw new Error('Outside artifact');
  const data=readFileSync(file),mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml'}[extname(file)]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':mime,'Cache-Control':'public, max-age=3600','Content-Encoding':'gzip'});res.end(gzipSync(data));
 }catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));return{server,url:`http://127.0.0.1:${server.address().port}`};
}));
const variants=['baseline','candidate','candidateNoNativeTitle','candidateGridHeader','candidateMaskedIcons','candidateNoUnusedViews','candidateTextHeader','candidateNoSVGNodes','candidateTextIcons','candidateButtons','candidateNoHref'];
const browserName=arg('browser')||'webkit';
const browser=await ({webkit,chromium}[browserName]).launch(),samples=variants.map(()=>[]),geometries={};
try{for(let run=0;run<8;run++)for(const index of [0,1,4].map((_,i,a)=>a[(i+run)%a.length])){
 const context=await browser.newContext({viewport:environment.viewport,locale:environment.locale,timezoneId:environment.timezoneId,reducedMotion:'reduce',serviceWorkers:'block'});
 try{
  await context.addInitScript(installSyntheticMedia);await context.addInitScript({content:`window.__performanceUsableScreen=(${usableInitialScreen.toString()});`});await context.addInitScript(observeReadiness);
  const page=await context.newPage();let cdp;
  if(browserName==='chromium'){cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:200000,uploadThroughput:100000});}
  await page.goto(servers[index===0?0:1].url);await page.waitForFunction(()=>Number.isFinite(window.__performanceReview?.ready));
  if(index===4)await page.evaluate(()=>{for(const svg of document.querySelectorAll('.header-link>svg')){const icon=document.createElement('span'),data=new XMLSerializer().serializeToString(svg);icon.setAttribute('aria-hidden','true');Object.assign(icon.style,{display:'block',width:'24px',height:'24px',background:'currentColor',mask:`url("data:image/svg+xml,${encodeURIComponent(data)}") center/contain no-repeat`});svg.replaceWith(icon);}});
  await page.evaluate(()=>{window.__navigationPhases=new Promise((resolve,reject)=>{
   const times={},button=document.getElementById('settingsShortcut');let start;
   const mark=key=>{if(start!==undefined)times[key]=performance.now()-start;};
   button.addEventListener('click',()=>{start=performance.now();times.start=0;},{capture:true,once:true});
   document.addEventListener('click',()=>mark('dispatchEnd'),{once:true});
   const push=history.pushState;history.pushState=function(...args){mark('historyStart');const r=Reflect.apply(push,this,args);mark('historyEnd');return r;};
   const scroll=window.scrollTo;window.scrollTo=function(...args){mark('scrollStart');const r=Reflect.apply(scroll,this,args);mark('scrollEnd');return r;};
   const timeout=setTimeout(()=>reject(new Error('Settings timeout')),5000);
   const observer=new MutationObserver(()=>{if(document.body.dataset.view==='settings'){mark('bodyMutation');observer.disconnect();requestAnimationFrame(()=>{mark('frame');clearTimeout(timeout);resolve(times);});}});observer.observe(document.body,{attributes:true});
  });});
  const before=cdp?await cdp.send('Performance.getMetrics'):null;await page.locator('#settingsShortcut').click();const phases=await page.evaluate(()=>window.__navigationPhases);if(cdp){const after=await cdp.send('Performance.getMetrics');for(const key of ['ScriptDuration','LayoutDuration','RecalcStyleDuration','TaskDuration'])phases[key]=1000*(after.metrics.find(m=>m.name===key).value-before.metrics.find(m=>m.name===key).value);}samples[index].push(phases);
  if(!geometries[variants[index]])geometries[variants[index]]=await page.evaluate(()=>{
   const rect=selector=>{const e=document.querySelector(selector),r=e?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height,font:getComputedStyle(e).fontSize}:null;};
   return{width:innerWidth,hero:rect('header.hero'),brand:rect('.brand-name'),copy:rect('.hero-copy'),badge:rect('.beta-badge'),settings:rect('#settingsShortcut'),status:rect('#statusPill')};
  });
 }finally{await context.close();}
}}finally{await browser.close();await Promise.all(servers.map(({server})=>new Promise(r=>server.close(r))));}
const median=a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)];
const medians=Object.fromEntries(samples.flatMap((rows,index)=>rows.length?[[variants[index],Object.fromEntries(Object.keys(rows[0]).map(key=>[key,median(rows.map(r=>r[key]))]))]]:[]));
medians.geometry=geometries;
const result={kind:'Advisory instrumented Settings phases; not acceptance',medians,samples,failures:[]};mkdirSync('performance-results',{recursive:true});writeFileSync('performance-results/startup-diagnostic.json',JSON.stringify(result,null,2)+'\n');console.log('::notice title=Settings navigation phases::'+JSON.stringify(medians));
