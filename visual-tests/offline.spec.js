import { edition } from './catalog.js';
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
const library = readFileSync(new URL('./fixtures/library.json', import.meta.url));
const previewModule = JSON.parse(readFileSync(new URL('../dist/edition.json', import.meta.url))).assets.find(path => /\/previewTesting-[^/]+\.js$/.test(path));
test.use({ serviceWorkers: 'allow' });
test(edition === 'public' ? 'first installed offline refresh keeps app bundles and the restored library available' : 'private preview retires shell caches and preserves its library on an online refresh', async ({ page, baseURL }) => {
  // Shut down a real same-origin server after installation. Playwright's WebKit
  // offline emulation can fail navigation before the service worker handles it.
  // Forward the optimized preview unchanged, then prove uncached fetches fail.
  const upstream = new URL(baseURL);
  const server = createServer(async (request, response) => {
    try {
      const target = new URL(request.url, upstream);
      if (target.origin !== upstream.origin) { response.writeHead(400).end(); return; }
      const result = await fetch(target);
      const headers = Object.fromEntries(result.headers);
      for (const name of ['content-encoding', 'content-length', 'connection', 'transfer-encoding']) delete headers[name];
      response.writeHead(result.status, headers); response.end(Buffer.from(await result.arrayBuffer()));
    } catch { response.writeHead(502).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const disconnect = async () => {
    if (!server.listening) return;
    const closing = new Promise(resolve => server.close(resolve)); server.closeAllConnections(); await closing;
  };
  try {
    page.on('dialog', dialog => dialog.accept()); await page.goto(origin);
    await page.locator('#restoreGunBackupBtn').click();
    await page.locator('#importFile').setInputFiles({ name: 'fixture.json', mimeType: 'application/json', buffer: library });
    await expect(page.locator('#homeView')).toBeVisible();
    if (edition === 'preview') {
      await page.locator('#settingsShortcut').click(); await page.locator('#previewTestMode').selectOption('full');
      await page.locator('.tab[data-view="home"]').click();
      await page.evaluate(async () => {
        await (await caches.open('dryfire-sound-trainer-preview-v28')).put('/old-private-shell', new Response('old private shell'));
        await (await caches.open('unrelated-cache')).put('/unrelated', new Response('keep'));
      });
      expect(await page.evaluate(async () => !!await caches.match('/unrelated'))).toBe(true);
      await page.evaluate(async modulePath => {
        const { retirePreviewShell } = await import(modulePath);
        await retirePreviewShell({ serviceWorker: navigator.serviceWorker, caches, origin: location.origin });
      }, previewModule);
      expect(await page.evaluate(async () => !!await caches.match('/unrelated'))).toBe(true);
      // Verify preservation during retirement itself, separately from WebKit's
      // cache lifetime on navigation when no service worker is registered.
      await page.evaluate(async () => {
        await (await caches.open('dryfire-sound-trainer-preview-v27')).put('/old-private-shell', new Response('old private shell'));
      });
      await page.reload();
      expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(0);
      expect(await page.evaluate(async () => (await caches.keys()).filter(key => key.startsWith('dryfire-sound-trainer-')))).toEqual([]);
    } else {
    // Production registers on HTTPS. Localhost is a secure context for exercising
    // the same built worker without weakening the application's HTTPS guard.
    await page.evaluate(async () => { await navigator.serviceWorker.register('/sw.js'); await navigator.serviceWorker.ready; });
    // Normal lifecycle intentionally leaves the installing tab unchanged; a new document adopts it.
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    const missing = await page.evaluate(async () => {
      const resources = performance.getEntriesByType('resource').map(row => row.name)
        .filter(url => url.startsWith(location.origin + '/assets/') && /\.(js|css)$/.test(url));
      return (await Promise.all(resources.map(async url => await caches.match(url) ? null : url))).filter(Boolean);
    });
    expect(missing, 'The first installation must cache dynamically loaded bundles too').toEqual([]);
    await disconnect();
    expect(await page.evaluate(async () => {
      try { await fetch('/uncached-offline-probe', { cache: 'no-store' }); return false; } catch { return true; }
    }), 'The origin is unreachable; cached resources alone must support refresh').toBe(true);
    await page.reload();
    }
    await expect(page.locator('#homeView')).toBeVisible(); await expect(page.locator('#activeGunName')).toHaveText('QA Handgun');
    // First visit to the React pages happens after offline refresh in public;
    // their lazy runtime must have been included in the original cache metadata.
    await page.locator('#aboutBtn').click();
    await expect(page.locator('#aboutView')).toBeVisible();
    await expect(page.locator('#aboutView [data-r-back]')).toBeVisible();
    const informationModule = JSON.parse(readFileSync(new URL('../dist/edition.json', import.meta.url))).assets.find(path => /\/informationPages-[^/]+\.js$/.test(path));
    expect(informationModule).toBeTruthy();
    // Import completion proves actual React code loaded, not only static HTML.
    expect(await page.evaluate(async modulePath => !!(await import(modulePath)).mountInformationPages, informationModule)).toBe(true);
    await page.locator('#contactBtn').click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page.locator('#aboutView')).toBeVisible();
    await page.getByRole('button', { name: 'Back to previous screen', exact: true }).click();
    await expect(page.locator('#homeView')).toBeVisible();
    await page.locator('#gunSwitcherBtn').click(); await expect(page.locator('#gunList .gun-profile')).toHaveCount(3);
    await page.locator('[data-gun-id="qa-gun-a"]').click(); await page.locator('.tab[data-view="history"]').click();
    await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);
    if (edition === 'preview') await expect(page.locator('.progress-chart')).toBeVisible();
    else await expect(page.locator('#progressSection')).not.toBeVisible();
    const modules=JSON.parse(readFileSync(new URL('../dist/edition.json',import.meta.url))).assets;
    for(const [view,entry,mount,marker] of [['settings','settingsPage','mountSettingsPage','data-react-settings'],['learn','learnPage','mountLearnPage','data-react-learn'],['recognize','liveListenPage','mountLiveListenPage','data-react-live-listen'],['drills','drillsPage','mountDrillsPage','data-react-drills'],['history','historyPage','mountHistoryPage','data-react-history']]){
      if(view==='settings')await page.locator('#settingsShortcut').click();else await page.locator(`.tab[data-view="${view}"]`).click();
      const module=modules.find(path=>path.includes(`/assets/${entry}-`));expect(module).toBeTruthy();
      expect(await page.evaluate(async({module,mount})=>typeof(await import(module))[mount]==='function',{module,mount})).toBe(true);
      await page.locator('.tab[data-view="home"]').click();if(view==='settings')await page.locator('#settingsShortcut').click();else await page.locator(`.tab[data-view="${view}"]`).click();
      await expect(page.locator(`#${view}View`)).toHaveAttribute(marker,'');
    }

    for(const [entry,view,selector,host] of [['practiceContents','practice','[data-practice-mode="single"]','#practiceRun'],['sequenceContents','session','#drillCatalog .preset-card button','#sessionRun']]){
      const module=modules.find(path=>path.includes(`/assets/${entry}-`));expect(module).toBeTruthy();
      await page.locator('.tab[data-view="drills"]').click();await page.locator(selector).first().click();
      expect(await page.evaluate(async({module,entry})=>typeof(await import(module))[entry==='practiceContents'?'mountPracticeContents':'mountSequenceContents']==='function',{module,entry})).toBe(true);
      await page.locator('.tab[data-view="home"]').click();await page.locator('.tab[data-view="drills"]').click();await page.locator(selector).first().click();
      await expect(page.locator(host)).toHaveAttribute('data-react-session','');
      await expect(page.locator('#'+view+'View')).toHaveAttribute(view==='practice'?'data-react-practice':'data-react-session-page','');
    }
    const guideModule=modules.find(path=>path.includes('/assets/guideContents-'));expect(guideModule).toBeTruthy();
    await page.locator('#sessionGuideLink').click();
    expect(await page.evaluate(async path=>typeof(await import(path)).mountGuideContents==='function',guideModule)).toBe(true);
    await page.locator('#practiceGuideReturnBtn').click();await page.locator('#sessionGuideLink').click();await expect(page.locator('#example-sessionRun')).toHaveAttribute('data-react-session','');await expect(page.locator('#practiceGuideView')).toHaveAttribute('data-react-guide','');
    const progressModule=modules.find(path=>path.includes('/assets/progressContent-'));
    if(edition==='preview'){
      expect(progressModule).toBeTruthy();
      expect(await page.evaluate(async path=>typeof(await import(path)).mountProgressContent==='function',progressModule)).toBe(true);
      await page.locator('.tab[data-view="home"]').click();await page.locator('.tab[data-view="history"]').click();
      await expect(page.locator('#progressContent')).toHaveAttribute('data-react-progress','');
    }else expect(progressModule).toBeUndefined();

  } finally { await disconnect(); }
});
