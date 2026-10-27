import {chromium,webkit} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const option=name=>process.argv.find(value=>value.startsWith('--'+name+'='))?.split('=').slice(1).join('=');
const roots=[option('baseline'),option('candidate')];if(roots.some(root=>!root))throw Error('Provide --baseline=<built approved H1> --candidate=<built candidate>.');
const artifacts=roots.map(root=>{root=resolve(root);const html=readFileSync(root+'/index.html','utf8'),path=html.match(/href="(\/assets\/[^"?]+\.css)"/)?.[1],header=html.match(/<header class="hero"[\s\S]*?<\/header>/)?.[0];if(!path||!header)throw Error('Missing compiled stylesheet/header.');return{css:readFileSync(root+path,'utf8'),header};});
if(artifacts[0].header!==artifacts[1].header)throw Error('Header markup changed.');
const engine=option('browser')==='webkit'?webkit:chromium,browser=await engine.launch(option('executable')?{executablePath:option('executable')}:{});let cases=0;
try{for(const width of[320,360,390,440,480,768,1280])for(const theme of['light','dark']){
 const samples=[];for(const {css,header}of artifacts){const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});await page.setContent(`<html data-theme="${theme}"><style>${css}</style><body><div class="app-shell">${header}<p>After header</p></div></body></html>`);samples.push({pixels:createHash('sha256').update(await page.screenshot()).digest('hex'),rects:await page.locator('.hero,.hero-copy,.header-actions,.brand-logo,.brand-heading,.header-link').evaluateAll(elements=>elements.map(element=>{const r=element.getBoundingClientRect();return[element.className,r.x,r.y,r.width,r.height];}))});await page.close();}
 if(JSON.stringify(samples[0])!==JSON.stringify(samples[1]))throw Error(`Compiled header geometry/pixels changed at ${width}/${theme}.`);cases++;
}console.log(JSON.stringify({cases,compiledArtifacts:true,exactMarkup:true,exactGeometry:true,exactPixels:true,pinnedAcceptanceStillRequired:true}));}finally{await browser.close();}
