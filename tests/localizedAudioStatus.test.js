import {afterEach,test,expect} from '@jest/globals';
import {loadLocale} from '../apps/web/src/localization/runtime.ts';
import {translateAudioStatus} from '../src/localizedAudioStatus.js';

afterEach(async()=>loadLocale('en'));

test('audio lifecycle statuses follow the selected locale and preserve countdown values',async()=>{
 await loadLocale('de');
 expect(translateAudioStatus('Requesting microphone access…')).toBe('Mikrofonzugriff wird angefordert…');
 expect(translateAudioStatus('Get ready… 3')).toBe('Mach dich bereit… 3');
 await loadLocale('nl');
 expect(translateAudioStatus('Live listening (AudioWorklet)')).toBe('Live luisteren (AudioWorklet)');
});

test('saved statuses are localized while unknown messages remain unchanged',async()=>{
 await loadLocale('de');
 expect(translateAudioStatus('Practice saved')).toBe('Übung gespeichert');
 expect(translateAudioStatus('Unmapped application status')).toBe('Unmapped application status');
});

test('recognition and microphone errors use the active language',async()=>{
 await loadLocale('nl');
 expect(translateAudioStatus('No clear sound detected. Move closer to the microphone or try a quieter room.'))
  .toBe('Geen duidelijk geluid herkend. Ga dichter bij de microfoon staan of probeer een stillere ruimte.');
});
