/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {jest} from '@jest/globals';
import {serialize,deserialize} from 'node:v8';
import {controllerPage} from './helpers/controllerDom.js';
import {createPracticeGuideController} from '../src/practiceGuideController.js';
test('guide handoff waits for a paused context, connects once and invokes original read-only playback/back actions',()=>{
 const oldClone=globalThis.structuredClone,oldRequest=globalThis.requestAnimationFrame,oldCancel=globalThis.cancelAnimationFrame;
 globalThis.structuredClone=value=>deserialize(serialize(value));globalThis.requestAnimationFrame=jest.fn(()=>1);globalThis.cancelAnimationFrame=jest.fn();
 document.body.innerHTML=controllerPage('practiceGuide');let actions;const port=Object.fromEntries(['setPracticeRun','setPracticeReview','setSequenceRun','setSequenceReview'].map(key=>[key,jest.fn()]));const mount=jest.fn((_doc,options)=>{actions=options.onAction;return port;}),back=jest.fn();
 try{
  const controller=createPracticeGuideController({onBack:back});expect(controller.connectView(mount)).toBe(false);
  controller.open({type:'practice',mode:'single',gunId:'one',routeKey:'setup',config:{}});document.getElementById('practiceGuidePlayBtn').click();expect(controller.connectView(mount)).toBe(false);expect(controller.connectPage(mount)).toBe(false);expect(mount).not.toHaveBeenCalled();
  controller.pause();expect(controller.connectView(mount)).toBe(true);expect(controller.connectView(mount)).toBe(false);expect(mount).toHaveBeenCalledTimes(1);
  actions('practiceResumeBtn');expect(document.getElementById('practiceGuidePlayBtn').textContent).toBe('Pause');actions('practicePauseBtn');expect(document.getElementById('practiceGuidePlayBtn').textContent).toMatch(/Resume|Play/);
  actions('practiceRepeatBtn');expect(port.setPracticeRun).toHaveBeenCalled();actions('practiceNextBtn');actions('practiceDoneBtn');expect(back).toHaveBeenCalledWith('practice');actions('unknown');
 }finally{globalThis.structuredClone=oldClone;globalThis.requestAnimationFrame=oldRequest;globalThis.cancelAnimationFrame=oldCancel;document.body.replaceChildren();}
});
