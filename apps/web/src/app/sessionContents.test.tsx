/** @jest-environment jsdom */
import {act} from '@testing-library/react';
import '@dryfire/testing/setup';
import {mountSessionContents} from './sessionContents.tsx';
import {loadLocale} from '../localization/runtime.ts';

test('practice and sequence controls localize on rerender when the active language changes',async()=>{
 const run=document.createElement('div'),review=document.createElement('div'),meter=document.createElement('div');meter.innerHTML='<p class="practice-level-label"><span>MICROPHONE INPUT</span></p><div id="practiceLevelMeter" aria-valuenow="4" aria-label="Microphone input level"></div><p class="practice-level-value"><strong id="practiceLevelValue">4</strong><span>relative level</span></p><p id="practiceInputState">Waiting for audio input…</p>';let mounted:ReturnType<typeof mountSessionContents>|undefined;
 const practice={kind:'practice' as const,meter,run:{view:{texts:{}}},review:{view:{title:'',status:'complete',summary:[],savedNote:'',retryHidden:true,retryDisabled:false,repeatDisabled:false}}};
 const sequence={kind:'sequence' as const,run:{view:{texts:{}}},review:{view:{title:'',status:'complete',summary:[],savedNote:'',retryHidden:true,retryDisabled:false,repeatDisabled:false}}};
 try{
  await act(async()=>{await loadLocale('de');});
  act(()=>{mounted=mountSessionContents(run,review,practice);});
  expect(run).toHaveTextContent('Versuche');expect(run).toHaveTextContent('MIKROFONEINGANG');expect(run).toHaveTextContent('Warte auf Audioeingang');expect(run).toHaveTextContent('Pause');
  await act(async()=>{await loadLocale('en');});act(()=>mounted?.update(practice));
  expect(run).toHaveTextContent('Attempts');expect(run).toHaveTextContent('MICROPHONE INPUT');
  act(()=>mounted?.dispose());mounted=undefined;run.replaceChildren();review.replaceChildren();
  await act(async()=>{await loadLocale('nl');});act(()=>{mounted=mountSessionContents(run,review,sequence);});
  expect(run.querySelector('.session-progress')).toHaveAttribute('aria-label','Voortgang van sessie');expect(run).toHaveTextContent('Huidige herhaling');expect(review).toHaveTextContent('Herhalingsresultaten');expect(review).toHaveTextContent('De tijden geven herkende geluiden weer');
 }finally{act(()=>mounted?.dispose());await act(async()=>{await loadLocale('en');});}
});
