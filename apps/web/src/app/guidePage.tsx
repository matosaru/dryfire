import {Fragment} from 'react';
import {PracticeGuidePage,type PracticeGuidePageProps} from '../pages/PracticeGuidePage';
import {RetainedNode} from '@dryfire/ui/RetainedNode';
import {mountRetainedPage} from './retainedPage';
type Model={texts:Record<string,string>;sequence:{label:string;text:string}[];steps:string[];early:boolean;sequenceHidden:boolean;examplesHidden:boolean};
const textIds=['practiceGuideKind','practiceGuideName','practiceGuidePurpose','practiceGuideCurrentSetup','practiceGuideExampleNote','practiceGuideMeasures','practiceGuideExpect','practiceGuideRequires'];
export function mountGuidePage(host:HTMLElement,callbacks:Pick<PracticeGuidePageProps,'onBack'|'onAction'>){
 const get=(id:string)=>host.querySelector<HTMLElement>('#'+id)!;
 const figure=host.querySelector<HTMLElement>('.guide-media')!;
 let texts=Object.fromEntries(textIds.map(id=>[id,get(id).textContent!]));
 const initial:Model={texts,sequence:[...get('practiceGuideSequence').querySelectorAll<HTMLElement>('[data-sound]')].map(node=>({label:node.dataset.sound!,text:node.textContent!})),steps:[...get('practiceGuideSteps').children].map(node=>node.textContent!),early:get('practiceGuideEarlyBtn').getAttribute('aria-pressed')==='true',sequenceHidden:get('practiceGuideSequence').classList.contains('hidden'),examplesHidden:get('practiceGuideExamples').classList.contains('hidden')};
 const view=mountRetainedPage(host,initial,state=><PracticeGuidePage {...callbacks} {...state} sequence={state.sequence.map((step,index)=><Fragment key={index}>{index?' → ':null}<span className="preset-chip" data-sound={step.label}>{step.text}</span></Fragment>)} steps={state.steps.map((step,index)=><li key={index}>{step}</li>)} example={<RetainedNode node={figure}/>}/>,'data-react-guide');
 return{update(next:Partial<Model>){if(next.texts){texts={...texts,...next.texts};next={...next,texts};}view.update(next);},dispose:view.dispose};
}
