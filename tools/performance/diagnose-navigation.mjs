// Advisory only: instrument real Settings navigation without changing acceptance.
import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,relative,extname} from 'node:path';
import {gzipSync} from 'node:zlib';
import {webkit} from '@playwright/test';
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
const variants=['baseline','candidate','candidateNoIcons','candidateNoTitle','candidateNoURL','candidateNoUnusedViews','candidateTextHeader','candidateNoSVGNodes','candidateTextIcons','candidateButtons','candidateNoHref'];
const browser=await webkit.launch(),samples=variants.map(()=>[]),geometries={};
try{for(let run=0;run<6;run++)for(const index of [0,1,6,9,10].map((_,i,a)=>a[(i+run)%a.length])){
 const context=await browser.newContext({viewport:environment.viewport,locale:environment.locale,timezoneId:environment.timezoneId,reducedMotion:'reduce',serviceWorkers:'block'});
 try{
  await context.addInitScript(installSyntheticMedia);await context.addInitScript({content:`window.__performanceUsableScreen=(${usableInitialScreen.toString()});`});await context.addInitScript(observeReadiness);
  if(index===2)await context.addInitScript(()=>{
   const observer=new MutationObserver(()=>{if(!document.head)return;const style=document.createElement('style');style.textContent='.header-link svg{visibility:hidden!important}';document.head.append(style);observer.disconnect();});observer.observe(document,{childList:true,subtree:true});
  });
  if(index===3)await context.addInitScript(()=>{let proto=document,descriptor;while(proto&&!descriptor){descriptor=Object.getOwnPropertyDescriptor(proto,'title');proto=Object.getPrototypeOf(proto);}if(descriptor)Object.defineProperty(document,'title',{get(){return descriptor.get.call(document);},set(){}});});
  if(index===4)await context.addInitScript(()=>{const push=history.pushState;history.pushState=function(...args){return Reflect.apply(push,this,args.slice(0,2));};});
  const page=await context.newPage();await page.goto(servers[index===0?0:1].url);await page.waitForFunction(()=>Number.isFinite(window.__performanceReview?.ready));
  if(index===5)await page.evaluate(()=>document.querySelectorAll('.view').forEach(node=>{if(!['gunSetupView','settingsView'].includes(node.id))node.remove();}));
  if(index===6)await page.evaluate(()=>{for(const id of ['aboutBtn','contactBtn'])document.getElementById(id).style.display='none';const gear=document.getElementById('settingsShortcut');gear.replaceChildren(document.createTextNode('⚙'));gear.style.fontSize='26px';});
  if(index===7)await page.evaluate(()=>document.querySelectorAll('.header-link svg').forEach(node=>node.remove()));
  if(index===8)await page.evaluate(()=>{for(const[id,glyph]of[['aboutBtn','ⓘ'],['contactBtn','@'],['settingsShortcut','⚙']]){const node=document.getElementById(id);node.querySelector('svg')?.replaceWith(document.createTextNode(glyph));node.style.fontSize='24px';}});
  if(index===9)await page.evaluate(()=>{for(const id of ['aboutBtn','contactBtn']){const old=document.getElementById(id),node=document.createElement('button');for(const a of old.attributes)if(a.name!=='href')node.setAttribute(a.name,a.value);node.type='button';node.replaceChildren(...old.childNodes);old.replaceWith(node);}});
  if(index===10)await page.evaluate(()=>{for(const id of ['aboutBtn','contactBtn'])document.getElementById(id).removeAttribute('href');});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
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
  await page.locator('#settingsShortcut').click();samples[index].push(await page.evaluate(()=>window.__navigationPhases));
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
