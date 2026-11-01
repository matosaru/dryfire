import {PreferenceToggle} from '@dryfire/ui/PreferenceToggle';
import {GunContext} from '@dryfire/ui/GunContext';
import {DrillSetup,DrillSetupField,DrillSetupDelayMode,DrillSetupDelayRange,DrillSetupCount,DrillSetupSteps,DrillGuideLink,DrillStartSoundTest} from '@dryfire/ui/DrillSetup';
import type {ReactNode} from 'react';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {PracticeRun} from '@dryfire/ui/PracticeRun';
import {PracticeReview} from '@dryfire/ui/PracticeReview';
export type PracticePageProps={title?:string;gunName?:string;contextHidden?:boolean;guideHidden?:boolean;guideHref?:string;configure?:ReactNode;run?:ReactNode;review?:ReactNode;steps?:ReactNode;presetName?:string;onBack?:()=>void;onGuide?:React.MouseEventHandler<HTMLAnchorElement>;onAction?:(id:string)=>void};
/** Shared parent source; native configuration and child-root lifetimes may be retained explicitly. */
export function PracticePage({title,gunName,contextHidden=false,guideHidden=false,guideHref,configure,run,review,steps,onBack,onGuide,onAction}:PracticePageProps){return <>
<PageHeading id="practice-title" title={title??'Practice'} backId="practiceBackBtn" backLabel="Back to previous screen" sharedBack={false} reactBack={false} onBack={onBack}/>

      <GunContext name={gunName} hidden={contextHidden} prefix="Practice for " suffix="."/>
      <DrillSetupSteps id="practiceSteps" label="Required sounds">{steps}</DrillSetupSteps>
      <DrillGuideLink id="practiceGuideLink" href={guideHref} hidden={guideHidden} onClick={onGuide}/>
      {configure??<>
      <div id="practiceConfigure">
        <DrillSetup prefix="practice" legend="Practice setup" footer={<><p id="practiceCueNote" className="muted small"></p><p id="practiceReadiness" className="session-readiness" role="status"></p><button onClick={()=>onAction?.('practiceLearnBtn')} id="practiceLearnBtn" className="button secondary wide-action hidden" type="button">Learn missing sounds</button><button id="practiceStartBtn" className="button primary wide-action" type="submit">Start Practice</button></>}>
          <DrillSetupCount id="practiceCountRow" inputId="practiceRepetitions" label={<span id="practiceCountLabel">Repetitions</span>}>{'{{practiceRepetitionsInput}}'}</DrillSetupCount>
          <DrillSetupCount id="practiceParRow" inputId="practicePar" label={<span>Par time (seconds)</span>} hidden>{'{{practiceParInput}}'}</DrillSetupCount>
          <div className="session-delay-card"><label className="session-field" htmlFor="practiceStartSource"><span>Start signal</span><select id="practiceStartSource"><option value="app">App signal</option><option value="external">Calibrated external beep</option></select></label></div>
          <div id="practiceAppTiming" className="session-config-fields"><div className="session-delay-card"><DrillSetupDelayMode inputId="practiceDelayMode" modes={['random','fixed']}/>
            <DrillSetupField id="practiceFixedRow" inputId="practiceFixedDelay" label="Delay in seconds" hidden>{'{{practiceFixedDelayInput}}'}</DrillSetupField>
            <DrillSetupDelayRange id="practiceRandomFields" prefix="practice" minimum={'{{practiceMinDelayInput}}'} maximum={'{{practiceMaxDelayInput}}'}/>
          </div>
            <PreferenceToggle id="practiceStartSound" label="Sound at start" description="Play a beep at each repetition start." className="session-sound-toggle" defaultChecked/>
            <DrillStartSoundTest id="practiceTestStartSound" containerId="practiceStartSoundTest" onClick={()=>onAction?.('practiceTestStartSound')}/>
          </div>
        </DrillSetup>
      </div>
</>}
{run??<PracticeRun/>}
{review??<PracticeReview/>}
      <p className="muted small session-timing-note">Timings describe detected audio. The app cannot verify physical actions, aim, movement or unloaded status.</p>

</>;}
