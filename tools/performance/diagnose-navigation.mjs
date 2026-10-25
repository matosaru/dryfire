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
const browser=await webkit.launch(),samples=[[],[]];
try{for(let run=0;run<6;run++)for(const index of [run%2,(run+1)%2]){
 const context=await browser.newContext({viewport:environment.viewport,locale:environment.locale,timezoneId:environment.timezoneId,reducedMotion:'reduce',serviceWorkers:'block'});
 try{
  await context.addInitScript(installSyntheticMedia);await context.addInitScript({content:`window.__performanceUsableScreen=(${usableInitialScreen.toString()});`});await context.addInitScript(observeReadiness);
  const page=await context.newPage();await page.goto(servers[index].url);await page.waitForFunction(()=>Number.isFinite(window.__performanceReview?.ready));
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
 }finally{await context.close();}
}}finally{await browser.close();await Promise.all(servers.map(({server})=>new Promise(r=>server.close(r))));}
const median=a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)];
const medians=Object.fromEntries(samples.map((rows,index)=>[index?'candidate':'baseline',Object.fromEntries(Object.keys(rows[0]).map(key=>[key,median(rows.map(r=>r[key]))]))]));
const result={kind:'Advisory instrumented Settings phases; not acceptance',medians,samples,failures:[]};mkdirSync('performance-results',{recursive:true});writeFileSync('performance-results/startup-diagnostic.json',JSON.stringify(result,null,2)+'\n');console.log('::notice title=Settings navigation phases::'+JSON.stringify(medians));
