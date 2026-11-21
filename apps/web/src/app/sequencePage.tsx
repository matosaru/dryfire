import {SequencePage,type SequencePageProps} from '../pages/SequencePage';
import {RetainedNode} from '@dryfire/ui/RetainedNode';
import {mountRetainedPage} from './retainedPage';
import {registerRetainedSetupLocalization} from '../localization/retainedSetup.ts';
import {useLocaleMessages} from '../localization/runtime.ts';
type Step={label?:string;text:string;className:string};
type Model={guideHidden:boolean;guideHref:string;gunName:string;contextHidden:boolean;steps:Step[];presetName:string};
export function mountSequencePage(host:HTMLElement,callbacks:Pick<SequencePageProps,'onBack'|'onGuide'>){
 const get=(id:string)=>host.querySelector<HTMLElement>('#'+id)!;
 const configure=get('sessionConfigure'),run=get('sessionRun'),review=get('sessionReview');
 const initial:Model={guideHref:get('sessionGuideLink').getAttribute('href')!,guideHidden:get('sessionGuideLink').classList.contains('hidden'),gunName:host.querySelector('.gun-context-name')!.textContent!,contextHidden:host.querySelector('.gun-context')!.classList.contains('hidden'),presetName:get('sessionPresetName').textContent!,steps:[...get('sessionSteps').children].map(node=>({label:(node as HTMLElement).dataset.soundId,text:node.textContent!,className:node.className}))};
 const view=mountRetainedPage(host,initial,state=><SequencePage {...callbacks} {...state} steps={state.steps.map((step,index)=><SequenceStep key={index} step={step}/>)} configure={<RetainedNode node={configure}/>} run={<RetainedNode node={run}/>} review={<RetainedNode node={review}/>}/>,'data-react-session-page');
 const unregister=registerRetainedSetupLocalization(configure,'sequence');
 return{...view,dispose(){unregister();view.dispose();}};
}
function SequenceStep({step}:{step:Step}){const {t}=useLocaleMessages('common');return <li data-sound-id={step.label} className={step.className}>{step.label?t(`sound.${step.label}`):step.text}</li>;}
