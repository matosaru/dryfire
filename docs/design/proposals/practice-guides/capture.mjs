// Proposal-only system-Chromium renderer, not an accepted CI-baseline generator.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import './render.mjs';
import { PRACTICE_MODES } from '../../../../src/practiceSession.js';
import { DRILLS } from '../../../../src/drills.js';
import { createScenarios, FRAME_MS, WIDTH, HEIGHT } from './scenarios.mjs';
const dir=fileURLToPath(new URL('.',import.meta.url));
const manuals=JSON.parse(await readFile(join(dir,'manuals.json'),'utf8'));
const scenarios=createScenarios(manuals);
const sourceHashes={};
for(const source of ['src/practiceSession.js','src/drillSession.js','src/practiceController.js','src/sessionController.js']){
  sourceHashes[source]=createHash('sha256').update(await readFile(new URL('../../../../'+source,import.meta.url))).digest('hex');
}
await writeFile(join(dir,'scenario-timelines.json'),JSON.stringify({change:'CHG-043',frameStepMs:FRAME_MS,speed:1,sourceHashes,
  assumptions:'Synthetic recognized events; safety already confirmed; preparation shown as 1 s example; classifier, hardware and storage latency are not modeled.',
  scenarios:scenarios.map(({frames,...scenario})=>({...scenario,frameCount:frames.length}))},null,2)+'\n');
