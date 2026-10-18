/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {renderPageTemplates} from '../tools/page-templates.mjs';
import {soundCard} from '../src/uiComponents.js';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const start=source.indexOf('const labelMeta ='), metadata=source.slice(start,source.indexOf('};',start)+2);
const rendering=source.slice(source.indexOf('function renderLearningLocks()'),source.indexOf('async function toggleOptionalSound'));
function setup() {
  document.body.innerHTML=renderPageTemplates('{{app}}');
  const counts={trigger:3,draw:1,rack:0,reload:0};
  const record=jest.fn(),reset=jest.fn(),calibration=jest.fn();
  const context={document,soundCard,$:selector=>document.querySelector(selector),activeView:'learn',activeGun:{id:'one',name:'One',needsDetails:false},
    titleFor:label=>label,labels:['draw','rack','trigger','reload'],getCounts:()=>counts,triggerReady:()=>counts.trigger>=3,
    MAX_EXAMPLES_PER_CLASS:10,MIN_EXAMPLES_PER_CLASS:3,RECOMMENDED_EXAMPLES_PER_CLASS:8,
    profileLocked:()=>context.busy,busy:false,livePendingStart:false,liveSession:null,sessionController:null,practiceController:null,
    enabledSoundLabels:['trigger','draw'],recordExample:record,resetSoundProfile:reset,toggleOptionalSound:jest.fn(),renderCalibrationCards:calibration,
  };
  const {renderClassCards,renderLearningLocks}=vm.runInNewContext(metadata+'\n'+rendering+'\n;({renderClassCards,renderLearningLocks});',context);
  return{context,counts,record,reset,calibration,render:renderClassCards,locks:renderLearningLocks};
}

test('visible Learning retains ordering, readiness, optional recognition and native per-type limits',()=>{
  const s=setup();s.render();
  expect([...document.querySelectorAll('.class-card')].map(card=>card.dataset.soundLabel)).toEqual(['trigger','draw','rack','reload']);
  expect(document.querySelector('[data-sound-label="trigger"] .progress-label')).toHaveTextContent('3 / 10 samples · ready to recognize');
  expect(document.querySelector('[data-sound-label="draw"] input')).toBeChecked();
  document.querySelector('[data-sound-label="trigger"] .record-example').click();expect(s.record).toHaveBeenCalledWith('trigger');
  s.counts.trigger=10;s.render();
  expect(document.querySelector('[data-sound-label="trigger"] .record-example')).toBeDisabled();
  expect(document.querySelector('[data-sound-label="trigger"] .progress-label')).toHaveTextContent('limit reached · existing samples kept');
  document.querySelector('[data-sound-label="trigger"] .reset-class').click();expect(s.reset).toHaveBeenCalledWith('trigger');
});

test('profile locks and changed gun counts refresh visible learning and Home readiness without capture',()=>{
  const s=setup();s.context.busy=true;s.render();
  for(const button of document.querySelectorAll('.class-card button'))expect(button).toBeDisabled();
  s.context.busy=false;s.context.activeGun={id:'two',name:'Two',needsDetails:false};s.counts.trigger=0;s.counts.draw=0;s.render();
  expect(document.querySelector('#trainingSummary')).toHaveTextContent('Learn at least 3 trigger examples');
  expect(document.querySelector('#homeListenBtn')).toBeDisabled();
  expect(document.querySelector('[data-sound-label="trigger"] .reset-class')).toBeDisabled();
  expect(s.record).not.toHaveBeenCalled();expect(s.reset).not.toHaveBeenCalled();
});


test('practice updates retain hidden Learning nodes while readiness stays current; returning refreshes them',()=>{
  const s=setup();s.render();
  const original=document.querySelector('[data-sound-label="trigger"]');
  s.context.activeView='practice';s.counts.trigger=0;s.render();
  expect(document.querySelector('[data-sound-label="trigger"]')).toBe(original);
  expect(document.querySelector('#homeExamples')).toHaveTextContent('0 / 8 trigger');
  expect(document.querySelector('#homeListenBtn')).toBeDisabled();
  expect(s.calibration).toHaveBeenCalledTimes(1);
  s.context.activeView='learn';s.render();
  expect(document.querySelector('[data-sound-label="trigger"]')).not.toBe(original);
  expect(document.querySelector('[data-sound-label="trigger"] .reset-class')).toBeDisabled();
  expect(s.calibration).toHaveBeenCalledTimes(2);
});
