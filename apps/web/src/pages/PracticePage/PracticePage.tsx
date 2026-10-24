import {DrillSetup,DrillSetupCount,DrillSetupSteps,DrillGuideLink} from '@dryfire/ui/DrillSetup';
import type {ReactNode} from 'react';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {PracticeRun} from '@dryfire/ui/PracticeRun';
import {PracticeReview} from '@dryfire/ui/PracticeReview';
export type PracticePageProps={title?:string;gunName?:string;contextHidden?:boolean;guideHidden?:boolean;configure?:ReactNode;run?:ReactNode;review?:ReactNode;steps?:ReactNode;presetName?:string;onBack?:()=>void;onGuide?:React.MouseEventHandler<HTMLAnchorElement>;onAction?:(id:string)=>void};
/** Shared parent source; native configuration and child-root lifetimes may be retained explicitly. */
export function PracticePage({title,gunName,contextHidden=false,guideHidden=false,configure,run,review,steps,onBack,onGuide,onAction}:PracticePageProps){return <>
<PageHeading id="practice-title" title={title??'Practice'} backId="practiceBackBtn" backLabel="Back to previous screen" sharedBack={false} reactBack={false} onBack={onBack}/>

      <p className={contextHidden?'gun-context hidden':'gun-context'}>Practice for <strong className="gun-context-name">{gunName}</strong>.</p>
      <DrillSetupSteps id="practiceSteps" label="Required sounds">{steps}</DrillSetupSteps>
      <DrillGuideLink id="practiceGuideLink" hidden={guideHidden} onClick={onGuide}/>
      {configure??<>
      <div id="practiceConfigure">
        <DrillSetup prefix="practice" legend="Practice setup" footer={<><p id="practiceCueNote" className="muted small"></p><p id="practiceReadiness" className="session-readiness" role="status"></p><button onClick={()=>onAction?.('practiceLearnBtn')} id="practiceLearnBtn" className="button secondary wide-action hidden" type="button">Learn missing sounds</button><button id="practiceStartBtn" className="button primary wide-action" type="submit">Start Practice</button></>}>
          <DrillSetupCount id="practiceCountRow" inputId="practiceRepetitions" label={<span id="practiceCountLabel">Repetitions</span>}>{'{{practiceRepetitionsInput}}'}</DrillSetupCount>
          <DrillSetupCount id="practiceParRow" inputId="practicePar" label={<span>Par time (seconds)</span>} hidden>{'{{practiceParInput}}'}</DrillSetupCount>
          <div className="session-delay-card"><label className="session-field" htmlFor="practiceStartSource"><span>Start signal</span><select id="practiceStartSource"><option value="app">App signal</option><option value="external">Calibrated external beep</option></select></label></div>
          <div id="practiceAppTiming" className="session-config-fields"><div className="session-delay-card"><label className="session-field" htmlFor="practiceDelayMode"><span>Start delay</span><select id="practiceDelayMode"><option value="random">Random</option><option value="fixed">Fixed</option></select></label>
            <label id="practiceFixedRow" className="session-field hidden" htmlFor="practiceFixedDelay"><span>Delay in seconds</span>{'{{practiceFixedDelayInput}}'}</label>
            <div id="practiceRandomFields" className="session-delay-range"><label className="session-field" htmlFor="practiceMinDelay"><span>Minimum seconds</span>{'{{practiceMinDelayInput}}'}</label><label className="session-field" htmlFor="practiceMaxDelay"><span>Maximum seconds</span>{'{{practiceMaxDelayInput}}'}</label></div>
          </div>
            <label className="preference-toggle session-sound-toggle" htmlFor="practiceStartSound"><span><strong>Sound at start</strong><small>Play a beep at each repetition start.</small></span><input id="practiceStartSound" type="checkbox" role="switch" defaultChecked /></label>
          </div>
        </DrillSetup>
      </div>
</>}
{run??<PracticeRun/>}
{review??<PracticeReview/>}
      <p className="muted small session-timing-note">Timings describe detected audio. The app cannot verify physical actions, aim, movement or unloaded status.</p>

</>;}
