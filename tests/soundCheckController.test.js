/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {jest} from '@jest/globals';
import {render} from '@testing-library/react';
import {createElement} from 'react';
import {SoundCheckPage} from '../apps/web/src/pages/SoundCheckPage/SoundCheckPage.tsx';
import {createSoundCheckController} from '../src/soundCheckController.js';

test('guided check waits for input, scores an attempt and exports JSON without PCM',async()=>{
 jest.useFakeTimers();const host=document.createElement('section');host.id='soundCheckView';document.body.append(host);render(createElement(SoundCheckPage),{container:host});
 let onEvent;const session={stop:jest.fn(),waitForInput:jest.fn().mockResolvedValue({ready:true}),armDetection:jest.fn(),disarmDetection:jest.fn(),nowMs:jest.fn().mockReturnValue(100)};
 const startContinuousListening=jest.fn(async options=>{onEvent=options.onEvent;options.onLevel(12);return session;}),download=jest.fn(),onError=jest.fn();
 const spectral=Array(23).fill(.2),examples=Array.from({length:3},()=>({label:'trigger',features:Array(15).fill(.2),spectralFeatures:spectral,spectralFeatureVersion:3}));
 expect(document.getElementById('soundCheckStartBtn')).toBeDisabled();
 const controller=createSoundCheckController({doc:document,startContinuousListening,examples,calibration:[],enabledLabels:['trigger'],audioPreferences:{},download,onError});
 expect(document.getElementById('soundCheckStartBtn')).toBeEnabled();expect(document.getElementById('soundCheckSetupHint')).toHaveTextContent('Ready to start');
 document.getElementById('soundCheckAttempts').value='1';document.getElementById('soundCheckStartBtn').click();await Promise.resolve();await Promise.resolve();
 expect(controller.locked()).toBe(true);expect(document.getElementById('soundCheckAttemptBtn').disabled).toBe(false);document.getElementById('soundCheckAttemptBtn').click();onEvent(new Float32Array(48000).fill(.02),48000);await jest.advanceTimersByTimeAsync(2000);
 expect(document.getElementById('soundCheckReview')).not.toHaveClass('hidden');document.getElementById('soundCheckExportBtn').click();expect(download).toHaveBeenCalledTimes(1);expect(download.mock.calls[0][0]).not.toMatch(/pcm|samples/i);expect(session.stop).toHaveBeenCalled();controller.dispose();jest.useRealTimers();
});

test('sound check prevents duplicate microphone starts while permission is pending',async()=>{
 const host=document.createElement('section');host.id='soundCheckView';document.body.append(host);render(createElement(SoundCheckPage),{container:host});
 let resolveStart;const startContinuousListening=jest.fn(()=>new Promise(resolve=>{resolveStart=resolve;}));
 const controller=createSoundCheckController({doc:document,startContinuousListening,examples:[],calibration:[],enabledLabels:['trigger'],audioPreferences:{},onError:jest.fn()});
 const start=document.getElementById('soundCheckStartBtn');start.click();start.click();
 expect(startContinuousListening).toHaveBeenCalledTimes(1);expect(start).toBeDisabled();expect(controller.locked()).toBe(true);
 const session={stop:jest.fn(),waitForInput:jest.fn().mockResolvedValue({ready:true})};resolveStart(session);
 await Promise.resolve();await Promise.resolve();await Promise.resolve();
 expect(session.waitForInput).toHaveBeenCalledTimes(1);expect(start).toBeDisabled();
 document.getElementById('soundCheckStopBtn').click();await Promise.resolve();
 expect(session.stop).toHaveBeenCalledTimes(1);expect(start).toBeEnabled();expect(controller.locked()).toBe(false);
 controller.dispose();host.remove();
});

test('stopping during pending microphone permission releases a late audio session',async()=>{
 const host=document.createElement('section');host.id='soundCheckView';document.body.append(host);render(createElement(SoundCheckPage),{container:host});
 let resolveStart;const startContinuousListening=jest.fn(()=>new Promise(resolve=>{resolveStart=resolve;}));
 const controller=createSoundCheckController({doc:document,startContinuousListening,examples:[],calibration:[],enabledLabels:['trigger'],audioPreferences:{},onError:jest.fn()});
 document.getElementById('soundCheckStartBtn').click();document.getElementById('soundCheckStopBtn').click();
 const lateSession={stop:jest.fn(),waitForInput:jest.fn()};resolveStart(lateSession);
 await Promise.resolve();await Promise.resolve();await Promise.resolve();
 expect(lateSession.stop).toHaveBeenCalledTimes(1);expect(lateSession.waitForInput).not.toHaveBeenCalled();
 expect(document.getElementById('soundCheckStartBtn')).toBeEnabled();expect(controller.locked()).toBe(false);
 controller.dispose();host.remove();
});
