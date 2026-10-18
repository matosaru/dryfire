import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { measureArtifact, payloadViolations } from '../tools/performance/artifact.mjs';
let directory;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(),'dryfire-artifact-')); mkdirSync(join(directory,'assets'));
  writeFileSync(join(directory,'index.html'),'<script type="module" src="/assets/app.js"></script><link rel="stylesheet" crossorigin href="/assets/app.css">');
  writeFileSync(join(directory,'assets/app.js'),'import "./required.js"; export const app = 1;');
  writeFileSync(join(directory,'assets/required.js'),'export const required = 1;');
  writeFileSync(join(directory,'assets/lazy.js'),'export const lazy = 1;');
  writeFileSync(join(directory,'assets/app.css'),'body{color:white}');
  writeFileSync(join(directory,'edition.json'),JSON.stringify({edition:'public',sourceRevision:'fixture',assets:['/assets/app.js','/assets/required.js','/assets/lazy.js','/assets/app.css']}));
});
afterEach(()=>rmSync(directory,{recursive:true,force:true}));
test('HTML transfer is reported separately when prerendering moves content out of startup JavaScript', () => {
  const before = measureArtifact(directory);
  const html = readFileSync(join(directory,'index.html'),'utf8') + '<p>Prerendered content and controls</p>';
  writeFileSync(join(directory,'index.html'),html);
  const after = measureArtifact(directory);
  expect(after.critical.html).toEqual({raw:Buffer.byteLength(html),gzip:gzipSync(html).length,files:['index.html']});
  expect(after.critical.html.raw).toBeGreaterThan(before.critical.html.raw);
  expect(after.critical.js).toEqual(before.critical.js);
  expect(after.total.html).toEqual(after.critical.html);
});
test('counts mandatory static imports and reports lazy/installed bytes separately', () => {
  const report = measureArtifact(directory);
  expect(report.critical.js.files).toEqual(['/assets/app.js','/assets/required.js']);
  expect(report.total.js.files).toContain('/assets/lazy.js');
  expect(report.total.js.raw).toBeGreaterThan(report.critical.js.raw);
  expect(report.hashes['index.html']).toHaveLength(64);
});
test('a mandatory transitive chunk cannot hide an increased initial payload', () => {
  const baseline = measureArtifact(directory);
  writeFileSync(join(directory,'assets/required.js'),'export const payload = '+JSON.stringify('larger runtime')+';');
  expect(payloadViolations(measureArtifact(directory),baseline).join(' ')).toContain('Critical js raw');
});
test('different editions cannot share an accidentally lower or higher budget', () => {
  const baseline = measureArtifact(directory);
  expect(payloadViolations({...baseline,edition:'preview'},baseline)).toEqual(['Artifact editions do not match.']);
});
test('external and escaping static imports fail rather than vanishing from accounting', () => {
  writeFileSync(join(directory,'assets/app.js'),'import "https://example.test/runtime.js";');
  expect(()=>measureArtifact(directory)).toThrow('External critical');
  writeFileSync(join(directory,'assets/app.js'),'import "../../outside.js";');
  expect(()=>measureArtifact(directory)).toThrow('Asset escapes');
});
