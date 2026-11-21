import {PreferenceToggle} from '@dryfire/ui/PreferenceToggle';
import {GunContext} from '@dryfire/ui/GunContext';
import {DrillSetup,DrillSetupField,DrillSetupDelayMode,DrillSetupDelayRange,DrillSetupCount,DrillSetupSteps,DrillGuideLink,DrillStartSoundTest} from '@dryfire/ui/DrillSetup';
import type {ReactNode} from 'react';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {PracticeRun} from '@dryfire/ui/PracticeRun';
import {PracticeReview} from '@dryfire/ui/PracticeReview';
import {useLocaleMessages} from '../../localization/runtime.ts';
import {sessionUiLabels} from '../../app/sessionUiLabels.ts';
export type PracticePageProps={title?:string;mode?:string;gunName?:string;contextHidden?:boolean;guideHidden?:boolean;guideHref?:string;configure?:ReactNode;run?:ReactNode;review?:ReactNode;steps?:ReactNode;presetName?:string;onBack?:()=>void;onGuide?:React.MouseEventHandler<HTMLAnchorElement>;onAction?:(id:string)=>void};
/** Shared parent source; native configuration and child-root lifetimes may be retained explicitly. */
export function PracticePage({title,mode,gunName,contextHidden=false,guideHidden=false,guideHref,configure,run,review,steps,onBack,onGuide,onAction}:PracticePageProps){const {t}=useLocaleMessages('practice');const {t:common}=useLocaleMessages('common');const labels=sessionUiLabels(common);const pageTitle=mode?t(`modes.${mode}`):title??t('page.title');return <>
<PageHeading id="practice-title" title={pageTitle} backId="practiceBackBtn" backLabel={t('back')} sharedBack={false} reactBack={false} onBack={onBack}/>

      <GunContext name={gunName} hidden={contextHidden} prefix={t('gunContext.prefix')} suffix={t('gunContext.suffix')}/>
      <DrillSetupSteps id="practiceSteps" label={t('steps.label')}>{steps}</DrillSetupSteps>
      <DrillGuideLink id="practiceGuideLink" href={guideHref} hidden={guideHidden} onClick={onGuide} label={t('guideLink')}/>
      {configure??<>
      <div id="practiceConfigure">
        <DrillSetup prefix="practice" legend={t('setup.legend')} footer={<><p id="practiceCueNote" className="muted small"></p><p id="practiceReadiness" className="session-readiness" role="status"></p><button onClick={()=>onAction?.('practiceLearnBtn')} id="practiceLearnBtn" className="button secondary wide-action hidden" type="button">{t('learnMissing')}</button><button id="practiceStartBtn" className="button primary wide-action" type="submit">{t('setup.start')}</button></>}>
          <DrillSetupCount id="practiceCountRow" inputId="practiceRepetitions" label={<span id="practiceCountLabel">{t('setup.repetitions')}</span>}>{'{{practiceRepetitionsInput}}'}</DrillSetupCount>
          <DrillSetupCount id="practiceParRow" inputId="practicePar" label={<span>{t('setup.parTime')}</span>} hidden>{'{{practiceParInput}}'}</DrillSetupCount>
          <div className="session-delay-card"><label className="session-field" htmlFor="practiceStartSource"><span>{t('setup.startSignal')}</span><select id="practiceStartSource"><option value="app">{t('setup.appSignal')}</option><option value="external">{t('setup.externalBeep')}</option></select></label></div>
          <div id="practiceAppTiming" className="session-config-fields"><div className="session-delay-card"><DrillSetupDelayMode inputId="practiceDelayMode" modes={['random','fixed']} label={t('setup.delayMode')} fixed={t('setup.fixed')} random={t('setup.random')}/>
            <DrillSetupField id="practiceFixedRow" inputId="practiceFixedDelay" label={t('setup.delaySeconds')} hidden>{'{{practiceFixedDelayInput}}'}</DrillSetupField>
            <DrillSetupDelayRange id="practiceRandomFields" prefix="practice" minimumLabel={t('setup.minimumSeconds')} maximumLabel={t('setup.maximumSeconds')} minimum={'{{practiceMinDelayInput}}'} maximum={'{{practiceMaxDelayInput}}'}/>
          </div>
            <PreferenceToggle id="practiceStartSound" label={t('setup.soundAtStart')} description={t('setup.practiceBeepDescription')} className="session-sound-toggle" defaultChecked/>
            <DrillStartSoundTest id="practiceTestStartSound" containerId="practiceStartSoundTest" onClick={()=>onAction?.('practiceTestStartSound')} label={t('setup.testStartSound')} hint={t('setup.mediaVolumeHint')}/>
          </div>
        </DrillSetup>
      </div>
</>}
{run??<PracticeRun labels={labels}/>}
{review??<PracticeReview labels={{...labels,reviewTitle:labels.practiceReview}}/>}
      <p className="muted small session-timing-note">{t('timingNote')}</p>

</>;}
