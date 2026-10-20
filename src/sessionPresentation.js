import {practiceRunPresentation,sequenceRunPresentation,practiceReviewPresentation,sequenceReviewPresentation} from '../apps/web/src/features/sessions/phasePresentation.ts';
import {practiceResultPresentation,sequenceResultPresentation} from '../apps/web/src/features/sessions/resultPresentation.ts';
// Shared read-only presentation for live sessions and explicitly simulated help examples.
import { continuousPractice, practiceElapsed, practiceStatistics } from './practiceSession.js';

function resultDetailsNode(model,node){
  const card=node('details','','session-result-card');
  card.append(node('summary',model.summary));
  const body=node('div','','session-result-body');
  for(const paragraph of model.paragraphs)body.append(node('p',paragraph.text,paragraph.className));
  if(model.detections.length){const list=node('ol','','session-detection-list');for(const text of model.detections)list.append(node('li',text));body.append(list);}
  card.append(body);return card;
}

export function practiceResultDetails(row,{node,titleFor}){
  return resultDetailsNode(practiceResultPresentation(row,titleFor),node);
}

function renderControls(model,$){
  for(const {id,token,enabled}of model.classes)$(id).classList.toggle(token,enabled);
  for(const [id,text]of Object.entries(model.texts))$(id).textContent=text;
  for(const [id,disabled]of Object.entries(model.disabled))$(id).disabled=disabled;
}

export function renderPracticeReview(record,{ $,node,state,savedRevision,saveError,saving,interruption,locked,getContext,details }){
  const model=practiceReviewPresentation(record,{state,savedRevision,saveError:!!saveError,saving,interruption:!!interruption,locked:locked(),gunId:getContext().gun?.id,continuous:continuousPractice(record.practiceMode),stats:practiceStatistics(record)});
  $('practiceReviewStatus').textContent=model.title;$('practiceReviewStatus').dataset.status=model.status;
  $('practiceSummary').replaceChildren(...model.summary.map(row=>node('p',row.text,row.className)));
  $('practiceSaved').textContent=model.savedNote;
  $('practiceRetryBtn').classList.toggle('hidden',model.retryHidden);$('practiceRetryBtn').disabled=model.retryDisabled;
  $('practiceResults').replaceChildren(...model.results.map(details));
  if(!model.results.length)$('practiceResults').append(node('p','No attempt completed.','empty-state'));
  $('practiceRepeatBtn').disabled=model.repeatDisabled;
}

export function renderPracticeRun({ $,state,mode,pending,clock,microphone,readConfig,interruption,closing,saving,inputFeedback,renderInput,details,node }){
  const elapsed=state?practiceElapsed(state,clock()):0;
  const model=practiceRunPresentation({state,mode,pending,clock,microphone:!!microphone,readConfig,interruption:!!interruption,closing,saving,inputFeedback,elapsed,continuous:continuousPractice(mode)});
  $('practiceRun').dataset.phase=model.phase;
  renderControls(model,$);renderInput();
  $('practiceLatest').replaceChildren(model.latest?details(model.latest):node('p','Recognized clicks and repetition outcomes appear here.','muted small'));
}

export function sequenceResultDetails(row,{node,titleFor}){
  return resultDetailsNode(sequenceResultPresentation(row,titleFor),node);
}

export function renderSequenceReview(record,{ $,node,state,savedRevision,saveError,saving,pending,retrySaveButton,locked,getContext,resultDetails }){
  const model=sequenceReviewPresentation(record,{state,savedRevision,saveError:!!saveError,saving,pending,locked:locked(),gunId:getContext().gun?.id});
  $('#sessionReviewStatus').dataset.status=model.status;$('#sessionReviewStatus').textContent=model.title;
  $('#sessionReviewSummary').replaceChildren(...model.summary.map(row=>node('p',row.text,row.className)));
  const host=$('#sessionResultList');host.replaceChildren();
  if(!model.results.length)host.append(node('p','No repetition was completed before this session ended.','empty-state'));
  for(const row of model.results)host.append(resultDetails(row));
  $('#sessionReview .session-saved-note').textContent=model.savedNote;
  retrySaveButton.classList.toggle('hidden',model.retryHidden);retrySaveButton.disabled=model.retryDisabled;
  $('#repeatSessionBtn').disabled=model.repeatDisabled;
}

export function renderSequenceRun({ $,state,pending,clock,microphone,readConfig,savedRevision,titleFor,resultDetails,announce,node }){
  const model=sequenceRunPresentation({state,pending,clock,microphone:!!microphone,readConfig,savedRevision,titleFor});
  const get=id=>$('#'+id);renderControls(model,get);
  $('#sessionProgressMeter').max=model.progress.max;$('#sessionProgressMeter').value=model.progress.value;
  announce(model.announcement);
  $('#sessionLatestResult').replaceChildren(model.latest?resultDetails(model.latest):node('p','Your completed repetition will appear here.','muted small'));
}
