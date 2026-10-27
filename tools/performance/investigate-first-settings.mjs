// Read-only three-artifact diagnosis. This never replaces performance acceptance.
import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,relative,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {chromium} from '@playwright/test';
import {installSyntheticMedia} from '../../visual-tests/media.js';
import {usableInitialScreen} from './readiness.mjs';
import {observeReadiness} from './observe-readiness.mjs';
import {timingStatistics} from './timing-policy.mjs';
async function stopLayoutTrace(cdp,name,output) {
 const complete=new Promise(done=>cdp.once('Tracing.tracingComplete',done));
 await cdp.send('Tracing.end');const {stream}=await complete;let text='';
 try{for(;;){const part=await cdp.send('IO.read',{handle:stream});text+=part.base64Encoded?Buffer.from(part.data,'base64').toString():part.data;if(part.eof)break;}}finally{await cdp.send('IO.close',{handle:stream});}
 const events=JSON.parse(text).traceEvents;writeFileSync(`${output}/${name}-layout-trace.json.gz`,gzipSync(text));
 const click=events.find(event=>event.name==='investigation-click')?.ts??0,frame=events.find(event=>event.name==='investigation-frame')?.ts??Infinity;
 const layouts=events.filter(event=>event.name==='Layout'&&event.ph==='X');
 const invalidations=events.filter(event=>event.name.includes('InvalidationTracking'));
 const nodeIds=[...new Set([...layouts.flatMap(event=>(event.args?.endData?.layoutRoots??[]).map(root=>root.nodeId)),...invalidations.map(event=>event.args?.data?.nodeId)].filter(Boolean))].slice(0,20),nodes={};
 for(const id of nodeIds){try{const {node}=await cdp.send('DOM.describeNode',{backendNodeId:id});const attrs=node.attributes??[],at=attrs.indexOf('id'),classes=attrs.indexOf('class');nodes[id]=(node.localName||node.nodeName)+(at>=0?'#'+attrs[at+1]:'')+(classes>=0?'.'+attrs[classes+1].split(/\s+/).join('.'):'');}catch{nodes[id]=`backend:${id}`;}}
 const reasons={};for(const event of invalidations){const data=event.args?.data??{},key=`${event.name}: ${data.reason??data.cause?.reason??'unspecified'}`;reasons[key]=(reasons[key]??0)+1;}
 return{layouts:layouts.slice(0,8).map(event=>({phase:event.ts<click?'before-click':event.ts<frame?'before-frame':'after-frame',durationMs:event.dur/1000,dirtyObjects:event.args?.beginData?.dirtyObjects,totalObjects:event.args?.beginData?.totalObjects,roots:(event.args?.endData?.layoutRoots??[]).map(root=>nodes[root.nodeId]??root.nodeId)})),invalidationSamples:invalidations.filter(event=>event.ts>=click).slice(0,16).map(event=>({phase:event.ts<frame?'before-frame':'after-frame',node:nodes[event.args?.data?.nodeId]??event.args?.data?.nodeName,reason:event.args?.data?.reason??event.args?.data?.cause?.reason,event:event.name})),invalidationReasons:Object.fromEntries(Object.entries(reasons).sort((a,b)=>b[1]-a[1]).slice(0,8)),invalidatedNodes:nodes};
}
const arg=name=>process.argv.find(value=>value.startsWith(`--${name}=`))?.slice(name.length+3);
const rendering=JSON.parse(readFileSync('visual-tests/environment.json','utf8'));
if(process.env.CI&&process.env.VISUAL_IMAGE!==rendering.image)throw Error('Pinned renderer required');
const runs=Number(arg('runs')||10);
if(!Number.isInteger(runs)||runs<(process.env.CI?10:2))throw Error('Insufficient diagnostic samples');
const trace=arg('trace')==='true';
const variantName=arg('variant-name')||'baselineScroll';
if(['production','candidate'].includes(variantName))throw Error('Variant name must be distinct');
const names=['production','candidate',variantName];
const servers=await Promise.all(names.map(async name=>{
 const path=arg(name===variantName?'baselineScroll':name),cache=new Map();if(!path)throw Error(`Missing artifact for ${name}`);const root=resolve(path);
 const server=createServer((request,response)=>{try{
  const path=new URL(request.url,'http://localhost').pathname,file=resolve(root,'.'+(path==='/'?'/index.html':path));
  if(relative(root,file).startsWith('..'))throw Error('Outside artifact');
  if(!cache.has(file))cache.set(file,gzipSync(readFileSync(file)));
  const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.gif':'image/gif'}[extname(file)]||'application/octet-stream';
  response.writeHead(200,{'Content-Type':mime,'Content-Encoding':'gzip','Cache-Control':'public,max-age=3600'});response.end(cache.get(file));
 }catch{response.writeHead(404).end();}});
 await new Promise(done=>server.listen(0,'127.0.0.1',done));return{server,url:`http://127.0.0.1:${server.address().port}`};
}));
const traceSummaries={};
const samples=Object.fromEntries(names.map(name=>[name,[]])),screenshots={},geometry={};
const output='performance-results';mkdirSync(output,{recursive:true});
const browser=await chromium.launch(process.env.PERFORMANCE_EXECUTABLE_PATH?{executablePath:process.env.PERFORMANCE_EXECUTABLE_PATH}:{});
const browserVersion=browser.version();
try{for(let round=trace?-1:0;round<runs;round++)for(let offset=0;offset<names.length;offset++){
 const index=(round+offset+names.length)%names.length,name=names[index];
 const context=await browser.newContext({viewport:rendering.viewport,locale:rendering.locale,timezoneId:rendering.timezoneId,reducedMotion:'reduce',serviceWorkers:'block'});
 try{
  await context.addInitScript({content:`window.__settingsTrace=${round<0};`});
  await context.addInitScript(installSyntheticMedia);
  await context.addInitScript({content:`window.__performanceUsableScreen=(${usableInitialScreen.toString()});`});
  await context.addInitScript(observeReadiness);
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:200000,uploadThroughput:100000});
  await page.goto(servers[index].url);await page.waitForFunction(()=>Number.isFinite(window.__performanceReview?.ready));
  await page.evaluate(()=>{window.__settingsInvestigation=new Promise((resolve,reject)=>{
   document.getElementById('settingsShortcut').addEventListener('click',()=>{
    if(window.__settingsTrace)performance.mark('investigation-click');
    const start=performance.now(),timer=setTimeout(()=>{observer.disconnect();reject(Error('Settings action timeout'));},5000);
    const observer=new MutationObserver(()=>{if(document.body.dataset.view==='settings'){
     const dom=performance.now()-start;observer.disconnect();requestAnimationFrame(()=>{if(window.__settingsTrace)performance.mark('investigation-frame');clearTimeout(timer);resolve({dom,frame:performance.now()-start});});
    }});observer.observe(document.body,{attributes:true});
   },{capture:true,once:true});
  });});
  if(round<0)await cdp.send('Tracing.start',{categories:'devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.invalidationTracking',transferMode:'ReturnAsStream'});
  const before=await cdp.send('Performance.getMetrics');await page.locator('#settingsShortcut').click();
  const timing=await page.evaluate(()=>window.__settingsInvestigation),after=await cdp.send('Performance.getMetrics');
  for(const key of ['ScriptDuration','LayoutDuration','RecalcStyleDuration','TaskDuration'])timing[key]=1000*(after.metrics.find(m=>m.name===key).value-before.metrics.find(m=>m.name===key).value);
  if(round<0)traceSummaries[name]=await stopLayoutTrace(cdp,name,output);else samples[name].push(timing);
  if(round===0){
   geometry[name]=await page.evaluate(()=>{const element=document.getElementById('settingsView'),rect=element.getBoundingClientRect();return{visibleViews:[...document.querySelectorAll('.view:not(.hidden)')].map(node=>node.id),settings:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},text:element.textContent.replace(/\s+/g,' ').trim()};});
   if(name!=='production'){await page.mouse.move(0,0);const png=await page.screenshot({fullPage:true,animations:'disabled',caret:'hide'});writeFileSync(`${output}/${name}.png`,png);screenshots[name]=createHash('sha256').update(png).digest('hex');}
  }
  if(errors.length)throw Error(errors.join('\n'));
 }finally{await context.close();}
}}finally{await browser.close();await Promise.all(servers.map(({server})=>new Promise(done=>server.close(done))));}
const medians=Object.fromEntries(names.map(name=>[name,Object.fromEntries(Object.keys(samples[name][0]).map(metric=>{const stats=timingStatistics(samples[name].map(row=>row[metric]));return[metric,{median:stats.median,p95:stats.p95}];}))]));
medians.candidateAndVariantPixelsIdentical=screenshots.candidate===screenshots[variantName];
if(variantName==='baselineScroll')medians.candidateAndBaselineScrollPixelsIdentical=medians.candidateAndVariantPixelsIdentical;
if(trace)medians.layoutTrace=traceSummaries;
const report={purpose:'Advisory only; unchanged acceptance must still pass',variantName,runs,environment:{image:rendering.image,browserVersion,cpuThrottle:4,latency:40},medians,samples,geometry,screenshots,failures:[]};
writeFileSync(`${output}/startup-diagnostic.json`,JSON.stringify(report,null,2)+'\n');
console.log('Collected controlled first-Settings evidence; no acceptance verdict.');
