import {StrictMode,Fragment} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {PracticeRunContents,type PracticeRunProps} from '@dryfire/ui/PracticeRun';
import {PracticeReviewContents,type PracticeReviewProps} from '@dryfire/ui/PracticeReview';
import {SequenceRunContents,type SequenceRunProps} from '@dryfire/ui/SequenceRun';
import {SequenceReviewContents,type SequenceReviewProps} from '@dryfire/ui/SequenceReview';
import {RetainedNode} from '@dryfire/ui/RetainedNode';
export type PracticeContents={kind:'practice';run:PracticeRunProps;review:PracticeReviewProps;meter:HTMLElement};
export type SequenceContents={kind:'sequence';run:SequenceRunProps;review:SequenceReviewProps};
export type SessionContents=PracticeContents|SequenceContents;
/** Explicit, synchronous two-host handoff. Feature controllers retain outer visibility and capture. */
export function mountSessionContents(runHost:HTMLElement,reviewHost:HTMLElement,initial:SessionContents){
 let model=initial,epoch=0,disposed=false,failure:unknown;
 let backups=[...runHost.childNodes],reviewBackup=[...reviewHost.childNodes];
 const active=runHost.ownerDocument.activeElement as HTMLElement|null;
 const focusId=active?.id,inside=!!active&&(runHost.contains(active)||reviewHost.contains(active));
 const summaries=[...runHost.querySelectorAll('summary'),...reviewHost.querySelectorAll('summary')];
 const focusSummary=summaries.indexOf(active as HTMLElement);
 const open=[...runHost.querySelectorAll('details'),...reviewHost.querySelectorAll('details')].map(node=>node.open);
 const meter=initial.kind==='practice'?initial.meter:null,meterParent=meter?.parentNode,meterNext=meter?.nextSibling;
 const options={onUncaughtError(error:unknown){failure=error;}};
 const runRoot=createRoot(runHost,options),reviewRoot=createRoot(reviewHost,options);
 const render=()=>{
  const value=model;
  flushSync(()=>{
   runRoot.render(<StrictMode>{value.kind==='practice'?<PracticeRunContents {...value.run} meter={<RetainedNode node={value.meter}/>} latest={<Fragment key={epoch}>{value.run.latest??(value.run.view?<p className="muted small">Recognized clicks and repetition outcomes appear here.</p>:null)}</Fragment>}/>:<SequenceRunContents {...value.run} latest={<Fragment key={epoch}>{value.run.latest??<p className="muted small">Your completed repetition will appear here.</p>}</Fragment>}/>}</StrictMode>);
   reviewRoot.render(<StrictMode>{value.kind==='practice'?<PracticeReviewContents {...value.review} results={<Fragment key={epoch}>{value.review.results??(value.review.view?<p className="empty-state">No attempt completed.</p>:null)}</Fragment>}/>:<SequenceReviewContents {...value.review} results={<Fragment key={epoch}>{value.review.results??(value.review.view?<p className="empty-state">No repetition was completed before this session ended.</p>:null)}</Fragment>}/>}</StrictMode>);
  });
  if(failure)throw failure;
 };
 try{
  render();
  [...runHost.querySelectorAll('details'),...reviewHost.querySelectorAll('details')].forEach((node,index)=>{node.open=open[index]??false;});
  if(inside){const target=focusSummary>=0?[...runHost.querySelectorAll('summary'),...reviewHost.querySelectorAll('summary')][focusSummary]:focusId?runHost.ownerDocument.getElementById(focusId):null;target?.focus();}
  runHost.setAttribute('data-react-session','');reviewHost.setAttribute('data-react-session','');
  backups=[];reviewBackup=[];
 }catch(error){
  flushSync(()=>{runRoot.unmount();reviewRoot.unmount();});
  runHost.replaceChildren(...backups);reviewHost.replaceChildren(...reviewBackup);
  if(meter&&meterParent)meterParent.insertBefore(meter,meterNext??null);
  active?.focus();throw error;
 }
 return{
  update(next:SessionContents){if(disposed)return;if(next.kind!==model.kind||(next.kind==='practice'&&model.kind==='practice'&&next.meter!==model.meter))throw new Error('Session handoff ownership cannot change.');model=next;epoch++;render();},
  dispose(){if(disposed)return;disposed=true;runHost.removeAttribute('data-react-session');reviewHost.removeAttribute('data-react-session');flushSync(()=>{runRoot.unmount();reviewRoot.unmount();});}
 };
}
