import {mountPracticeContents} from './practiceContents';
import {mountSequenceContents} from './sequenceContents';
type PracticeOptions=Parameters<typeof mountPracticeContents>[2];
type SequenceOptions=Parameters<typeof mountSequenceContents>[2];
type Models={setPracticeRun?:PracticeOptions['runModel'];setPracticeReview?:PracticeOptions['reviewModel'];setSequenceRun?:SequenceOptions['runModel'];setSequenceReview?:SequenceOptions['reviewModel']};
/** Read-only examples share live contents; no capture/storage/feedback dependencies. */
export function mountGuideContents(doc:Document,{models,titleFor,onAction}:{models:Models;titleFor:(label:string)=>string;onAction:(id:string)=>void}){
 const get=(id:string)=>doc.getElementById('example-'+id)!;
 const hosts=['practiceRun','practiceReview','sessionRun','sessionReview'].map(get);
 const backup=hosts.map(host=>[...host.childNodes]),meter=get('practiceLevelPanel'),parent=meter.parentNode!,next=meter.nextSibling,active=doc.activeElement as HTMLElement|null;
 const shared={prefix:'example-',silent:true,titleFor,onAction};
 const practice=mountPracticeContents(hosts[0],hosts[1],{...shared,runModel:models.setPracticeRun,reviewModel:models.setPracticeReview});
 let sequence:ReturnType<typeof mountSequenceContents>;
 try{sequence=mountSequenceContents(hosts[2],hosts[3],{...shared,runModel:models.setSequenceRun,reviewModel:models.setSequenceReview});}
 catch(error){practice.dispose();hosts.forEach((host,index)=>host.replaceChildren(...backup[index]));parent.insertBefore(meter,next);active?.focus();throw error;}
 return{setPracticeRun:practice.setRun,setPracticeReview:practice.setReview,setSequenceRun:sequence.setRun,setSequenceReview:sequence.setReview,dispose(){practice.dispose();sequence.dispose();}};
}
