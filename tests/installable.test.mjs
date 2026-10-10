import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { restoreBackup } from '../src/storage.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('all app navigation targets and controls exist in HTML', () => {
  for (const id of ['homeView', 'learnView', 'recognizeView', 'historyView', 'settingsView',
    'homeLearnBtn', 'homeListenBtn', 'exportBtn', 'importBtn', 'importFile', 'installStatus',
    'homeExamples', 'homeEvents', 'homeAccuracy', 'safetyAck', 'listenBtn', 'trainingSummary',
    'maxResults', 'predictionCard', 'historyList',
    'drillSelect', 'drillSteps', 'drillStats', 'drillFeedback', 'drillProgressBadge', 'resetDrillBtn']) {
    assert.match(html, new RegExp(`id="${id}"`), `Missing ${id}`);
  }
  assert.match(html, /apple-touch-icon/);
  assert.match(html, /manifest.webmanifest/);
});

test('invalid backup files are rejected before database access', async () => {
  await assert.rejects(restoreBackup(null), /not a compatible/);
  await assert.rejects(restoreBackup({format:'sound-trainer-backup',version:1,featureVersion:999}), /not a compatible/);
  await assert.rejects(restoreBackup({format:'sound-trainer-backup',version:1,featureVersion:2,examples:[{label:'draw',id:'x',featureVersion:2,features:[1]}], events:[]}), /incompatible learned/);
  await assert.rejects(restoreBackup({format:'sound-trainer-backup',version:1,featureVersion:2,examples:[], events:[{id:'e',label:'draw',score:20,actualLabel:'wrong'}]}), /invalid verification/);
});

test('four labels and repeated-event timeline are present', () => {
  for (const label of ['draw', 'rack', 'trigger', 'reload']) {
    assert.match(html, new RegExp(`value="${label}"`));
  }
  for (const id of ['sessionTimeline', 'listeningIndicator', 'eventCounter']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});


test('compact navigation, per-class reset and animated previews are wired', async()=>{
  const main=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
  const storage=await readFile(new URL('../src/storage.js',import.meta.url),'utf8');
  const styles=await readFile(new URL('../src/styles.css',import.meta.url),'utf8');
  for(const id of ['settingsShortcut','drillCatalog','homeDrillsBtn','changeDrillBtn','freeListenBtn'])assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/data-view="drills"/);
  assert.match(main,/resetSoundProfile\(label\)/);
  assert.match(storage,/export async function clearExamplesForLabel/);
  assert.match(styles,/\.class-preview/);
  for(const label of ['draw','rack','trigger','reload']){
    const asset=await readFile(new URL('../public/motions/'+label+'.svg',import.meta.url),'utf8');
    assert.match(asset,/<svg/);
    assert.match(asset,/<animate/);
  }
});
