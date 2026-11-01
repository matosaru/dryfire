import {GunContext} from '@dryfire/ui/GunContext';
import {PageHeading} from '@dryfire/ui/PageHeading';
import type {ReactNode} from 'react';
import {SoundCard,type SoundCardProps} from '@dryfire/ui/SoundCard';
import {TriggerProfileStatus,type TriggerProfileQuality} from '@dryfire/ui/TriggerProfileStatus';
export type LearnPageProps={cards?:SoundCardProps[];locked?:boolean;calibration?:ReactNode;triggerQuality?:TriggerProfileQuality;profileCss?:string;gunName?:string;contextHidden?:boolean;notice?:string;noticeHidden?:boolean;optionalOpen?:boolean;calibrationOpen?:boolean;onBack?:()=>void};
const emptyQuality:TriggerProfileQuality={status:'needs-samples',title:'Needs samples',message:'Record 3 more natural trigger presses.',sampleCount:0,needed:3,outlierIndexes:[]};
/** Learning presentation; recording, safety, limits and saved features stay feature-owned. */
export function LearnPage({cards=[],locked,calibration,triggerQuality,profileCss,gunName,contextHidden=false,notice,noticeHidden=true,optionalOpen,calibrationOpen,onBack}:LearnPageProps){return <>
{profileCss?<style data-trigger-profile="">{profileCss}</style>:null}
<PageHeading id="learn-title" title="Learn Sounds" eyebrow="01 / SOUND PROFILES" reactBack={false} onBack={onBack}/>
      <GunContext name={gunName} hidden={contextHidden} prefix="Learned sounds for " suffix="."/>
      <p className="muted">Start with <strong>3 Trigger pull samples</strong> (8–10 recommended). Other sound types are optional. Each capture gives you a two-second countdown followed by a two-second recording window.</p>
      <div id="modelNotice" className={noticeHidden?"info-note hidden":"info-note"} role="status">{notice}</div>
      <div id="classCards" className="class-grid">{cards.filter(card=>!card.optional).map(card=><SoundCard key={card.label} {...card} locked={locked??card.locked}/>)}</div>
      <TriggerProfileStatus quality={triggerQuality??emptyQuality}/>
      <details className="optional-sounds" open={optionalOpen}><summary>Optional sounds <span>For handling and sequence drills</span></summary><div id="optionalClassCards" className="class-grid">{cards.filter(card=>card.optional).map(card=><SoundCard key={card.label} {...card} locked={locked??card.locked}/>)}</div></details>
      <details className="optional-sounds" open={calibrationOpen}><summary>Improve recognition <span>Reset, noise and external cue calibration</span></summary><p className="muted small">Optional rejection examples help avoid false shot counts. Very similar press/reset clicks can remain ambiguous; verify matches yourself. External-beep practice needs 3 cue samples.</p>{calibration}</details>
      <p className="muted small">The animations are illustrative sound cues, not step-by-step handling demonstrations. Resetting one sound keeps this gun's other sounds and history, and every other gun's data.</p>
      <div className="tip"><strong>Recording tip:</strong> Use the same phone position you will use during practice. Record one natural press at a time in a representative room. Raw audio is not saved—only numeric sound features.</div>
</>;}
