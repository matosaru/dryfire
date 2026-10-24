import {DrillSetup,DrillSetupCount,DrillSetupSteps,DrillGuideLink} from '@dryfire/ui/DrillSetup';
import type {ReactNode} from 'react';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {SequenceRun} from '@dryfire/ui/SequenceRun';
import {SequenceReview} from '@dryfire/ui/SequenceReview';
export type SequencePageProps={title?:string;gunName?:string;contextHidden?:boolean;guideHidden?:boolean;configure?:ReactNode;run?:ReactNode;review?:ReactNode;steps?:ReactNode;presetName?:string;onBack?:()=>void;onGuide?:React.MouseEventHandler<HTMLAnchorElement>;onAction?:(id:string)=>void};
/** Shared parent source; native configuration and child-root lifetimes may be retained explicitly. */
export function SequencePage({title,gunName,contextHidden=false,guideHidden=false,configure,run,review,steps,presetName,onBack,onGuide,onAction}:SequencePageProps){return <>
<PageHeading id="session-title" title={title??'Drill Session'} backId="sessionBackBtn" backLabel="Back to previous screen" sharedBack={false} reactBack={false} onBack={onBack}/>

      <p className={contextHidden?'gun-context hidden':'gun-context'}>Session for <strong className="gun-context-name">{gunName}</strong>.</p>
      <p id="sessionPresetName" className="session-preset-name">{presetName}</p>
      <DrillSetupSteps id="sessionSteps" label="Ordered sound sequence">{steps}</DrillSetupSteps>
      <DrillGuideLink id="sessionGuideLink" hidden={guideHidden} onClick={onGuide}/>

      {configure??<>
      <div id="sessionConfigure">
        <DrillSetup prefix="session" legend="Session setup" footer={<><p id="sessionReadiness" className="session-readiness" role="status">Checking training and safety readiness…</p>
          <button onClick={()=>onAction?.('sessionLearnBtn')} id="sessionLearnBtn" type="button" className="button secondary wide-action hidden">Learn missing sounds</button>
          <button id="sessionStartBtn" type="submit" className="button primary wide-action">Start Session</button></>}>
            <DrillSetupCount inputId="sessionRepetitions" label={<span>Repetitions</span>}>{'{{sessionRepetitionsInput}}'}</DrillSetupCount>
            <div className="session-delay-card">
              <label className="session-field" htmlFor="sessionDelayMode"><span>Start delay</span><select id="sessionDelayMode" name="delayMode"><option value="fixed">Fixed</option><option value="random">Random</option></select></label>
              <div id="fixedDelayFields"><label className="session-field" htmlFor="sessionFixedDelay"><span>Delay in seconds</span>{'{{sessionFixedDelayInput}}'}</label></div>
              <div id="randomDelayFields" className="session-delay-range hidden">
                <label className="session-field" htmlFor="sessionMinDelay"><span>Minimum seconds</span>{'{{sessionMinDelayInput}}'}</label>
                <label className="session-field" htmlFor="sessionMaxDelay"><span>Maximum seconds</span>{'{{sessionMaxDelayInput}}'}</label>
              </div>
              <p className="muted small">A fresh delay before every repetition.</p>
            </div>
            <label className="preference-toggle session-sound-toggle" htmlFor="sessionStartSound"><span><strong>Sound at start</strong><small>Play a beep when GO appears.</small></span><input id="sessionStartSound" name="startSound" type="checkbox" role="switch" aria-describedby="sessionCueGuardNote" /></label>
            <p id="sessionCueGuardNote" className="muted small hidden">With the beep on, detection waits 0.3 seconds after GO to exclude the cue. Very fast sounds in that window may be missed.</p>
        </DrillSetup>
        <p className="muted small session-timing-note">Timings describe detected sounds, not verified physical actions.</p>
      </div>

</>}
{run??<SequenceRun/>}
{review??<SequenceReview/>}

</>;}
