/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {jest} from '@jest/globals';
import {act,render} from '@testing-library/react';
import {createElement} from 'react';
import {SoundCheckPage} from '../apps/web/src/pages/SoundCheckPage/SoundCheckPage.tsx';
import {createSoundCheckController,localizedSoundCheckAnalysisError} from '../src/soundCheckController.js';
import {loadLocale} from '../apps/web/src/localization/runtime.ts';

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

test('runtime Sound Check status follows locale changes while the check is open',async()=>{
 await act(async()=>{await loadLocale('de');});
 const host=document.createElement('section');host.id='soundCheckView';document.body.append(host);render(createElement(SoundCheckPage),{container:host});
 let captureOptions,resolveWait;const session={stop:jest.fn(),waitForInput:jest.fn(()=>new Promise(resolve=>{resolveWait=resolve;})),armDetection:jest.fn(),disarmDetection:jest.fn(),nowMs:()=>100};
 const startContinuousListening=jest.fn(async options=>{captureOptions=options;options.onState('Requesting microphone access…');return session;});
 const controller=createSoundCheckController({doc:document,startContinuousListening,examples:[],calibration:[],enabledLabels:['trigger'],audioPreferences:{},onError:jest.fn()});
 expect(document.getElementById('soundCheckSetupHint')).toHaveTextContent('Bereit. Sicherheitsbestätigung und Mikrofonberechtigung folgen.');
 document.getElementById('soundCheckStartBtn').click();await Promise.resolve();await Promise.resolve();await Promise.resolve();
 expect(document.getElementById('soundCheckStatus')).toHaveTextContent('Mikrofonzugriff wird angefordert');
 await act(async()=>{await loadLocale('nl');});controller.updateLocale();
 expect(document.getElementById('soundCheckStatus')).toHaveTextContent('Microfoontoegang aanvragen');
 resolveWait({ready:true});await Promise.resolve();await Promise.resolve();controller.dispose();host.remove();await act(async()=>{await loadLocale('en');});
});

test('analysis feedback localizes coded failures instead of showing the English diagnostic',async()=>{
 await act(async()=>{await loadLocale('de');});
 const host=document.createElement('section');host.id='soundCheckView';document.body.append(host);render(createElement(SoundCheckPage),{container:host});
 let captureOptions;const session={stop:jest.fn(),waitForInput:jest.fn().mockResolvedValue({ready:true}),armDetection:jest.fn(),disarmDetection:jest.fn(),nowMs:()=>100};
 const startContinuousListening=jest.fn(async options=>{captureOptions=options;return session;});
 const controller=createSoundCheckController({doc:document,startContinuousListening,examples:[],calibration:[],enabledLabels:['trigger'],audioPreferences:{},onError:jest.fn()});
 document.getElementById('soundCheckAttempts').value='1';document.getElementById('soundCheckStartBtn').click();await Promise.resolve();await Promise.resolve();
 document.getElementById('soundCheckAttemptBtn').click();captureOptions.onEvent(new Float32Array(10),48000);
 expect(document.getElementById('soundCheckStatus')).toHaveTextContent('Die Aufnahme ist zu kurz für eine Analyse.');
 expect(document.getElementById('soundCheckStatus')).not.toHaveTextContent('Recording is too short to analyse.');
 await act(async()=>{await loadLocale('nl');});controller.updateLocale();
 expect(document.getElementById('soundCheckStatus')).toHaveTextContent('De opname is te kort om te analyseren.');
 expect(localizedSoundCheckAnalysisError('UNKNOWN_ANALYSIS_ERROR')).toContain('Controleer de opname en probeer het opnieuw.');
 controller.dispose();host.remove();await act(async()=>{await loadLocale('en');});
});
