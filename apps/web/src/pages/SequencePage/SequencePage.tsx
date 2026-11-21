import {PreferenceToggle} from '@dryfire/ui/PreferenceToggle';
import {GunContext} from '@dryfire/ui/GunContext';
import {DrillSetup,DrillSetupField,DrillSetupDelayMode,DrillSetupDelayRange,DrillSetupCount,DrillSetupSteps,DrillGuideLink,DrillStartSoundTest} from '@dryfire/ui/DrillSetup';
import type {ReactNode} from 'react';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {SequenceRun} from '@dryfire/ui/SequenceRun';
import {SequenceReview} from '@dryfire/ui/SequenceReview';
import {useLocaleMessages} from '../../localization/runtime.ts';
import {sessionUiLabels} from '../../app/sessionUiLabels.ts';
export type SequencePageProps={gunName?:string;contextHidden?:boolean;guideHidden?:boolean;guideHref?:string;configure?:ReactNode;run?:ReactNode;review?:ReactNode;steps?:ReactNode;presetName?:string;onBack?:()=>void;onGuide?:React.MouseEventHandler<HTMLAnchorElement>;onAction?:(id:string)=>void};
/** Shared parent source; native configuration and child-root lifetimes may be retained explicitly. */
export function SequencePage({gunName,contextHidden=false,guideHidden=false,guideHref,configure,run,review,steps,presetName,onBack,onGuide,onAction}:SequencePageProps){const {t}=useLocaleMessages('sequence');const {t:common}=useLocaleMessages('common');const labels=sessionUiLabels(common);return <>
<PageHeading id="session-title" title={t('page.title')} backId="sessionBackBtn" backLabel={t('back')} sharedBack={false} reactBack={false} onBack={onBack}/>

      <GunContext name={gunName} hidden={contextHidden} prefix={t('gunContext.prefix')} suffix={t('gunContext.suffix')}/>
      <p id="sessionPresetName" className="session-preset-name">{presetName}</p>
      <DrillSetupSteps id="sessionSteps" label={t('steps.label')}>{steps}</DrillSetupSteps>
      <DrillGuideLink id="sessionGuideLink" href={guideHref} hidden={guideHidden} onClick={onGuide} label={t('guideLink')}/>

      {configure??<>
      <div id="sessionConfigure">
        <DrillSetup prefix="session" legend={t('setup.legend')} footer={<><p id="sessionReadiness" className="session-readiness" role="status">{t('setup.checkingReadiness')}</p>
          <button onClick={()=>onAction?.('sessionLearnBtn')} id="sessionLearnBtn" type="button" className="button secondary wide-action hidden">{t('learnMissing')}</button>
          <button id="sessionStartBtn" type="submit" className="button primary wide-action">{t('setup.start')}</button></>}>
            <DrillSetupCount inputId="sessionRepetitions" label={<span>{t('setup.repetitions')}</span>}>{'{{sessionRepetitionsInput}}'}</DrillSetupCount>
            <div className="session-delay-card">
              <DrillSetupDelayMode inputId="sessionDelayMode" modes={['fixed','random']} name="delayMode" label={t('setup.delayMode')} fixed={t('setup.fixed')} random={t('setup.random')}/>
              <div id="fixedDelayFields"><DrillSetupField inputId="sessionFixedDelay" label={t('setup.delaySeconds')}>{'{{sessionFixedDelayInput}}'}</DrillSetupField></div>
              <DrillSetupDelayRange id="randomDelayFields" prefix="session" hidden minimumLabel={t('setup.minimumSeconds')} maximumLabel={t('setup.maximumSeconds')} minimum={'{{sessionMinDelayInput}}'} maximum={'{{sessionMaxDelayInput}}'}/>
              <p className="muted small">{t('setup.freshDelay')}</p>
            </div>
            <PreferenceToggle id="sessionStartSound" label={t('setup.soundAtStart')} description={t('setup.sequenceBeepDescription')} className="session-sound-toggle" name="startSound" aria-describedby="sessionCueGuardNote"/>
            <DrillStartSoundTest id="sessionTestStartSound" onClick={()=>onAction?.('sessionTestStartSound')} label={t('setup.testStartSound')} hint={t('setup.mediaVolumeHint')}/>
            <p id="sessionCueGuardNote" className="muted small hidden">{t('setup.cueGuardNote')}</p>
        </DrillSetup>
        <p className="muted small session-timing-note">{t('timingNote')}</p>
      </div>

</>}
{run??<SequenceRun labels={labels}/>}
{review??<SequenceReview labels={{...labels,reviewTitle:labels.sessionReview}}/>}

</>;}
