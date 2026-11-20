/** @jest-environment jsdom */
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import * as presentation from '../src/sessionPresentation.js';
import {semanticTree} from './helpers/guidePresentation.js';
import {loadLocale,translate} from '../apps/web/src/localization/runtime.ts';
const config={repetitions:2,startSource:'app',soundAtStart:true,parSeconds:1.5};
const state={phase:'active',completed:0,remaining:2,revision:0,shots:0,config,repetitions:[],countdownEndsAtMs:null,segmentStartMs:0,elapsedMs:0,practiceMode:'single',drillSteps:['trigger'],current:{stepIndex:0}};
const record={status:'completed',shots:0,completed:0,remaining:2,gunId:'one',gunName:'One',elapsedMs:0,startedAt:0,practiceMode:'single',config,repetitions:[]};
function setup(name){document.body.innerHTML=readFileSync(new URL('./fixtures/session-fragments/'+name+'.html',import.meta.url),'utf8');const get=id=>document.getElementById(id),query=selector=>document.querySelector(selector),node=(tag,text,className='')=>{const el=document.createElement(tag);el.textContent=text;el.className=className;return el;};return{get,query,node};}
for(const kind of ['practice-run','practice-review','session-run','session-review']){
 test.each([true,false])(`${kind} transfers inner writes exclusively only when the port accepts (%s)`,accept=>{
  const s=setup(kind),run=kind.endsWith('run'),practice=kind.startsWith('practice'),host=document.body.firstElementChild;
  if(practice&&run)host.dataset.phase='active';
  const before=semanticTree(host),input=jest.fn(),announce=jest.fn(),present=jest.fn(()=>accept),retry=s.node('button','Retry saving results');
  const common={$:practice?s.get:s.query,node:s.node,state,savedRevision:0,saveError:null,saving:false,pending:false,clock:()=>1000,microphone:{},readConfig:()=>config,titleFor:label=>label,locked:()=>false,getContext:()=>({gun:{id:'one'}}),present,noAttempt:translate('common','sessionUi.noAttempt'),noRepetition:translate('common','sessionUi.noRepetition'),retryLabel:translate('common','sessionUi.retrySaving'),latestEmpty:translate('common','sessionUi.latestEmpty'),practiceLatestEmpty:translate('common','sessionUi.practiceLatestEmpty')};
  if(practice&&run)presentation.renderPracticeRun({...common,mode:'single',interruption:false,closing:false,inputFeedback:'Ready',renderInput:input,details:jest.fn(),latestEmpty:'Localized empty result'});
  else if(practice)presentation.renderPracticeReview(record,{...common,interruption:false,details:jest.fn()});
  else if(run)presentation.renderSequenceRun({...common,resultDetails:jest.fn(),announce});
  else presentation.renderSequenceReview(record,{...common,retrySaveButton:retry,resultDetails:jest.fn()});
  expect(present).toHaveBeenCalledTimes(1);
  expect(present.mock.calls[0][0]).toHaveProperty(run?'latest':'results');
  if(accept){expect(semanticTree(host)).toEqual(before);expect(announce).not.toHaveBeenCalled();}
  else{expect(semanticTree(host)).not.toEqual(before);if(!practice&&run)expect(announce).toHaveBeenCalledWith('GO · awaiting trigger.');if(practice&&run)expect(host.querySelector('#practiceLatest')?.textContent).toBe('Localized empty result');}
  if(practice&&run){expect(input).toHaveBeenCalledTimes(1);expect(host.dataset.phase).toBe('active');}
 });
}

test('sequence native run and retry fallback copy follow the selected locale',async()=>{
 await loadLocale('de');
 try{
  const run=setup('session-run');presentation.renderSequenceRun({$:run.query,node:run.node,state:null,pending:true,clock:()=>0,microphone:false,readConfig:()=>config,savedRevision:0,titleFor:label=>label,resultDetails:()=>run.node('p',''),announce:()=>{},latestEmpty:translate('common','sessionUi.latestEmpty')});
  expect(run.get('sessionLatestResult').textContent).toBe('Deine abgeschlossene Wiederholung erscheint hier.');
  const review=setup('session-review'),retry=review.node('button','');review.query('.session-review-card').append(retry);
  presentation.renderSequenceReview({status:'completed',completed:0,remaining:1,gunId:'one',startedAt:0,config,repetitions:[],drillSteps:['trigger']},{$:review.query,node:review.node,state:null,savedRevision:null,saveError:null,saving:false,pending:false,retrySaveButton:retry,locked:()=>false,getContext:()=>({gun:{id:'one'}}),resultDetails:()=>review.node('p',''),noRepetition:translate('common','sessionUi.noRepetition'),retryLabel:translate('common','sessionUi.retrySaving')});
  expect(retry.textContent).toBe('Ergebnisse erneut speichern');
 }finally{await loadLocale('en');}
});
