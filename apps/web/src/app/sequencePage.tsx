import {SequencePage,type SequencePageProps} from '../pages/SequencePage';
import {RetainedNode} from '@dryfire/ui/RetainedNode';
import {mountRetainedPage} from './retainedPage';
type Step={text:string;className:string};
type Model={title:string;guideHidden:boolean;gunName:string;contextHidden:boolean;steps:Step[];presetName:string};
export function mountSequencePage(host:HTMLElement,callbacks:Pick<SequencePageProps,'onBack'|'onGuide'>){
 const get=(id:string)=>host.querySelector<HTMLElement>('#'+id)!;
 const configure=get('sessionConfigure'),run=get('sessionRun'),review=get('sessionReview');
 const initial:Model={title:get('session-title').textContent!,guideHidden:get('sessionGuideLink').classList.contains('hidden'),gunName:host.querySelector('.gun-context-name')!.textContent!,contextHidden:host.querySelector('.gun-context')!.classList.contains('hidden'),presetName:get('sessionPresetName').textContent!,steps:[...get('sessionSteps').children].map(node=>({text:node.textContent!,className:node.className}))};
 return mountRetainedPage(host,initial,state=><SequencePage {...callbacks} {...state} steps={state.steps.map((step,index)=><li key={index} className={step.className}>{step.text}</li>)} configure={<RetainedNode node={configure}/>} run={<RetainedNode node={run}/>} review={<RetainedNode node={review}/>}/>,'data-react-session-page');
}
