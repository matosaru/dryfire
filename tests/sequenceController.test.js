/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@testing-library/jest-dom';
import {mountSequencePage} from '../apps/web/src/app/sequencePage.tsx';
import {mountSequenceContents} from '../apps/web/src/app/sequenceContents.tsx';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {serialize,deserialize} from 'node:v8';
import {controllerPage,deferred,clickPcm} from './helpers/controllerDom.js';
const audio=await import('../src/audio.js');
const capture=jest.fn(),save=jest.fn(),get=jest.fn(),set=jest.fn(),getSessions=jest.fn();
const cue={prepare:jest.fn(),play:jest.fn(),close:jest.fn()};
jest.unstable_mockModule('../src/audio.js',()=>({...audio,startContinuousListening:capture}));
jest.unstable_mockModule('../src/storage/library.js',()=>({getGunSetting:get,setGunSetting:set,saveSession:save,getSessions}));
jest.unstable_mockModule('../src/feedback.js',()=>({createStartCuePlayer:()=>cue,requestFeedbackVibration:()=>({supported:true,accepted:true})}));
const {createSessionController}=await import('../src/sessionController.js');
const library=JSON.parse(readFileSync(new URL('../visual-tests/fixtures/library.json',import.meta.url),'utf8'));
const originalClone=globalThis.structuredClone;
const config={repetitions:1,delayMode:'fixed',fixedDelaySeconds:1,soundAtStart:true};
const drill={id:'trigger-only',title:'Trigger pull',steps:['trigger']};
describe.each([false,true])('Sequence controller React presentation %s',react=>{
let mounted,parent;
let loadPresentation;
let controller,context,callbacks,options,session,captureCalled;
const $=id=>document.getElementById(id);
const submit=()=>$('sessionConfigForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
beforeEach(()=>{
 globalThis.structuredClone=value=>deserialize(serialize(value));jest.useFakeTimers();
 document.body.innerHTML='<input id="safetyAck" type="checkbox" checked><div id="savedSessions"></div>'+'<div id="sessionView">'+controllerPage('session')+'</div>';
 context={gun:library.guns[0],examples:library.examples.filter(row=>row.gunId===library.guns[0].id),calibration:[],audioPreferences:{noiseFilter:true},sensitivity:'medium'};
 callbacks=Object.fromEntries(['onNavigate','onBack','onChange','onError','onStatus','onProcessing','onVibration','onPracticeRecord'].map(key=>[key,jest.fn()]));callbacks.ensureSafe=jest.fn(()=>true);
 session={nowMs:()=>performance.now(),stop:jest.fn(async()=>{}),armDetection:jest.fn(),disarmDetection:jest.fn()};captureCalled=deferred();
 capture.mockReset().mockImplementation(async value=>{options=value;captureCalled.resolve();return session;});save.mockReset().mockResolvedValue(undefined);set.mockReset().mockResolvedValue(undefined);get.mockReset().mockImplementation(async(_key,fallback)=>fallback);getSessions.mockReset().mockResolvedValue([]);
 cue.prepare.mockReset().mockResolvedValue(true);cue.play.mockReset().mockReturnValue(true);cue.close.mockReset().mockResolvedValue(undefined);
 loadPresentation=()=>import('../src/sessionPresentation.js');
 controller=createSessionController({...callbacks,loadPresentation:()=>loadPresentation(),getContext:()=>context,titleFor:label=>label,vibrationEnabled:()=>false});
 if(react){controller.connectView((...args)=>(mounted=mountSequenceContents(...args)));controller.connectPage((...args)=>(parent=mountSequencePage(...args)),event=>event.preventDefault());}
});
afterEach(async()=>{save.mockResolvedValue(undefined);await controller.interrupt('navigation');await controller.flush();mounted?.dispose();mounted=null;parent?.dispose();parent=null;jest.useRealTimers();globalThis.structuredClone=originalClone;});
async function begin(){await controller.open(drill,config);submit();await captureCalled.promise;await jest.advanceTimersByTimeAsync(0);await controller.flush();}

test('presentation loading completes before configuration and a switched gun cancels the pending open',async()=>{
 const loading=deferred();loadPresentation=jest.fn(()=>loading.promise);
 const opening=controller.open(drill,config);await jest.advanceTimersByTimeAsync(0);
 expect(loadPresentation).toHaveBeenCalledTimes(1);expect(capture).not.toHaveBeenCalled();expect(callbacks.onNavigate).not.toHaveBeenCalled();
 context={...context,gun:library.guns[1]};controller.reset();loading.resolve(await import('../src/sessionPresentation.js'));await opening;
 expect(callbacks.onNavigate).not.toHaveBeenCalled();expect(capture).not.toHaveBeenCalled();
});
test('navigation cancels a pending configuration import without reopening its page',async()=>{
 const loading=deferred();loadPresentation=()=>loading.promise;const opening=controller.open(drill,config);
 await jest.advanceTimersByTimeAsync(0);await controller.interrupt('navigation');loading.resolve(await import('../src/sessionPresentation.js'));await opening;
 expect(callbacks.onNavigate).not.toHaveBeenCalled();expect(capture).not.toHaveBeenCalled();
});
test('a cancelled saved-review load does not announce a stale network error',async()=>{
 const loading=deferred();loadPresentation=()=>loading.promise;const opening=controller.showRecord({...library.sessions[0],kind:'sequence',drillId:drill.id,drillTitle:drill.title,drillSteps:drill.steps});
 await controller.interrupt('navigation');loading.reject(new Error('Late unavailable chunk'));await opening;
 expect(callbacks.onError).not.toHaveBeenCalled();expect(callbacks.onNavigate).not.toHaveBeenCalled();expect(capture).not.toHaveBeenCalled();
});
test('a failed presentation import leaves configuration retryable without acquiring audio',async()=>{
 const failure=new Error('Presentation unavailable');loadPresentation=jest.fn().mockRejectedValueOnce(failure).mockImplementation(()=>import('../src/sessionPresentation.js'));
 await expect(controller.open(drill,config)).rejects.toBe(failure);expect(callbacks.onNavigate).not.toHaveBeenCalled();expect(capture).not.toHaveBeenCalled();
 await controller.open(drill,config);expect(callbacks.onNavigate).toHaveBeenCalled();expect(capture).not.toHaveBeenCalled();
});
test('a reset invalidates a delayed saved-review load',async()=>{
 const loading=deferred();loadPresentation=()=>loading.promise;const record={...library.sessions[0],kind:'sequence',drillId:drill.id,drillTitle:drill.title,drillSteps:drill.steps};
 const opening=controller.showRecord(record);expect(callbacks.onNavigate).not.toHaveBeenCalled();controller.reset();
 loading.resolve(await import('../src/sessionPresentation.js'));await opening;expect(callbacks.onNavigate).not.toHaveBeenCalled();expect(capture).not.toHaveBeenCalled();
 await controller.showRecord(record);expect(callbacks.onNavigate).toHaveBeenCalled();expect(capture).not.toHaveBeenCalled();
});
test('saved-review load errors are visible and a retry preserves the record',async()=>{
 const record={...library.sessions[0],kind:'sequence',drillId:drill.id,drillTitle:drill.title,drillSteps:drill.steps},before=JSON.stringify(record),failure=new Error('Presentation unavailable');
 loadPresentation=jest.fn().mockRejectedValueOnce(failure).mockImplementation(()=>import('../src/sessionPresentation.js'));
 await controller.showRecord(record);expect(callbacks.onError).toHaveBeenCalledWith(failure);expect(callbacks.onNavigate).not.toHaveBeenCalled();
 await controller.showRecord(record);expect(callbacks.onNavigate).toHaveBeenCalled();expect(JSON.stringify(record)).toBe(before);expect(capture).not.toHaveBeenCalled();
});

test('parent ownership keeps context updates exclusive and cannot connect during capture',async()=>{const mount=jest.fn((...args)=>(parent=mountSequencePage(...args)));if(react){expect(controller.hasPage()).toBe(true);expect(controller.connectPage(mount)).toBe(false);controller.updateContext({gunName:'Changed gun',contextHidden:false});expect(document.querySelector('.gun-context-name').textContent).toBe('Changed gun');return;}expect(controller.hasPage()).toBe(false);controller.updateContext({gunName:'Ignored'});expect(()=>controller.connectPage(()=>{throw new Error('mount failed');})).toThrow('mount failed');await begin();expect(controller.connectPage(mount)).toBe(false);await controller.interrupt('navigation');await controller.flush();expect(controller.connectPage(mount)).toBe(true);});
test('opening/configuring retains action order, native bounds and setup focus without requesting audio',async()=>{await controller.open(drill,config);expect(callbacks.onNavigate).toHaveBeenCalledWith('session');expect(document.activeElement).toBe($('session-title'));expect($('sessionRepetitions').value).toBe('1');expect($('sessionRepetitions').min).toBe('1');expect($('sessionRepetitions').max).toBe('100');expect($('sessionSteps').textContent).toContain('trigger');expect(capture).not.toHaveBeenCalled();$('sessionRepetitions').value='';$('sessionRepetitions').dispatchEvent(new Event('change',{bubbles:true}));expect($('sessionRepetitions').value).toBe('');expect(set).not.toHaveBeenCalled();});
test('safety and learned-sound guards prevent capture before a valid start',async()=>{await controller.open(drill,config);callbacks.ensureSafe.mockReturnValue(false);submit();await jest.advanceTimersByTimeAsync(0);expect(capture).not.toHaveBeenCalled();callbacks.ensureSafe.mockReturnValue(true);context.examples=[];submit();await jest.advanceTimersByTimeAsync(0);expect(capture).not.toHaveBeenCalled();expect($('sessionStartBtn')).toBeDisabled();});
test('late microphone permission cannot revive a cancelled start',async()=>{const permission=deferred();capture.mockImplementation(value=>{options=value;captureCalled.resolve();return permission.promise;});await controller.open(drill,config);submit();await captureCalled.promise;expect(controller.locked()).toBe(true);await controller.interrupt('navigation');expect(options.signal.aborted).toBe(true);permission.resolve(session);await jest.advanceTimersByTimeAsync(0);expect(session.stop).toHaveBeenCalledTimes(1);expect(save).not.toHaveBeenCalled();expect(controller.locked()).toBe(false);});
test('countdown, cue, acoustic onset timing, persistence and completed review preserve native behavior',async()=>{await begin();expect(options.detectionEnabled).toBe(false);expect($('sessionCountdown').textContent).toBe('1.0');expect(cue.play).not.toHaveBeenCalled();await jest.advanceTimersByTimeAsync(1500);await controller.flush();expect($('sessionCountdown').textContent).toBe('GO');expect(session.armDetection).toHaveBeenCalledWith({guardMs:300});const {samples,rate}=clickPcm();options.onEvent(samples,rate,{onsetMs:performance.now()-50});await controller.flush();expect(save.mock.calls.at(-1)[0]).toMatchObject({gunId:context.gun.id,completed:1});await jest.advanceTimersByTimeAsync(1200);await controller.flush();expect($('sessionReview')).not.toHaveClass('hidden');expect($('sessionReviewStatus')).toHaveTextContent('Session completed');expect($('sessionResultList')).toContainHTML('Repetition 1');expect(session.stop).toHaveBeenCalled();expect(callbacks.onError).not.toHaveBeenCalled();});
test('pause releases capture and Resume starts a fresh countdown',async()=>{await begin();await jest.advanceTimersByTimeAsync(400);$('pauseSessionBtn').click();await jest.advanceTimersByTimeAsync(0);await controller.flush();expect($('sessionCountdown').textContent).toBe('Paused');expect(session.stop).toHaveBeenCalledTimes(1);expect($('resumeSessionBtn')).not.toHaveClass('hidden');$('resumeSessionBtn').click();await jest.advanceTimersByTimeAsync(0);await controller.flush();expect(capture).toHaveBeenCalledTimes(2);expect($('sessionCountdown').textContent).toBe('1.0');expect(cue.play).not.toHaveBeenCalled();});
test('owned saved reviews stay read-only and another gun cannot open them',async()=>{const record={...library.sessions[0],kind:'sequence',drillId:drill.id,drillTitle:drill.title,drillSteps:drill.steps};await controller.showRecord({...record,gunId:'another-gun'});expect(callbacks.onNavigate).not.toHaveBeenCalled();await controller.showRecord(record);expect(callbacks.onNavigate).toHaveBeenCalledWith('session');expect(capture).not.toHaveBeenCalled();expect($('sessionReview')).not.toHaveClass('hidden');expect($('sessionConfigFields')).not.toBeDisabled();expect(document.querySelector('#sessionReview .session-saved-note')).toHaveTextContent('Saved on this device');});

test('failed saving retains an owned review and explicit retry clears the unsaved guard',async()=>{await begin();await jest.advanceTimersByTimeAsync(1500);await controller.flush();const failure=new Error('Storage full');save.mockRejectedValue(failure);const {samples,rate}=clickPcm();options.onEvent(samples,rate,{onsetMs:performance.now()});await controller.flush();expect(controller.hasUnsavedResults()).toBe(true);expect(document.querySelector('#sessionReview .session-saved-note')).toHaveTextContent('Results are not saved. Keep this page open and retry saving.');const retry=document.querySelector('#sessionReview .session-review-card button');expect(retry).not.toHaveClass('hidden');expect(session.stop).toHaveBeenCalled();save.mockResolvedValue(undefined);retry.click();await controller.flush();await jest.advanceTimersByTimeAsync(0);expect(controller.hasUnsavedResults()).toBe(false);expect(document.querySelector('#sessionReview .session-saved-note')).toHaveTextContent('Saved on this device');expect(retry).toHaveClass('hidden');});
test('a delayed configuration read cannot open another gun’s session',async()=>{const delayed=deferred();get.mockReturnValue(delayed.promise);const pending=controller.open(drill);await Promise.resolve();context={...context,gun:library.guns[1]};delayed.resolve(config);await pending;expect(callbacks.onNavigate).not.toHaveBeenCalled();expect(capture).not.toHaveBeenCalled();});

});
