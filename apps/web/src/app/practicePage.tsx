import {PracticePage,type PracticePageProps} from '../pages/PracticePage';
import {RetainedNode} from '@dryfire/ui/RetainedNode';
import {mountRetainedPage} from './retainedPage';
import {registerRetainedSetupLocalization} from '../localization/retainedSetup.ts';
import {useLocaleMessages} from '../localization/runtime.ts';
type Step={label?:string;text:string;className:string};
type Model={mode?:string;guideHidden:boolean;guideHref:string;gunName:string;contextHidden:boolean;steps:Step[]};
export function mountPracticePage(host:HTMLElement,callbacks:Pick<PracticePageProps,'onBack'|'onGuide'>){
 const get=(id:string)=>host.querySelector<HTMLElement>('#'+id)!;
 const configure=get('practiceConfigure'),run=get('practiceRun'),review=get('practiceReview');
 const initial:Model={mode:host.dataset.practicePageMode,guideHref:get('practiceGuideLink').getAttribute('href')!,guideHidden:get('practiceGuideLink').classList.contains('hidden'),gunName:host.querySelector('.gun-context-name')!.textContent!,contextHidden:host.querySelector('.gun-context')!.classList.contains('hidden'),steps:[...get('practiceSteps').children].map(node=>({label:(node as HTMLElement).dataset.soundId,text:node.textContent!,className:node.className}))};
 const view=mountRetainedPage(host,initial,state=><PracticePage {...callbacks} {...state} steps={state.steps.map((step,index)=><PracticeStep key={index} step={step}/>)} configure={<RetainedNode node={configure}/>} run={<RetainedNode node={run}/>} review={<RetainedNode node={review}/>}/>,'data-react-practice');
 const unregister=registerRetainedSetupLocalization(configure,'practice');
 return{...view,dispose(){unregister();view.dispose();}};
}

function PracticeStep({step}:{step:Step}){const {t}=useLocaleMessages('common');return <li data-sound-id={step.label} className={step.className}>{step.label?t(`sound.${step.label}`):step.text}</li>;}
