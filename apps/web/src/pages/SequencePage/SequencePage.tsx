import {PreferenceToggle} from '@dryfire/ui/PreferenceToggle';
import {GunContext} from '@dryfire/ui/GunContext';
import {DrillSetup,DrillSetupField,DrillSetupDelayMode,DrillSetupDelayRange,DrillSetupCount,DrillSetupSteps,DrillGuideLink} from '@dryfire/ui/DrillSetup';
import type {ReactNode} from 'react';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {SequenceRun} from '@dryfire/ui/SequenceRun';
import {SequenceReview} from '@dryfire/ui/SequenceReview';
export type SequencePageProps={title?:string;gunName?:string;contextHidden?:boolean;guideHidden?:boolean;guideHref?:string;configure?:ReactNode;run?:ReactNode;review?:ReactNode;steps?:ReactNode;presetName?:string;onBack?:()=>void;onGuide?:React.MouseEventHandler<HTMLAnchorElement>;onAction?:(id:string)=>void};
/** Shared parent source; native configuration and child-root lifetimes may be retained explicitly. */
export function SequencePage({title,gunName,contextHidden=false,guideHidden=false,guideHref,configure,run,review,steps,presetName,onBack,onGuide,onAction}:SequencePageProps){return <>
<PageHeading id="session-title" title={title??'Drill Session'} backId="sessionBackBtn" backLabel="Back to previous screen" sharedBack={false} reactBack={false} onBack={onBack}/>

      <GunContext name={gunName} hidden={contextHidden} prefix="Session for " suffix="."/>
      <p id="sessionPresetName" className="session-preset-name">{presetName}</p>
      <DrillSetupSteps id="sessionSteps" label="Ordered sound sequence">{steps}</DrillSetupSteps>
      <DrillGuideLink id="sessionGuideLink" href={guideHref} hidden={guideHidden} onClick={onGuide}/>

      {configure??<>
      <div id="sessionConfigure">
        <DrillSetup prefix="session" legend="Session setup" footer={<><p id="sessionReadiness" className="session-readiness" role="status">Checking training and safety readiness…</p>
          <button onClick={()=>onAction?.('sessionLearnBtn')} id="sessionLearnBtn" type="button" className="button secondary wide-action hidden">Learn missing sounds</button>
          <button id="sessionStartBtn" type="submit" className="button primary wide-action">Start Session</button></>}>
            <DrillSetupCount inputId="sessionRepetitions" label={<span>Repetitions</span>}>{'{{sessionRepetitionsInput}}'}</DrillSetupCount>
            <div className="session-delay-card">
              <DrillSetupDelayMode inputId="sessionDelayMode" modes={['fixed','random']} name="delayMode"/>
              <div id="fixedDelayFields"><DrillSetupField inputId="sessionFixedDelay" label="Delay in seconds">{'{{sessionFixedDelayInput}}'}</DrillSetupField></div>
              <DrillSetupDelayRange id="randomDelayFields" prefix="session" hidden minimum={'{{sessionMinDelayInput}}'} maximum={'{{sessionMaxDelayInput}}'}/>
              <p className="muted small">A fresh delay before every repetition.</p>
            </div>
            <PreferenceToggle id="sessionStartSound" label="Sound at start" description="Play a beep when GO appears." className="session-sound-toggle" name="startSound" aria-describedby="sessionCueGuardNote"/>
            <p id="sessionCueGuardNote" className="muted small hidden">With the beep on, detection waits 0.3 seconds after GO to exclude the cue. Very fast sounds in that window may be missed.</p>
        </DrillSetup>
        <p className="muted small session-timing-note">Timings describe detected sounds, not verified physical actions.</p>
      </div>

</>}
{run??<SequenceRun/>}
{review??<SequenceReview/>}

</>;}
