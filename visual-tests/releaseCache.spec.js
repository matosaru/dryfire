import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {edition} from './catalog.js';

test('release upgrade preserves open tabs and IndexedDB, then starts the new complete shell offline',async({browser,browserName})=>{
 test.skip(browserName!=='chromium'||edition!=='public','Public service-worker lifecycle; Chromium-specific browser integration.');
 const built=JSON.parse(readFileSync('dist/edition.json','utf8')), worker=readFileSync('dist/sw.js','utf8');
 let version=1,broken=false;
 const release=()=>String(version).repeat(64), body=()=>`asset-${version}`;
 const server=createServer((request,response)=>{
  response.setHeader('Cache-Control','no-store');
  if(request.url==='/sw.js'){response.setHeader('Content-Type','text/javascript');response.end(worker.replaceAll(built.release,release()));return;}
  if(request.url==='/edition.json'){response.setHeader('Content-Type','application/json');const digest=createHash('sha256').update(body()).digest('hex');response.end(JSON.stringify({edition:'public',release:release(),assets:[`/assets/entry-${version}.js`],assetDigests:Object.fromEntries([...['/manifest.webmanifest','/icon-192.png','/icon-512.png','/apple-touch-icon.png','/logo.svg','/favicon.ico','/gun-types/handgun.svg','/gun-types/rifle.svg','/gun-types/shotgun.svg','/gun-types/unknown.svg','/pcm-capture.worklet.js',...['draw','rack','trigger','reload'].flatMap(name=>[`/motions/${name}.svg`,`/motions/${name}.gif`])],`/assets/entry-${version}.js`].map(path=>[path,digest]))}));return;}
  if(request.url==='/'||request.url==='/index.html'){response.setHeader('Content-Type','text/html');response.end(`<html data-release-id="${release()}"><body>release-${version}</body></html>`);return;}
  if(broken){response.statusCode=503;response.end('unavailable');return;}
  response.end(body());
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`,context=await browser.newContext({serviceWorkers:'allow'});
 try{
  const page=await context.newPage();await page.goto(origin);
  await page.evaluate(async()=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('release-data',1);request.onupgradeneeded=()=>request.result.createObjectStore('saved');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});await new Promise((resolve,reject)=>{const tx=db.transaction('saved','readwrite');tx.objectStore('saved').put('kept','gun');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();});
  await page.reload();const second=await context.newPage();await second.goto(origin);
  version=2;await page.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update();});
  await expect.poll(()=>page.evaluate(async()=>Boolean((await navigator.serviceWorker.getRegistration()).waiting))).toBe(true);
  await expect(page.locator('body')).toHaveText('release-1');await expect(second.locator('body')).toHaveText('release-1');
  await second.reload();await expect(second.locator('body')).toHaveText('release-2');
  await page.close();await second.close();const fresh=await context.newPage();await fresh.goto(origin);
  await expect.poll(()=>fresh.evaluate(()=>navigator.serviceWorker.controller?.scriptURL??'')).toContain('/sw.js');
  // A bad subsequent deployment cannot replace the complete version2 cache.
  version=3;broken=true;await fresh.evaluate(async()=>{await(await navigator.serviceWorker.getRegistration()).update();});
  await expect.poll(()=>fresh.evaluate(async()=>!(await navigator.serviceWorker.getRegistration()).installing)).toBe(true);
  await context.setOffline(true);await fresh.reload();await expect(fresh.locator('body')).toHaveText('release-2');
  expect(await fresh.evaluate(async()=>{const db=await new Promise(resolve=>{const request=indexedDB.open('release-data',1);request.onsuccess=()=>resolve(request.result);});const value=await new Promise(resolve=>{const request=db.transaction('saved').objectStore('saved').get('gun');request.onsuccess=()=>resolve(request.result);});db.close();return value;})).toBe('kept');
 }finally{await context.close();await new Promise(resolve=>server.close(resolve));}
});
