import {PracticePage,type PracticePageProps} from '../pages/PracticePage';
import {RetainedNode} from '@dryfire/ui/RetainedNode';
import {mountRetainedPage} from './retainedPage';
type Step={text:string;className:string};
type Model={title:string;guideHidden:boolean;gunName:string;contextHidden:boolean;steps:Step[]};
export function mountPracticePage(host:HTMLElement,callbacks:Pick<PracticePageProps,'onBack'|'onGuide'>){
 const get=(id:string)=>host.querySelector<HTMLElement>('#'+id)!;
 const configure=get('practiceConfigure'),run=get('practiceRun'),review=get('practiceReview');
 const initial:Model={title:get('practice-title').textContent!,guideHidden:get('practiceGuideLink').classList.contains('hidden'),gunName:host.querySelector('.gun-context-name')!.textContent!,contextHidden:host.querySelector('.gun-context')!.classList.contains('hidden'),steps:[...get('practiceSteps').children].map(node=>({text:node.textContent!,className:node.className}))};
 return mountRetainedPage(host,initial,state=><PracticePage {...callbacks} {...state} steps={state.steps.map((step,index)=><li key={index} className={step.className}>{step.text}</li>)} configure={<RetainedNode node={configure}/>} run={<RetainedNode node={run}/>} review={<RetainedNode node={review}/>}/>,'data-react-practice');
}