await mkdir(join(dir,'screens'),{recursive:true});await mkdir(join(dir,'animations'),{recursive:true});
const server=createServer(async(req,res)=>{try{const path=resolve(dir,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!path.startsWith(dir))throw new Error('Outside proposal');res.setHeader('Content-Type',({'.html':'text/html','.json':'application/json','.png':'image/png','.gif':'image/gif'})[extname(path)]||'application/octet-stream');res.end(await readFile(path))}catch{res.statusCode=404;res.end('Not found')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
const requireTrue=(ok,message)=>{if(!ok)throw new Error(message)};
requireTrue(JSON.stringify(manuals.filter(m=>m.kind==='practice').map(m=>m.id).sort())===JSON.stringify(PRACTICE_MODES.map(m=>m.id).sort()),'Manual catalog must cover every actual practice mode');
for(const drill of DRILLS){const m=manuals.find(m=>m.id==='sequence-'+drill.id);requireTrue(m&&JSON.stringify(m.sequence)===JSON.stringify(drill.steps),'Guide must match actual sequence '+drill.id)}
const captureFull=async path=>{const width=page.viewportSize().width;const height=await page.evaluate(()=>Math.max(document.documentElement.scrollHeight,innerHeight));await page.setViewportSize({width,height});await page.screenshot({path,fullPage:true});await page.setViewportSize({width,height:844})};
const temp=await mkdtemp(join(tmpdir(),'dryfire-guide-frames-'));let captures=0;
try{
await page.setViewportSize({width:WIDTH,height:HEIGHT});await page.goto(origin+'/motion.html');
for(const scenario of scenarios){
  if(!process.argv.includes('--reuse-motion')){
    const frames=join(temp,scenario.id);await mkdir(frames);
    for(let i=0;i<scenario.frames.length;i++){
      const data=await page.evaluate(frame=>motion.render(frame),scenario.frames[i]);
      const png=Buffer.from(data.split(',')[1],'base64');
      await writeFile(join(frames,`${String(i).padStart(4,'0')}.png`),png);
      if(i===scenario.posterIndex)await writeFile(join(dir,'animations',scenario.id+'.poster.png'),png);
    }
    execFileSync('ffmpeg',['-loglevel','error','-y','-framerate',String(1000/FRAME_MS),'-i',join(frames,'%04d.png'),'-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer','-loop','0',join(dir,'animations',scenario.id+'.gif')],{stdio:'pipe'});
  }
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration:stream=width,height,nb_frames','-of','json',join(dir,'animations',scenario.id+'.gif')],{encoding:'utf8'}));
  requireTrue(Math.round(Number(probe.format.duration)*1000)===scenario.durationMs,scenario.id+': GIF does not play the scenario at 1× speed');
  requireTrue(Number(probe.streams[0].nb_frames)===scenario.frames.length&&probe.streams[0].width===WIDTH&&probe.streams[0].height===HEIGHT,scenario.id+': unexpected GIF frame count or dimensions');
}
await page.setViewportSize({width:390,height:844});
for(const m of manuals)for(const theme of ['dark','light']){await page.goto(`${origin}/index.html?mode=${m.id}&screen=guide&theme=${theme}&capture=1`);await page.locator('.guide-media img').evaluate(img=>img.decode());requireTrue(await page.getByLabel('Beta version',{exact:true}).isVisible(),m.id+' missing BETA');requireTrue(await page.getByRole('heading',{name:m.title,exact:true}).isVisible(),m.id+' missing title');requireTrue(await page.getByRole('button',{name:'Back to setup',exact:true}).count()===2,m.id+' back controls');requireTrue(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth),m.id+' overflow');await captureFull(join(dir,'screens',m.id+'.'+theme+'.png'));captures++;await page.getByRole('button',{name:'Play example'}).click();requireTrue((await page.locator('.guide-media img').getAttribute('src')).endsWith('.gif'),m.id+' play');await page.getByRole('button',{name:'Pause',exact:true}).click();requireTrue((await page.locator('.guide-media img').getAttribute('src')).endsWith('.poster.png'),m.id+' pause');}
for(const theme of ['dark','light']){
  await page.goto(`${origin}/index.html?mode=single&screen=guide&theme=${theme}&capture=1`);
  await page.getByRole('button',{name:'Early trigger',exact:true}).click();
  requireTrue((await page.locator('.guide-media img').getAttribute('src'))==='animations/single-early.poster.png','Early trigger must select its own poster');
  await page.locator('.guide-media img').evaluate(img=>img.decode());
  await captureFull(join(dir,'screens','single-early.'+theme+'.png'));captures++;
  await page.getByRole('button',{name:'Play example',exact:true}).click();
  requireTrue((await page.locator('.guide-media img').getAttribute('src'))==='animations/single-early.gif','Early trigger must play the failure scenario');
  await page.getByRole('button',{name:'Normal repetitions',exact:true}).click();
  requireTrue((await page.locator('.guide-media img').getAttribute('src'))==='animations/single.poster.png','Changing example must stop motion and restore the poster');
}
for(const mode of ['single','sequence-rack-trigger'])for(const theme of ['dark','light']){await page.goto(`${origin}/index.html?mode=${mode}&screen=setup&theme=${theme}&capture=1`);requireTrue(await page.getByRole('link',{name:'About this practice',exact:true}).isVisible(),'Missing setup link');await captureFull(join(dir,'screens',mode+'-setup.'+theme+'.png'));captures++;await page.locator('#practiceRepetitions').fill('17');await page.getByRole('link',{name:'About this practice',exact:true}).click();await page.getByRole('button',{name:'Back to setup',exact:true}).last().click();requireTrue(await page.locator('#practiceRepetitions').inputValue()==='17','Unsaved repetition count was lost');}
for(const width of [320,390,1024])for(const theme of ['dark','light'])for(const m of manuals){await page.setViewportSize({width,height:844});await page.goto(`${origin}/index.html?mode=${m.id}&screen=guide&theme=${theme}&capture=1`);requireTrue(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth),`${m.id} ${theme} ${width}: overflow`);requireTrue(await page.getByLabel('Beta version',{exact:true}).isVisible(),'Missing shared badge');const pos=await page.locator('.tabs').evaluate(x=>getComputedStyle(x).position);requireTrue(pos==='fixed','Bottom navigation must be fixed');}
requireTrue(errors.length===0,'Browser errors: '+errors.join('; '));
// One review sheet, rendered as layout rather than by altering source captures.
await page.setViewportSize({width:1240,height:1010});
await page.setContent(`<html><body style="margin:0;background:#131d25;color:white;font-family:system-ui;padding:28px"><div style="font-size:12px;color:#ffb078;letter-spacing:2px">DRY FIRE WITH EASE · CHG-043 · REVISED DESIGN PROPOSAL</div><h1 style="font-size:27px;margin:8px 0">A short guide, one tap from setup</h1><p style="color:#c0d1de;margin:0 0 20px;font-size:15px">Shared BETA header · A guide for each practice · Back keeps your settings</p><div style="display:flex;gap:24px">${[['single-setup.dark','1 · Link on setup'],['single.dark','2 · Single practice guide'],['reload.dark','3 · Mode-specific instructions']].map(([file,label])=>`<div style="width:378px"><p style="font-size:14px;color:#ffb078;margin:0 0 10px">${label}</p><div style="height:800px;overflow:hidden;border:1px solid #435667;border-radius:18px"><iframe title="${label}" style="width:100%;height:100%;border:0;display:block" src="${origin}/index.html?mode=${file.split('-setup')[0].replace('.dark','')}&screen=${file.includes('-setup')?'setup':'guide'}&theme=dark&capture=1"></iframe></div></div>`).join('')}</div><p style="color:#a7bfce;font-size:12px">Illustrative examples. Scrollable full-page captures and silent GIFs are provided separately. No app code changed.</p></body></html>`);
await page.waitForLoadState('networkidle');await page.screenshot({path:join(dir,'overview.dark.png')});
const report={change:'CHG-043 (revises CHG-042)',status:'proposal only; not product screenshots or accepted CI references',renderer:await browser.version(),source:'shared shell and locally authored Canvas scenes driven by actual pure session engines',coverage:'six actual engine modes, four built-in sequences and one custom-preset example; separate early Single failure',guides:manuals.length,themeCaptures:captures,animations:scenarios.length,framesPerSecond:1000/FRAME_MS,scenarioChecks:'readiness before countdown, 2.4/3.2 s delays, mode-specific beep/Next counts, early miss/zero shot and automatic progression, 0.50 s first accepted click, Par hit/miss, Reload interval/no handling shots, Free duration',exportChecks:'every GIF frame count and encoded duration matches the scenario at 1× speed; 344 × 244 px',layoutChecks:66,widths:[320,390,1024],themes:['dark','light'],reducedMotion:'poster until explicit Play; Play/Pause verified on 22 themed guides; early/normal selection verified in both themes',settingsPreservation:'four setup → guide → setup round trips preserve unsaved repetitions=17',pageErrors:errors};
await writeFile(join(dir,'validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await rm(temp,{recursive:true,force:true});await browser.close();await new Promise(r=>server.close(r))}
