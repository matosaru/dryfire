// Export the working help component, never a second animation drawing.
// Requires a built public dist and Playwright Chromium. Encode with the paired
// Python/Pillow tool. The pinned CI collector is the reviewed renderer.
import { styleSources } from './style-sources.mjs';
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const out = resolve(process.argv.includes('--output') ? process.argv[process.argv.indexOf('--output') + 1] : '/tmp/dryfire-guide-frames');
const edition = JSON.parse(readFileSync('dist/edition.json'));
if (edition.edition !== 'public') throw new Error('Export guides from the public build.');
mkdirSync(out, { recursive: true });
const sources = [...styleSources(), 'tools/style-sources.mjs', 'src/sessionPresentation.js', 'src/practiceGuideController.js', 'src/practiceGuideRendering.js', 'src/practiceGuideExamples.js', 'src/practiceGuides.js', 'src/practiceGuideManuals.js', 'src/practiceSession.js', 'src/practiceModes.js', 'src/drillSession.js', 'src/templates/pages/practiceGuide.html', 'tools/page-templates.mjs', 'tools/export-guide-examples.mjs', 'tools/encode-guide-examples.py', 'apps/web/src/app/renderSessionFragments.tsx', ...['PracticeRun','PracticeReview','SequenceRun','SequenceReview'].flatMap(name=>[`packages/ui/src/${name}/${name}.tsx`,`packages/ui/src/${name}/index.ts`])];
const sourceHashes = Object.fromEntries(sources.map(p => [p, createHash('sha256').update(readFileSync(p)).digest('hex')]));
const server = spawn(process.execPath, ['--import', 'tsx', 'node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort'], { stdio: 'ignore' });
let browser;
try {
  for (let i=0;i<100;i++) {
    try { if ((await fetch('http://127.0.0.1:4174')).ok) break; } catch {}
    if (i===99) throw new Error('Guide export preview server unavailable');
    await new Promise(r => setTimeout(r, 100));
  }
  browser = await chromium.launch(process.env.GUIDE_EXPORT_BROWSER ? { executablePath: process.env.GUIDE_EXPORT_BROWSER, args: ['--no-sandbox'] } : {});
  const page = await browser.newPage({ viewport: { width: 390, height: 4096 }, deviceScaleFactor: 1, locale: 'en-GB', timezoneId: 'UTC', reducedMotion: 'reduce', serviceWorkers: 'block' });
  let microphoneRequests = 0;
  await page.exposeFunction('guideMicAttempt', () => { microphoneRequests++; });
  await page.addInitScript(() => { Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getSupportedConstraints: () => ({}), getUserMedia: () => { window.guideMicAttempt(); return Promise.reject(new Error('No microphone in guide exports')); } } }); });
  page.on('dialog', d => d.accept());
  await page.goto('http://127.0.0.1:4174');
  await page.locator('#restoreGunBackupBtn').click();
  const library = JSON.parse(readFileSync('visual-tests/fixtures/library.json')); library.settings.appearance = 'dark';
  await page.locator('#importFile').setInputFiles({ name:'example-library.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify(library)) });
  await page.locator('#homeView').waitFor({ state:'visible' });
  const now = new Date('2026-10-11T11:00:00Z'); await page.clock.install({ time: now }); await page.clock.pauseAt(now);
  const cases = ['single','single-early','repeated','par','control','reload','free','sequence-trigger-only','sequence-rack-trigger','sequence-mag-trigger','sequence-draw-mag-trigger','sequence-custom'];
  const exports = [];
  for (const name of cases.filter(name => !process.argv.includes('--only') || name === process.argv[process.argv.indexOf('--only') + 1])) {
    await page.locator('.tab[data-view="drills"]').click();
    if (name.startsWith('sequence-')) {
      if (name==='sequence-custom') { await page.locator('#customDrillsTab').click(); await page.locator('#customDrillCatalog').getByRole('button', { name:'Start Drill' }).first().click(); }
      else await page.locator('#drillCatalog .preset-card').nth(cases.slice(7).indexOf(name)).getByRole('button', { name:'Start Drill' }).click();
      await page.locator('#sessionGuideLink').click();
    } else { await page.locator(`[data-practice-mode="${name==='single-early'?'single':name}"]`).click(); await page.locator('#practiceGuideLink').click(); }
    if (name==='single-early') await page.locator('#practiceGuideEarlyBtn').click();
    await page.locator('#practiceGuidePlayBtn').click();
    rmSync(`${out}/${name}`, { recursive:true, force:true });
    mkdirSync(`${out}/${name}`, { recursive:true });
    let count=0;
    for (;count<600;count++) {
      await page.locator('.guide-media').screenshot({ path:`${out}/${name}/${String(count).padStart(4,'0')}.png`, animations:'disabled', caret:'hide' });
      if (await page.locator('#practiceGuidePlayBtn').textContent()==='Replay example') { count++; break; }
      await page.clock.runFor(200);
    }
    if (count>=600) throw new Error(`Example did not reach Review: ${name}`);
    exports.push({ name, frames:count, frameMs:200 }); console.log(`Exported ${name}: ${count} frames`);
  }
  if (microphoneRequests) throw new Error('Example acquired microphone');
  writeFileSync(`${out}/frames.json`, JSON.stringify({ sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(), renderer:process.env.VISUAL_IMAGE || `local Chromium ${browser.version()}`, sources:sourceHashes, exports },null,2)+'\n');
} finally { await browser?.close(); server.kill(); }
