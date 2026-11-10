import '../../packages/ui/src/HistoryDeleteControl/HistoryDeleteControl.css';
import {evaluationPresentation} from '../../apps/web/src/features/history/presentation.ts';
import {recognitionRows} from '../../apps/web/src/features/history/presentation.ts';
import {ACTUAL_CLASSES,PREDICTED_CLASSES,evaluateEvents} from '../evaluation.js';

/** Legacy-shell fallback while the React History page is still loading. */
export function renderEvaluation(doc,events){
  const stats=evaluationPresentation(evaluateEvents(events),ACTUAL_CLASSES,PREDICTED_CLASSES);
  doc.getElementById('verifiedCount').textContent=stats.verified;
  doc.getElementById('accuracyPct').textContent=stats.accuracy;
  doc.getElementById('falsePositivePct').textContent=stats.falsePositive;
  const host=doc.getElementById('confusionTable');host.replaceChildren();
  if(!stats.verified){const p=doc.createElement('p');p.className='muted small';p.textContent='Verify at least one event below to see the confusion matrix.';host.append(p);return;}
  const table=doc.createElement('table'),caption=doc.createElement('caption');caption.textContent='Actual sound by predicted label (counts)';table.append(caption);
  const head=doc.createElement('tr');
  for(const name of ['Actual ↓ / Predicted →',...PREDICTED_CLASSES]){const th=doc.createElement('th');th.scope='col';th.textContent=name;head.append(th);}
  const thead=doc.createElement('thead');thead.append(head);table.append(thead);
  const tbody=doc.createElement('tbody');
  for(const actual of ACTUAL_CLASSES){const tr=doc.createElement('tr'),th=doc.createElement('th');th.scope='row';th.textContent=actual;tr.append(th);for(const predicted of PREDICTED_CLASSES){const td=doc.createElement('td');td.textContent=stats.matrix[actual][predicted];if(predicted===actual||(actual==='other'&&predicted==='unknown'))td.className='correct';tr.append(td);}tbody.append(tr);}
  table.append(tbody);host.append(table);
}

export function renderHistoryList(doc,events,{labels,titleFor,drillTitleFor,onVerify,onDelete,onError}){
  const host=doc.getElementById('historyList');host.replaceChildren();
  if(!events.length){const empty=doc.createElement('div');empty.className='empty-state';empty.textContent='No recognition events yet.';host.append(empty);return;}
  for(const row of recognitionRows(events,titleFor,drillTitleFor)){
    const item=doc.createElement('article'),copy=doc.createElement('div'),title=doc.createElement('strong'),date=doc.createElement('p'),score=doc.createElement('span');item.className='history-item';title.textContent=row.title;date.textContent=row.date;score.textContent=row.score;
    if(row.sequence){const description=doc.createElement('p');description.textContent=row.sequence;copy.append(description);}copy.append(title,date);
    const controls=doc.createElement('div'),actualLabel=doc.createElement('label'),actual=doc.createElement('select');controls.className='history-controls';actualLabel.textContent='Actual:';actual.setAttribute('aria-label',`Actual sound for ${row.date}`);
    for(const [value,label] of [['','Not verified'],...labels.map(key=>[key,titleFor(key)]),['other','Other / noise']]){const option=doc.createElement('option');option.value=value;option.textContent=label;actual.append(option);}actual.value=row.actualLabel??'';
    actual.addEventListener('change',async()=>{try{await onVerify(row.id,actual.value);}catch(error){onError(error);}});controls.append(actualLabel,actual,score);
    if(onDelete){const remove=doc.createElement('button');remove.type='button';remove.className='history-delete-button';remove.textContent='Delete';remove.setAttribute('aria-label',`Delete recognition result from ${row.date}`);remove.addEventListener('click',()=>{const confirm=doc.createElement('div');confirm.className='history-delete-confirm';confirm.setAttribute('role','group');confirm.setAttribute('aria-label',`Delete recognition result from ${row.date} confirmation`);const text=doc.createElement('span'),yes=doc.createElement('button'),cancel=doc.createElement('button');text.textContent='Delete this recognition result?';yes.type=cancel.type='button';yes.className='button danger';cancel.className='button secondary';yes.textContent='Delete';cancel.textContent='Cancel';yes.setAttribute('aria-label',`Confirm deleting recognition result from ${row.date}`);cancel.setAttribute('aria-label',`Cancel deleting recognition result from ${row.date}`);yes.addEventListener('click',()=>Promise.resolve(onDelete(row)).catch(onError));cancel.addEventListener('click',()=>confirm.replaceWith(remove));confirm.append(text,yes,cancel);remove.replaceWith(confirm);});controls.append(remove);}
    item.append(copy,controls);host.append(item);
  }
}

export function renderSavedSessions(doc,records,{onOpen,onDelete,onError}){
  const host=doc.getElementById('savedSessions');host.replaceChildren();
  if(!records.length){const empty=doc.createElement('p');empty.className='empty-state';empty.textContent='No saved drill sessions for this gun yet.';host.append(empty);return;}
  for(const record of records){
    const card=doc.createElement('article'),title=doc.createElement('strong'),open=doc.createElement('button');card.className='saved-session-card';title.className='';title.textContent=record.drillTitle;
    const count=record.kind==='practice'?`${record.shots} shots · ${record.completed} attempts`:`${record.completed}/${record.config.repetitions}`;
    open.type='button';open.className='button secondary wide-action';open.textContent=`${new Date(record.startedAt).toLocaleString()} · ${count} · ${record.status}`;open.addEventListener('click',()=>onOpen(record));card.append(title,open);
    if(onDelete){const remove=doc.createElement('button');remove.type='button';remove.className='history-delete-button';remove.textContent='Delete';remove.setAttribute('aria-label',`Delete ${record.drillTitle} session`);remove.addEventListener('click',()=>{if(doc.defaultView.confirm('Delete?'))Promise.resolve(onDelete(record)).catch(onError);});card.append(remove);}
    host.append(card);
  }
}
