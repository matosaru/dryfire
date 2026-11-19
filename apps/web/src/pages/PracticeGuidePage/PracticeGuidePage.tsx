import {DrillSetupSteps} from '@dryfire/ui/DrillSetup';
import type {ReactNode} from 'react';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {PracticeRun} from '@dryfire/ui/PracticeRun';
import {PracticeReview} from '@dryfire/ui/PracticeReview';
import {SequenceRun} from '@dryfire/ui/SequenceRun';
import {SequenceReview} from '@dryfire/ui/SequenceReview';
import {useLocaleMessages} from '../../localization/runtime.ts';
export type PracticeGuidePageProps={title?:string;texts?:Record<string,string>;sequence?:ReactNode;steps?:ReactNode;example?:ReactNode;early?:boolean;sequenceHidden?:boolean;examplesHidden?:boolean;onBack?:()=>void;onAction?:(id:string)=>void};
/** Shared parent source; native configuration and child-root lifetimes may be retained explicitly. */
export function PracticeGuidePage({title,texts,sequence,steps,example,early=false,sequenceHidden=false,examplesHidden=false,onBack,onAction}:PracticeGuidePageProps){const {t}=useLocaleMessages('practice-guide');return <>
<PageHeading id="practiceGuide-title" title={title??t('page.title')} backId="practiceGuideBackBtn" backLabel={t('back')} sharedBack={false} reactBack={false} onBack={onBack}/>
<p id="practiceGuideKind" className="guide-kicker">{texts?.practiceGuideKind??t('kind')}</p>
<h3 id="practiceGuideName" className="guide-title">{texts?.practiceGuideName}</h3>
<p id="practiceGuidePurpose" className="guide-intro">{texts?.practiceGuidePurpose}</p>
<DrillSetupSteps id="practiceGuideSequence" label={t('sequenceLabel')} hidden={sequenceHidden}>{sequence}</DrillSetupSteps>
<p id="practiceGuideCurrentSetup" className="guide-current-setup">{texts?.practiceGuideCurrentSetup}</p>
<div id="practiceGuideExamples" className={examplesHidden?'guide-example-options hidden':'guide-example-options'} role="group" aria-label={t('exampleGroup')}><button onClick={()=>onAction?.('practiceGuideNormalBtn')} id="practiceGuideNormalBtn" type="button" aria-pressed={!early}>{t('normalRepetitions')}</button><button onClick={()=>onAction?.('practiceGuideEarlyBtn')} id="practiceGuideEarlyBtn" type="button" aria-pressed={early}>{t('earlyTrigger')}</button></div>
{example??<>
<figure className="guide-media">
<p id="practiceGuideExampleLabel" className="guide-example-label">{texts?.practiceGuideExampleLabel??t('exampleDisclosure')}</p>
<div id="practiceGuideExample" className="guide-live-example" aria-label={t('exampleAriaLabel')}>
<PracticeRun prefix="example-"/>
<PracticeReview prefix="example-"/>
<SequenceRun prefix="example-"/>
<SequenceReview prefix="example-"/>
</div>
<figcaption><span>{t('exampleCaption')}</span><button onClick={()=>onAction?.('practiceGuidePlayBtn')} id="practiceGuidePlayBtn" className="guide-play" type="button" aria-pressed="false">{t('playExample')}</button></figcaption></figure>
</>}
<p id="practiceGuideExampleNote" className="guide-example-note">{texts?.practiceGuideExampleNote}</p>
<section className="guide-card"><h3>{t('measuresHeading')}</h3><p id="practiceGuideMeasures">{texts?.practiceGuideMeasures}</p></section>
<section className="guide-how"><h3>{t('howHeading')}</h3><ol id="practiceGuideSteps">{steps}</ol></section>
<section className="guide-note"><h3>{t('goodToKnowHeading')}</h3><p id="practiceGuideExpect">{texts?.practiceGuideExpect}</p></section>
<p className="guide-ready"><strong>{t('beforeStart')}</strong><span id="practiceGuideRequires">{texts?.practiceGuideRequires}</span> {t('safetyReminder')}</p>
<button onClick={()=>onAction?.('practiceGuideReturnBtn')} id="practiceGuideReturnBtn" type="button" className="button primary wide-action">{t('back')}</button>
<p className="guide-disclosure">{t('measurementDisclosure')}</p>

</>;}
