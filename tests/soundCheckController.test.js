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
 const controller=createSoundCheckController({doc:document,startContinuousListening,examples,calibration:[],enabledLabels:['trigger'],audioPreferences:{},download,onError});
 document.getElementById('soundCheckAttempts').value='1';document.getElementById('soundCheckStartBtn').click();await Promise.resolve();await Promise.resolve();
 expect(controller.locked()).toBe(true);expect(document.getElementById('soundCheckAttemptBtn').disabled).toBe(false);document.getElementById('soundCheckAttemptBtn').click();onEvent(new Float32Array(48000).fill(.02),48000);await jest.advanceTimersByTimeAsync(2000);
 expect(document.getElementById('soundCheckReview')).not.toHaveClass('hidden');document.getElementById('soundCheckExportBtn').click();expect(download).toHaveBeenCalledTimes(1);expect(download.mock.calls[0][0]).not.toMatch(/pcm|samples/i);expect(session.stop).toHaveBeenCalled();controller.dispose();jest.useRealTimers();
});
