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
export function LiveListenPage({state,onBack,onAction,onChange}:LiveListenPageProps){const {t}=useLocaleMessages('live-listen');return <>
<PageHeading id="recognize-title" title={t('page.title')} eyebrow={t('page.eyebrow')} reactBack={false} onBack={onBack}/>
      <GunContext name={state?.gunName} hidden={state?.contextHidden} prefix={t('gunContext.prefix')} suffix={t('gunContext.suffix')}/>
      <div className="info-note"><strong>{t('intro.title')}</strong> {t('intro.description')}</div>
      <LiveModePanel state={state} onAction={onAction} onChange={onChange}/>
<LiveCapturePanel state={state} onAction={onAction} onChange={onChange}/>
<LiveResultPanel state={state} onAction={onAction} onChange={onChange}/>
</>;}
