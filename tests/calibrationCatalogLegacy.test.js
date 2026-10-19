/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { calibrationProgress } from '../packages/ui/src/CalibrationCatalog/CalibrationCatalog.copy.ts';
const fixture=readFileSync(new URL('./fixtures/legacy-calibration-catalog.html',import.meta.url),'utf8');
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const body=source.slice(source.indexOf('function renderCalibrationCards()'),source.indexOf('async function recordCalibration'));

function setup({locked=false,calibration=[]}={}) {
  document.body.innerHTML=fixture;
  for(const text of document.querySelectorAll('article p')) text.dataset.description=text.textContent.replace(' 0 / 10 samples.','');
  const recordCalibration=jest.fn(), clearCalibrationExamples=jest.fn(async()=>{}), setBusy=jest.fn(), confirm=jest.fn(()=>true);
  const context={learnPage:null,document,calibrationProgress,$:selector=>document.querySelector(selector),MAX_EXAMPLES_PER_CLASS:10,calibration,
    profileLocked:()=>locked,recordCalibration,clearCalibrationExamples,ownerId:()=> 'gun-one',getCalibrationExamples:async()=>[],
    setBusy,confirm,showError:jest.fn(),renderClassCards:jest.fn()};
  const render=vm.runInNewContext(body+';bindCalibrationActions();renderCalibrationCards;',context);
  render();return {render,recordCalibration,clearCalibrationExamples,setBusy,confirm};
}
test('calibration choices preserve count limits, native actions and gun-owned reset scope',async()=>{
  const api=setup({calibration:[{kind:'reset'},...Array.from({length:10},()=>({kind:'cue'}))]});
  const cards=[...document.querySelectorAll('article')];
  expect(cards.map(card=>card.querySelector('h3').textContent)).toEqual(['Trigger reset clicks','Other noise / handling','External start beep']);
  expect(cards[0].querySelector('p').textContent).toBe('Examples of clicks that must not count as a shot. 1 / 10 samples.');
  expect(cards[2].querySelector('p').textContent).toContain('10 / 10 samples. Recording limit reached; existing samples are kept.');
  api.render(); api.render(); cards[0].querySelector('.primary').click();expect(api.recordCalibration).toHaveBeenCalledWith('reset');
  cards[2].querySelector('.primary').click();expect(api.recordCalibration).toHaveBeenCalledTimes(1);
  expect(cards[1].querySelector('.secondary').disabled).toBe(true);
  cards[0].querySelector('.secondary').click(); await new Promise(resolve=>setTimeout(resolve,0));
  expect(api.confirm).toHaveBeenCalledWith('Remove Trigger reset clicks calibration for this gun? Learned action sounds and all history stay saved.');
  expect(api.clearCalibrationExamples).toHaveBeenCalledWith('reset','gun-one');
  expect(api.setBusy.mock.calls).toEqual([[true],[false]]);
});
test('a locked profile disables all calibration actions',()=>{
  const api=setup({locked:true,calibration:[{kind:'reset'}]});
  for(const button of document.querySelectorAll('button')) {expect(button.disabled).toBe(true);button.click();}
  expect(api.recordCalibration).not.toHaveBeenCalled();expect(api.clearCalibrationExamples).not.toHaveBeenCalled();
});
