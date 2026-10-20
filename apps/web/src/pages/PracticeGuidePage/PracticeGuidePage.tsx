import type {ReactNode} from 'react';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {PracticeRun} from '@dryfire/ui/PracticeRun';
import {PracticeReview} from '@dryfire/ui/PracticeReview';
import {SequenceRun} from '@dryfire/ui/SequenceRun';
import {SequenceReview} from '@dryfire/ui/SequenceReview';
export type PracticeGuidePageProps={title?:string;texts?:Record<string,string>;sequence?:ReactNode;steps?:ReactNode;example?:ReactNode;early?:boolean;sequenceHidden?:boolean;examplesHidden?:boolean;onBack?:()=>void;onAction?:(id:string)=>void};
/** Shared parent source; native configuration and child-root lifetimes may be retained explicitly. */
export function PracticeGuidePage({title,texts,sequence,steps,example,early=false,sequenceHidden=false,examplesHidden=false,onBack,onAction}:PracticeGuidePageProps){return <>
<PageHeading id="practiceGuide-title" title={title??'About this practice'} backId="practiceGuideBackBtn" backLabel="Back to setup" sharedBack={false} reactBack={false} onBack={onBack}/>
<p id="practiceGuideKind" className="guide-kicker">{texts?.practiceGuideKind??'PRACTICE GUIDE'}</p>
<h3 id="practiceGuideName" className="guide-title">{texts?.practiceGuideName}</h3>
<p id="practiceGuidePurpose" className="guide-intro">{texts?.practiceGuidePurpose}</p>
<div id="practiceGuideSequence" className={sequenceHidden?'preset-steps guide-sequence hidden':'preset-steps guide-sequence'} aria-label="Selected sound order">{sequence}</div>
<p id="practiceGuideCurrentSetup" className="guide-current-setup">{texts?.practiceGuideCurrentSetup}</p>
<div id="practiceGuideExamples" className={examplesHidden?'guide-example-options hidden':'guide-example-options'} role="group" aria-label="Single practice example"><button onClick={()=>onAction?.('practiceGuideNormalBtn')} id="practiceGuideNormalBtn" type="button" aria-pressed={!early}>Normal repetitions</button><button onClick={()=>onAction?.('practiceGuideEarlyBtn')} id="practiceGuideEarlyBtn" type="button" aria-pressed={early}>Early trigger</button></div>
{example??<>
<figure className="guide-media">
<p id="practiceGuideExampleLabel" className="guide-example-label">{texts?.practiceGuideExampleLabel??'SIMULATED EXAMPLE · NO LIVE MICROPHONE · NOTHING IS SAVED'}</p>
<div id="practiceGuideExample" className="guide-live-example" aria-label="Silent simulated practice example">
<PracticeRun prefix="example-"/>
<PracticeReview prefix="example-"/>
<SequenceRun prefix="example-"/>
<SequenceReview prefix="example-"/>
</div>
<figcaption><span>Silent example · 1× timing</span><button onClick={()=>onAction?.('practiceGuidePlayBtn')} id="practiceGuidePlayBtn" className="guide-play" type="button" aria-pressed="false">Play example</button></figcaption></figure>
</>}
<p id="practiceGuideExampleNote" className="guide-example-note">{texts?.practiceGuideExampleNote}</p>
<section className="guide-card"><h3>What it measures</h3><p id="practiceGuideMeasures">{texts?.practiceGuideMeasures}</p></section>
<section className="guide-how"><h3>How it works</h3><ol id="practiceGuideSteps">{steps}</ol></section>
<section className="guide-note"><h3>Good to know</h3><p id="practiceGuideExpect">{texts?.practiceGuideExpect}</p></section>
<p className="guide-ready"><strong>Before you start</strong><span id="practiceGuideRequires">{texts?.practiceGuideRequires}</span> Verify unloaded, remove live ammunition and use a safe direction and backstop.</p>
<button onClick={()=>onAction?.('practiceGuideReturnBtn')} id="practiceGuideReturnBtn" type="button" className="button primary wide-action">Back to setup</button>
<p className="guide-disclosure">The app measures detected sounds. It cannot verify unloaded status, aim or safe handling.</p>

</>;}
