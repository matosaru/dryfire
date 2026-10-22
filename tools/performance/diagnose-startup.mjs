// Advisory crossed-source experiment, never an acceptance comparison. Injected
// module marks change the diagnostic response only; original dist files/gates stay intact.
import {createServer} from 'node:http';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,relative,extname} from 'node:path';
import {gzipSync} from 'node:zlib';
import {chromium,webkit} from '@playwright/test';
import {measureArtifact} from './artifact.mjs';
import {usableInitialScreen} from './readiness.mjs';
import {observeReadiness} from './observe-readiness.mjs';
import {installSyntheticMedia} from '../../visual-tests/media.js';
const arg=n=>process.argv.find(s=>s.startsWith('--'+n+'='))?.slice(n.length+3);
const rendering=JSON.parse(readFileSync('visual-tests/environment.json'));
if(process.env.CI&&process.env.VISUAL_IMAGE!==rendering.image)throw new Error('Diagnostic requires pinned rendering image.');
const roots={old:resolve(arg('baseline')),new:resolve(arg('candidate')||'dist')};
const reports=Object.fromEntries(Object.entries(roots).map(([k,p])=>[k,measureArtifact(p)]));
const main=Object.fromEntries(Object.entries(reports).map(([k,r])=>[k,r.critical.js.files[0]]));
const files=Object.fromEntries(Object.entries(main).map(([k,p])=>[p,k]));
const server=createServer((req,res)=>{try{
 const u=new URL(req.url,'http://localhost');let body,mime;
 if(u.pathname==='/'){
  body=readFileSync(resolve(roots[u.searchParams.get('html')],'index.html'),'utf8');
  const script=/<script\b[^>]*type="module"[^>]*><\/script>/;
  body=body.replace(script,tag=>u.searchParams.get('js')==='none'?'':tag.replace(/src="[^"]+"/,'src="'+main[u.searchParams.get('js')]+'"'));mime='text/html';
 }else{
  const root=files[u.pathname]?roots[files[u.pathname]]:existsSync(resolve(roots.new,'.'+u.pathname))?roots.new:roots.old;
  const file=resolve(root,'.'+u.pathname);if(relative(root,file).startsWith('..')){res.writeHead(403).end();return;}
  body=readFileSync(file);mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.gif':'image/gif','.json':'application/json','.webmanifest':'application/manifest+json'}[extname(file)]||'application/octet-stream';
  if(files[u.pathname])body='globalThis.__startupProbeStart=performance.now();\n'+body+'\nglobalThis.__startupProbeEnd=performance.now();';
 }
 const started=performance.now(),bytes=gzipSync(body),duration=performance.now()-started;
 res.writeHead(200,{'Content-Type':mime,'Cache-Control':'public, max-age=3600','Content-Encoding':'gzip','Server-Timing':`gzip;dur=${duration}`});res.end(bytes);
}catch(e){res.writeHead(500).end(String(e));}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const name=arg('browser')||'webkit';const browser=await({chromium,webkit}[name]).launch(name==='chromium'&&process.env.PERFORMANCE_EXECUTABLE_PATH?{executablePath:process.env.PERFORMANCE_EXECUTABLE_PATH}:{});
const cases=[['old','old'],['new','old'],['old','new'],['new','new'],['old','none'],['new','none']];const result={kind:'Advisory crossed HTML/module experiment; injected timestamps and added timing headers, not acceptance',browser:name,version:browser.version(),samples:{}};
try{for(let run=0;run<3;run++)for(let offset=0;offset<cases.length;offset++){
 const [html,js]=cases[(offset+run)%cases.length],key=html+'Html-'+js+'Js';const context=await browser.newContext({serviceWorkers:'block',viewport:rendering.viewport,locale:rendering.locale,timezoneId:rendering.timezoneId,reducedMotion:'reduce'});
 try{
  await context.addInitScript(installSyntheticMedia);await context.addInitScript({content:`window.__performanceUsableScreen=(${usableInitialScreen.toString()});`});await context.addInitScript(observeReadiness);
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/?html=${html}&js=${js}`);if(js!=='none'){await page.waitForFunction(()=>Number.isFinite(window.__performanceReview.ready));await page.locator('#settingsShortcut').click();await page.locator('#settingsView:not(.hidden)').waitFor();await page.waitForLoadState('networkidle');}
  await page.reload();if(js!=='none')await page.waitForFunction(()=>Number.isFinite(window.__performanceReview.ready));
  const sample=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return{responseEnd:n.responseEnd,domInteractive:n.domInteractive,domContentLoaded:n.domContentLoadedEventEnd,moduleStart:window.__startupProbeStart??null,moduleEnd:window.__startupProbeEnd??null,ready:window.__performanceReview.ready,gzip:n.serverTiming?.find(t=>t.name==='gzip')?.duration??null,elements:document.querySelectorAll('*').length,resources:performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,responseEnd:r.responseEnd,duration:r.duration}))};});
  (result.samples[key]||=[]).push({...sample,errors});
 }finally{await context.close();}
}}finally{await browser.close();await new Promise(r=>server.close(r));}
const median=a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)];result.medians=Object.fromEntries(Object.entries(result.samples).map(([k,a])=>[k,Object.fromEntries(['responseEnd','domInteractive','domContentLoaded','moduleStart','moduleEnd','ready','gzip','elements'].map(p=>[p,a.every(v=>v[p]!==null)?median(a.map(v=>v[p])):null]))]));
mkdirSync('performance-results',{recursive:true});writeFileSync('performance-results/startup-diagnostic.json',JSON.stringify(result,null,2)+'\n');console.log('::notice title=Advisory startup experiment::'+JSON.stringify(result.medians));
