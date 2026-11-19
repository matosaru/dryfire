import {GunContext} from '@dryfire/ui/GunContext';
import {PageHeading} from '@dryfire/ui/PageHeading';
import type {ReactNode} from 'react';
import {DrillCard,type DrillCardProps} from '@dryfire/ui/DrillCard';
import {useLocaleMessages} from '../../localization/runtime.ts';
export type DrillsPageProps={practice?:ReactNode;editor?:ReactNode;builtIns?:DrillCardProps[];customs?:DrillCardProps[];sequenceDescription?:string;emptyCustom?:boolean;gunName?:string;contextHidden?:boolean;collectionHidden?:boolean;customTabHidden?:boolean;customSelected?:boolean;createHidden?:boolean;onBack?:()=>void;onCollection?:(custom:boolean)=>void;onCreate?:()=>void};
export function DrillsPage({practice,editor,builtIns=[],customs=[],sequenceDescription,emptyCustom=false,gunName,contextHidden=false,collectionHidden=false,customTabHidden=false,customSelected=false,createHidden=true,onBack,onCollection,onCreate}:DrillsPageProps){const {t}=useLocaleMessages('drills');return <>
<PageHeading id="drills-title" title={t('page.title')} eyebrow={t('page.eyebrow')} reactBack={false} onBack={onBack}/>
      <GunContext name={gunName} hidden={contextHidden} prefix={t('gunContext.prefix')} suffix={t('gunContext.suffix')}/>
      <h3>{t('triggerGroup.title')}</h3><p className="muted">{t('triggerGroup.description')}</p>
      {practice}
      <h3 className="practice-section-title">{t('sequenceGroup.title')}</h3><p id="sequenceDescription" className="muted small">{sequenceDescription??t('sequenceGroup.description')}</p>
      <div className={collectionHidden?"segmented-control hidden":"segmented-control"} role="group" aria-label={t('collection.label')}><button id="builtInDrillsTab" onClick={()=>onCollection?.(false)} type="button" aria-pressed={!customSelected} aria-controls="drillCatalog">{t('collection.builtIn')}</button><button id="customDrillsTab" className={customTabHidden?"hidden":undefined} onClick={()=>onCollection?.(true)} type="button" aria-pressed={customSelected} aria-controls="customDrillCatalog">{t('collection.custom')}</button></div>
      <div id="drillCatalog" className={customSelected?"drill-catalog hidden":"drill-catalog"}>{builtIns.map(card=><DrillCard key={card.drill.id} {...card}/>)}</div>
      <button id="newCustomDrillBtn" onClick={onCreate} type="button" className={createHidden?"button secondary wide-action hidden":"button secondary wide-action"}>{t('custom.create')}</button>
      <div id="customDrillCatalog" className={customSelected?"drill-catalog":"drill-catalog hidden"}>{customs.map(card=><DrillCard key={card.drill.id} {...card}/>)}{emptyCustom?<p className="empty-state">{t('custom.empty')}</p>:null}</div>
      {editor}
</>;}
