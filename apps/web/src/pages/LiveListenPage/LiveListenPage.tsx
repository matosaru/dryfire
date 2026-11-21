import {LiveResultPanel} from '../../features/live-listen/components/LiveResultPanel/index.ts';
import {LiveCapturePanel} from '../../features/live-listen/components/LiveCapturePanel/index.ts';
import {LiveModePanel} from '../../features/live-listen/components/LiveModePanel/index.ts';
import {GunContext} from '@dryfire/ui/GunContext';
import {PageHeading} from '@dryfire/ui/PageHeading';
import type {LiveListenState} from '../../features/live-listen/index.ts';
import {useLocaleMessages} from '../../localization/runtime.ts';
export type {LiveListenState} from '../../features/live-listen/index.ts';
export type LiveListenPageProps={state?:LiveListenState;onBack?:()=>void;onAction?:(id:string)=>void;onChange?:(id:string)=>void};
/** Live presentation only: microphone, recognition, persistence and timing remain feature-owned. */
export function LiveListenPage({state,onBack,onAction,onChange}:LiveListenPageProps){const {t}=useLocaleMessages('live-listen');const {t:common}=useLocaleMessages('common');const copy={mode:{eyebrow:t('mode.eyebrow'),free:t('mode.free'),badge:t('mode.badge'),training:t('mode.training'),freeOption:t('mode.freeOption'),trigger:t('mode.trigger'),rack:t('mode.rack'),magazine:t('mode.magazine'),draw:t('mode.draw'),explanation:t('mode.explanation'),change:t('mode.change'),steps:t('mode.steps'),completed:t('mode.completed'),outOfOrder:t('mode.outOfOrder'),unknown:t('mode.unknown'),reset:t('mode.reset'),note:t('mode.note')},capture:{ready:t('capture.ready'),single:t('capture.single'),sensitivity:t('capture.sensitivity'),normal:t('capture.normal'),high:t('capture.high'),low:t('capture.low'),meter:t('capture.meter'),continuousNote:t('capture.continuousNote'),timeline:t('capture.timeline'),inactive:t('capture.inactive'),eventCounter:t('capture.eventCounter'),start:t('capture.start'),stop:t('capture.stop')},result:{empty:t('result.empty'),latest:t('result.latest'),noteBefore:t('result.noteBefore'),noteEmphasis:t('result.noteEmphasis'),noteAfter:t('result.noteAfter')},timeline:{actual:t('timeline.actual'),choose:t('timeline.choose'),draw:t('timeline.draw'),rack:t('timeline.rack'),trigger:t('timeline.trigger'),reload:t('timeline.reload'),other:t('timeline.other'),verify:t('timeline.verify'),verificationNote:t('timeline.verificationNote')}};return <>
<PageHeading id="recognize-title" title={t('page.title')} eyebrow={t('page.eyebrow')} backLabel={common('navigation.back')} reactBack={false} onBack={onBack}/>
      <GunContext name={state?.gunName} hidden={state?.contextHidden} prefix={t('gunContext.prefix')} suffix={t('gunContext.suffix')}/>
      <div className="info-note"><strong>{t('intro.title')}</strong> {t('intro.description')}</div>
      <LiveModePanel state={state} copy={copy} onAction={onAction} onChange={onChange}/>
<LiveCapturePanel state={state} copy={copy} onAction={onAction} onChange={onChange}/>
<LiveResultPanel state={state} copy={copy} onAction={onAction} onChange={onChange}/>
</>;}
