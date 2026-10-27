import {LiveResultPanel} from '../../features/live-listen/components/LiveResultPanel/index.ts';
import {LiveCapturePanel} from '../../features/live-listen/components/LiveCapturePanel/index.ts';
import {LiveModePanel} from '../../features/live-listen/components/LiveModePanel/index.ts';
import {GunContext} from '@dryfire/ui/GunContext';
import {PageHeading} from '@dryfire/ui/PageHeading';
import type {LiveListenState} from '../../features/live-listen/index.ts';
export type {LiveListenState} from '../../features/live-listen/index.ts';
export type LiveListenPageProps={state?:LiveListenState;onBack?:()=>void;onAction?:(id:string)=>void;onChange?:(id:string)=>void};
/** Live presentation only: microphone, recognition, persistence and timing remain feature-owned. */
export function LiveListenPage({state,onBack,onAction,onChange}:LiveListenPageProps){return <>
<PageHeading id="recognize-title" title="Live Listen" eyebrow="03 / REAL-TIME DETECTION" reactBack={false} onBack={onBack}/>
      <GunContext name={state?.gunName} hidden={state?.contextHidden} prefix="Listening uses the learned sounds of " suffix="."/>
      <LiveModePanel state={state} onAction={onAction} onChange={onChange}/>
<LiveCapturePanel state={state} onAction={onAction} onChange={onChange}/>
<LiveResultPanel state={state} onAction={onAction} onChange={onChange}/>
</>;}
