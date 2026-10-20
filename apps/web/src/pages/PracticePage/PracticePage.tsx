import type {ReactNode} from 'react';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {PracticeRun} from '@dryfire/ui/PracticeRun';
import {PracticeReview} from '@dryfire/ui/PracticeReview';
export type PracticePageProps={title?:string;gunName?:string;contextHidden?:boolean;guideHidden?:boolean;configure?:ReactNode;run?:ReactNode;review?:ReactNode;steps?:ReactNode;presetName?:string;onBack?:()=>void;onGuide?:React.MouseEventHandler<HTMLAnchorElement>;onAction?:(id:string)=>void};
/** Shared parent source; native configuration and child-root lifetimes may be retained explicitly. */
export function PracticePage({title,gunName,contextHidden=false,guideHidden=false,configure,run,review,steps,onBack,onGuide,onAction}:PracticePageProps){return <>
<PageHeading id="practice-title" title={title??'Practice'} backId="practiceBackBtn" backLabel="Back to previous screen" sharedBack={false} reactBack={false} onBack={onBack}/>
<a onClick={onGuide} id="practiceGuideLink" className={guideHidden?'practice-guide-link hidden':'practice-guide-link'} href="#practice-guide">About this practice <span aria-hidden="true">›</span></a>
      <p className={contextHidden?'gun-context hidden':'gun-context'}>Practice for <strong className="gun-context-name">{gunName}</strong>.</p>
      <div id="practiceSteps" className="preset-steps" aria-label="Required sounds">{steps}</div>
      {configure??<>
      <div id="practiceConfigure">
        <form id="practiceConfigForm" className="session-config-form"><fieldset id="practiceConfigFields" className="session-config-fields"><legend>Practice setup</legend>
          <label id="practiceCountRow" className="session-field" htmlFor="practiceRepetitions"><span id="practiceCountLabel">Repetitions</span>{'{{practiceRepetitionsInput}}'}</label>
          <label id="practiceDurationRow" className="session-field hidden" htmlFor="practiceDuration"><span>Active seconds</span>{'{{practiceDurationInput}}'}</label>
          <label id="practiceParRow" className="session-field hidden" htmlFor="practicePar"><span>Par time (seconds)</span>{'{{practiceParInput}}'}</label>
          <div id="practiceReloadFields" className="session-delay-card hidden"><label className="session-field" htmlFor="practiceReloadStart"><span>First event</span><select id="practiceReloadStart"><option value="rack">Rack slide</option><option value="reload">Change magazine</option><option value="draw">Draw from holster</option><option value="trigger">Trigger pull</option></select></label><label className="session-field" htmlFor="practiceReloadEnd"><span>Second event</span><select id="practiceReloadEnd"><option value="reload">Change magazine</option><option value="rack">Rack slide</option><option value="draw">Draw from holster</option><option value="trigger">Trigger pull</option></select></label></div>
          <label className="session-field" htmlFor="practiceStartSource"><span>Start signal</span><select id="practiceStartSource"><option value="app">App signal</option><option value="external">Calibrated external beep</option></select></label>
          <div id="practiceAppTiming" className="session-delay-card"><label className="session-field" htmlFor="practiceDelayMode"><span>Ready delay</span><select id="practiceDelayMode"><option value="random">Random</option><option value="fixed">Fixed</option></select></label>
            <label id="practiceFixedRow" className="session-field hidden" htmlFor="practiceFixedDelay"><span>Delay seconds</span>{'{{practiceFixedDelayInput}}'}</label>
            <div id="practiceRandomFields" className="session-delay-range"><label className="session-field" htmlFor="practiceMinDelay"><span>Minimum seconds</span>{'{{practiceMinDelayInput}}'}</label><label className="session-field" htmlFor="practiceMaxDelay"><span>Maximum seconds</span>{'{{practiceMaxDelayInput}}'}</label></div>
            <label className="preference-toggle" htmlFor="practiceStartSound"><span><strong>Sound at start</strong><small>Play a beep at each repetition start.</small></span><input id="practiceStartSound" type="checkbox" role="switch" defaultChecked /></label>
          </div>
        </fieldset><p id="practiceCueNote" className="muted small"></p><p id="practiceReadiness" className="session-readiness" role="status"></p><button onClick={()=>onAction?.('practiceLearnBtn')} id="practiceLearnBtn" className="button secondary wide-action hidden" type="button">Learn missing sounds</button><button id="practiceStartBtn" className="button primary wide-action" type="submit">Start Practice</button></form>
      </div>
</>}
{run??<PracticeRun/>}
{review??<PracticeReview/>}
      <p className="muted small session-timing-note">Timings describe detected audio. The app cannot verify physical actions, aim, movement or unloaded status.</p>

</>;}
