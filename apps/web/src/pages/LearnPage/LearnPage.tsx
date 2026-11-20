import {GunContext} from '@dryfire/ui/GunContext';
import {PageHeading} from '@dryfire/ui/PageHeading';
import type {ReactNode} from 'react';
import {SoundCard,type SoundCardProps} from '@dryfire/ui/SoundCard';
import {TriggerProfileStatus,type TriggerProfileQuality} from '@dryfire/ui/TriggerProfileStatus';
import {useLocaleMessages} from '../../localization/runtime.ts';
export type LearnPageProps={cards?:SoundCardProps[];locked?:boolean;calibration?:ReactNode;triggerQuality?:TriggerProfileQuality;profileCss?:string;gunName?:string;contextHidden?:boolean;notice?:string;noticeHidden?:boolean;optionalOpen?:boolean;calibrationOpen?:boolean;listenDisabled?:boolean;onBack?:()=>void;onSoundCheck?:()=>void;onTestLearnedSounds?:()=>void};
const emptyQuality:TriggerProfileQuality={status:'needs-samples',sampleCount:0,needed:3,outlierIndexes:[]};
/** Learning presentation; recording, safety, limits and saved features stay feature-owned. */
export function LearnPage({cards=[],locked,calibration,triggerQuality,profileCss,gunName,contextHidden=false,notice,noticeHidden=true,optionalOpen,calibrationOpen,listenDisabled=false,onBack,onSoundCheck,onTestLearnedSounds}:LearnPageProps){const {t}=useLocaleMessages('learn');const quality=triggerQuality??emptyQuality;const localizedQuality={...quality,title:t(`profile.${quality.status==='needs-samples'?'needsSamples':quality.status==='variable'?'variable':'stable'}`),message:quality.status==='needs-samples'?t(quality.needed===1?'profile.oneSample':'profile.needsSamplesMessage',{count:quality.needed}):t(quality.status==='variable'?'profile.variableMessage':'profile.stableMessage')};const soundCardMessages={sampleProgress:(count:number,maximum:number,summary:string)=>t('soundCard.progress',{count,maximum,summary}),imageAlt:(sound:string)=>t('soundCard.imageAlt',{sound}),record:(sound:string)=>t('soundCard.record',{sound}),train:t('soundCard.train'),sampleLimit:t('soundCard.sampleLimit'),replace:(sound:string)=>t('soundCard.replace',{sound}),reset:(sound:string)=>t('soundCard.reset',{sound}),recognize:(sound:string)=>t('soundCard.recognize',{sound}),recognizeLabel:t('soundCard.recognizeLabel'),primary:t('soundCard.primary'),optional:t('soundCard.optional'),limitReached:t('soundCard.limitReached'),recommendedReached:t('soundCard.recommendedReached'),ready:t('soundCard.ready'),minimumRemaining:(count:number)=>t('soundCard.minimumRemaining',{count}),replaceLabel:t('soundCard.replaceLabel'),resetLabel:t('soundCard.resetLabel')};return <>
{profileCss?<style data-trigger-profile="">{profileCss}</style>:null}
<PageHeading id="learn-title" title={t('page.title')} eyebrow={t('page.eyebrow')} reactBack={false} onBack={onBack}/>
      <GunContext name={gunName} hidden={contextHidden} prefix={t('gunContext.prefix')} suffix={t('gunContext.suffix')}/>
      <p className="muted">{t('intro.before')} <strong>{t('intro.emphasis')}</strong> {t('intro.after')}</p>
      <div id="modelNotice" className={noticeHidden?"info-note hidden":"info-note"} role="status">{notice}</div>
      <div id="classCards" className="class-grid">{cards.filter(card=>!card.optional).map(card=><SoundCard key={card.label} {...card} messages={soundCardMessages} locked={locked??card.locked}/>)}</div>
      <TriggerProfileStatus quality={localizedQuality} eyebrow={t('profile.eyebrow')} title={localizedQuality.title} message={localizedQuality.message} action={t('profile.soundCheck')} disabled={locked} onSoundCheck={onSoundCheck}/>
      <section className="listen-panel"><h3>{t('recognition.title')}</h3><p className="muted small">{t('recognition.description')}</p><button id="learnListenBtn" className="button secondary" type="button" disabled={listenDisabled} onClick={onTestLearnedSounds}>{t('recognition.action')}</button></section>
      <details className="optional-sounds" open={optionalOpen}><summary>{t('optional.title')} <span>{t('optional.summary')}</span></summary><div id="optionalClassCards" className="class-grid">{cards.filter(card=>card.optional).map(card=><SoundCard key={card.label} {...card} messages={soundCardMessages} locked={locked??card.locked}/>)}</div></details>
      <details className="optional-sounds" open={calibrationOpen}><summary>{t('calibration.title')} <span>{t('calibration.summary')}</span></summary><p className="muted small">{t('calibration.description')}</p>{calibration}</details>
      <p className="muted small">{t('privacy.note')}</p>
      <div className="tip"><strong>{t('recordingTip.label')}</strong> {t('recordingTip.description')}</div>
</>;}
