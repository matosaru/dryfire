import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, relative, extname } from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium, webkit } from '@playwright/test';
import { measureArtifact, payloadViolations } from './artifact.mjs';
import { usableInitialScreen } from './readiness.mjs';
import { timingStatistics as statistic, timingEvidence } from './timing-policy.mjs';
import { installSyntheticMedia } from '../../visual-tests/media.js';

const argument = name => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length+3);
const candidateDir = resolve(argument('candidate') || 'dist');
if (!argument('baseline')) throw new Error('Provide --baseline=/path/to/original/dist.');
const baselineDir = resolve(argument('baseline'));
const output = argument('output') || 'performance-results/report.json';
const runs = Number(argument('runs') || 20);
if (!Number.isInteger(runs) || runs < 2 || process.env.CI && runs < 10) throw new Error('Use at least ten CI samples (two for local diagnostics).');
const rendering = JSON.parse(readFileSync('visual-tests/environment.json'));
if (process.env.CI && process.env.VISUAL_IMAGE !== rendering.image) throw new Error('Performance comparisons require the pinned rendering image.');
const library = readFileSync('visual-tests/fixtures/library.json');
const reports = [baselineDir,candidateDir].map(measureArtifact);
const errors = payloadViolations(reports[1],reports[0]);
if (errors.length) {
  mkdirSync(resolve(output,'..'),{recursive:true});
  writeFileSync(output,JSON.stringify({version:1,reports,errors},null,2)+'\n');
  throw new Error(errors.join('\n'));
}
const sameAssets = JSON.stringify(reports[0].hashes) === JSON.stringify(reports[1].hashes);
const timingProbe=process.argv.includes('--timing-probe');
const identicalRuntime=sameAssets&&!timingProbe;
const timingMetrics = ['cold','warm','returning','firstAction','navigation','clickFeedback'];
async function serve(root) {
  const privateEdition = JSON.parse(readFileSync(resolve(root,'edition.json'))).edition === 'preview';
  const server = createServer((request,response) => {
    try {
      const path = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
      const file = resolve(root,path === '/' ? 'index.html' : path.replace(/^\//,''));
      if (relative(root,file).startsWith('..')) { response.writeHead(403).end(); return; }
      const bytes = readFileSync(file);
      const mime = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.gif':'image/gif','.webmanifest':'application/manifest+json' }[extname(file)] || 'application/octet-stream';
      const compressed = /\bgzip\b/.test(request.headers['accept-encoding'] || '');
      response.writeHead(200,{'Content-Type':mime,'Cache-Control':privateEdition?'private, no-store':'public, max-age=3600',...(compressed ? {'Content-Encoding':'gzip'} : {})});
      response.end(compressed ? gzipSync(bytes) : bytes);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  return { url:`http://127.0.0.1:${server.address().port}`, close:() => new Promise(resolve => server.close(resolve)) };
}
const servers = await Promise.all([baselineDir,candidateDir].map(serve));
const results = { version:1, measuredAt:new Date().toISOString(), node:process.version, image:process.env.VISUAL_IMAGE || 'local-diagnostic', reports, identicalApplicationAssets:sameAssets,
  runtimeProbe:timingProbe?'Deliberate candidate-only 250 ms startup CPU stall; expected regression.':null,browsers:{} };
try {
  const names = argument('browser') ? [argument('browser')] : ['chromium','webkit'];
  for (const name of names) {
    if (!['chromium','webkit'].includes(name)) throw new Error(`Unknown browser ${name}`);
    const browser = await ({chromium,webkit}[name]).launch(name === 'chromium' && process.env.PERFORMANCE_EXECUTABLE_PATH ? {executablePath:process.env.PERFORMANCE_EXECUTABLE_PATH} : {});
    const data = [0,1].map(()=>({...Object.fromEntries(timingMetrics.map(key=>[key,[]])),resources:[],startupPayload:[],cleanup:[],memory:[]}));
    const measure = async (index, repeatCleanup = false) => {
      const context = await browser.newContext({viewport:rendering.viewport,locale:rendering.locale,timezoneId:rendering.timezoneId,reducedMotion:'reduce',serviceWorkers:'block',
        ...(reports[index].edition === 'preview' ? {storageState:{cookies:[],origins:[{origin:servers[index].url,localStorage:[{name:'dryfire-private-preview-mode',value:'full'}]}]}} : {})});
      try {
        await context.addInitScript(installSyntheticMedia);
        if(timingProbe&&index===1) await context.addInitScript(()=>{
          const until=performance.now()+250;while(performance.now()<until){ /* Deliberate test-only startup regression. */ }
        });
        await context.addInitScript({content:`window.__performanceUsableScreen = (${usableInitialScreen.toString()});`});
        await context.addInitScript(() => {
          window.__performanceReview = {ready:null,longTasks:[],frameGaps:[]};
          let previous;
          const frame = now => { if(previous !== undefined) window.__performanceReview.frameGaps.push(now-previous); previous=now; requestAnimationFrame(frame); };
          requestAnimationFrame(frame);
          const observer = new MutationObserver(()=>{
            if (window.__performanceUsableScreen(document)) {
              window.__performanceReview.ready = performance.now(); observer.disconnect();
            }
          });
          observer.observe(document,{subtree:true,childList:true,characterData:true,attributes:true});
          if (PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
            new PerformanceObserver(list=>window.__performanceReview.longTasks.push(...list.getEntries().map(entry=>entry.duration))).observe({type:'longtask'});
          }
        });
        const page = await context.newPage();
        page.on('dialog',dialog=>dialog.accept()); // Accept the real fixture-import confirmation.
        const pageErrors = []; page.on('pageerror',error=>pageErrors.push(error.message));
        let cdp;
        if (name === 'chromium') {
          cdp = await context.newCDPSession(page);
          await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
          await cdp.send('Network.enable');
          await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:200000,uploadThroughput:100000});
        }
        await page.goto(servers[index].url);
        await page.waitForFunction(()=>Number.isFinite(window.__performanceReview?.ready));
        data[index].cold.push(await page.evaluate(()=>window.__performanceReview.ready));
        await page.evaluate(()=>{
          const button = document.getElementById('settingsShortcut');
          window.__performanceFirstAction = new Promise((resolve,reject)=>button.addEventListener('click',()=>{
            const started=performance.now();
            const timeout=setTimeout(()=>{observer.disconnect();reject(new Error('Cold Settings action did not finish'));},5000);
            const observer=new MutationObserver(()=>{if(document.body.dataset.view==='settings'){clearTimeout(timeout);observer.disconnect();requestAnimationFrame(()=>resolve(performance.now()-started));}});
            observer.observe(document.body,{attributes:true});
          },{capture:true,once:true}));
        });
        await page.locator('#settingsShortcut').click();
        data[index].firstAction.push(await page.evaluate(()=>window.__performanceFirstAction));
        // Include requests that began before Ready but completed afterward;
        // an asynchronous import cannot evade startup accounting this way.
        await page.waitForLoadState('networkidle');
        const resources = await page.evaluate(()=>performance.getEntriesByType('resource').filter(entry=>entry.startTime<=window.__performanceReview.ready && new URL(entry.name).origin===location.origin).map(entry=>new URL(entry.name).pathname).filter(path=>/\.(js|css)$/.test(path)));
        const requested = [...new Set(resources)].sort();
        data[index].resources.push(requested);
        const startup = {js:{raw:0,gzip:0},css:{raw:0,gzip:0}};
        for(const path of requested) {
          if(!Object.hasOwn(reports[index].hashes,path)) throw new Error(`Unexpected startup asset ${path}`);
          const bytes = readFileSync(resolve(index===0?baselineDir:candidateDir,path.slice(1)));
          const kind = path.endsWith('.js')?'js':'css'; startup[kind].raw+=bytes.length; startup[kind].gzip+=gzipSync(bytes).length;
        }
        data[index].startupPayload.push(startup);
        await page.reload();
        await page.waitForFunction(()=>Number.isFinite(window.__performanceReview?.ready));
        data[index].warm.push(await page.evaluate(()=>window.__performanceReview.ready));
        await page.locator('#restoreGunBackupBtn').click();
        await page.locator('#importFile').setInputFiles({name:'fixture.json',mimeType:'application/json',buffer:library});
        await page.locator('#homeView:not(.hidden)').waitFor();
        await page.reload();
        await page.waitForFunction(()=>Number.isFinite(window.__performanceReview?.ready));
        await page.locator('#homeView:not(.hidden)').waitFor();
        data[index].returning.push(await page.evaluate(()=>window.__performanceReview.ready));
        await page.locator('#settingsShortcut').click();
        await page.locator('#settingsView:not(.hidden)').waitFor();
        await page.evaluate(()=>{
          const button = document.querySelector('.tab[data-view="drills"]');
          window.__performanceNavigation = new Promise(resolve=>button.addEventListener('click',()=>{
            const started = performance.now();
            const observer = new MutationObserver(()=>{if(document.body.dataset.view === 'drills') {observer.disconnect();requestAnimationFrame(()=>resolve(performance.now()-started));}});
            observer.observe(document.body,{attributes:true});
          },{capture:true,once:true}));
        });
        await page.locator('.tab[data-view="drills"]').click();
        data[index].navigation.push(await page.evaluate(()=>window.__performanceNavigation));
        await page.locator('[data-practice-mode="single"]').click();
        await page.locator('#practiceDelayMode').selectOption('fixed');
        await page.locator('#practiceFixedDelay').fill('0');
        await page.locator('#practiceRepetitions').fill('1');
        await page.locator('#practiceStartSound').uncheck();
        for (let cycle=0;cycle<(repeatCleanup?10:1);cycle++) {
          if (cycle) await page.locator('#practiceRepeatBtn').click();
          await page.locator('#practiceStartBtn').click();
          if (await page.locator('#safetyModal').isVisible()) { await page.locator('#safetyModalAck').check(); await page.locator('#safetyConfirmBtn').click(); }
          await page.locator('#practiceRun[data-phase="active"]').waitFor();
          await page.evaluate(()=>{window.__performanceReview.frameGaps=[];});
          await page.waitForTimeout(250); // Let actual capture time advance beyond GO.
          const feedback = await page.evaluate(()=>new Promise((resolve,reject)=>{
            const started = performance.now();
            const timeout = setTimeout(()=>{observer.disconnect();reject(new Error('Timed out waiting for first-click review'));},5000);
            const observer = new MutationObserver(()=>{
              if(!document.getElementById('practiceReview').classList.contains('hidden')) {clearTimeout(timeout);observer.disconnect();requestAnimationFrame(()=>resolve(performance.now()-started));}
            });
            observer.observe(document.getElementById('practiceView'),{subtree:true,attributes:true,childList:true,characterData:true});
            window.__visualAudio.emit('trigger',window.__visualAudio.nowMs());
          }));
          if (cycle === 0) data[index].clickFeedback.push(feedback);
          await page.waitForFunction(()=>!window.__visualAudio.inputActive());
          data[index].cleanup.push({cycle,...await page.evaluate(()=>({captureActive:window.__visualAudio.inputActive(),longTasks:window.__performanceReview.longTasks,practiceFrameGaps:window.__performanceReview.frameGaps}))});
          if (cdp) {
            await cdp.send('HeapProfiler.collectGarbage'); await cdp.send('Performance.enable');
            const {metrics} = await cdp.send('Performance.getMetrics');
            data[index].memory.push({cycle,bytes:metrics.find(metric=>metric.name==='JSHeapUsedSize')?.value ?? null});
          }
        }
        if (pageErrors.length) throw new Error(pageErrors.join('\n'));
      } finally { await context.close(); }
    };
    try {
      for (let i=0;i<runs;i++) { const order=i%2 ? [1,0] : [0,1]; for (const index of order) await measure(index,i===runs-1); }
      const slower = () => timingMetrics.filter(metric=>statistic(data[1][metric]).median > statistic(data[0][metric]).median || statistic(data[1][metric]).p95 > statistic(data[0][metric]).p95);
      if (!identicalRuntime && slower().length) {
        for (let i=0;i<runs;i++) for (const index of i%2 ? [0,1] : [1,0]) await measure(index);
      }
      const comparisons = Object.fromEntries(timingMetrics.map(metric=>{
        const result=timingEvidence(data[0][metric],data[1][metric],identicalRuntime);
        const {baseline,candidate,slowerPairs,regression,medianConfirmed,confidence}=result;
        if (regression) errors.push(`${name} ${metric}: confirmed ${medianConfirmed ? 'paired median' : 'p95 tail'} slowdown (${slowerPairs}/${data[1][metric].length} slower pairs); baseline median/p95 ${baseline.median}/${baseline.p95}, candidate ${candidate.median}/${candidate.p95}; 99% difference interval ${JSON.stringify(confidence)}.`);
        return [metric,result];
      }));
      for(let i=0;i<data[1].startupPayload.length;i++) {
        errors.push(...payloadViolations({edition:reports[1].edition,critical:data[1].startupPayload[i]},
          {edition:reports[0].edition,critical:data[0].startupPayload[i]}).map(error=>`${name} actual startup: ${error}`));
      }
      results.browsers[name] = {version:browser.version(),cpuThrottle:name==='chromium'?4:null,network:name==='chromium'?{latency:40,downloadThroughput:200000,uploadThroughput:100000}:null,comparisons,observations:data};
    } finally { await browser.close(); }
  }
} catch(error) {
  errors.push(error.stack || String(error)); throw error;
} finally {
  await Promise.all(servers.map(server=>server.close()));
  mkdirSync(resolve(output,'..'),{recursive:true}); writeFileSync(output,JSON.stringify({...results,errors},null,2)+'\n');
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(`Performance comparison saved to ${output}; ${sameAssets?'application assets identical':'paired runtime and payload checks passed'}.`);
