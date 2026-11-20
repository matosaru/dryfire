import {GunContext} from '@dryfire/ui/GunContext';
import {PageHeading} from '@dryfire/ui/PageHeading';
import type {ReactNode} from 'react';
import {DrillCard,type DrillCardProps} from '@dryfire/ui/DrillCard';
import {PracticeCatalog} from '@dryfire/ui/PracticeCatalog';
import {useLocaleMessages} from '../../localization/runtime.ts';
// @ts-expect-error Product drill definitions remain shared JavaScript.
import {PRACTICE_MODES} from '../../../../../src/practiceModes.js';
type PracticeModeDefinition={id:string};
type DrillCardData=Omit<DrillCardProps,'startLabel'|'editLabel'|'description'> & {description?:string};
export type DrillsPageProps={practice?:ReactNode;editor?:ReactNode;builtIns?:DrillCardData[];customs?:DrillCardData[];sequenceFull?:boolean;emptyCustom?:boolean;gunName?:string;contextHidden?:boolean;collectionHidden?:boolean;customTabHidden?:boolean;customSelected?:boolean;createHidden?:boolean;practiceDisabled?:boolean;onBack?:()=>void;onCollection?:(custom:boolean)=>void;onCreate?:()=>void;onPractice?:(mode:string)=>void};
export function DrillsPage({practice,editor,builtIns=[],customs=[],sequenceFull=false,emptyCustom=false,gunName,contextHidden=false,collectionHidden=false,customTabHidden=false,customSelected=false,createHidden=true,practiceDisabled=false,onBack,onCollection,onCreate,onPractice}:DrillsPageProps){const {t,locale}=useLocaleMessages('drills');const {t:guide}=useLocaleMessages('practice-guide');const cardLabels={startLabel:t('cards.start'),editLabel:t('custom.edit')};const modes=(PRACTICE_MODES as PracticeModeDefinition[]).map(mode=>({id:mode.id,title:guide(`manuals.${mode.id}.title`),description:t(`modes.${mode.id}Description`)}));const practiceCatalog=practice??<PracticeCatalog modes={modes} disabled={practiceDisabled} startLabel={cardLabels.startLabel} onSelect={onPractice}/>;const builtInTitleKeys:Record<string,string>={'rack-trigger':'rack','mag-trigger':'magazine','draw-mag-trigger':'drawMagazine'};const sequenceCard=(card:DrillCardData)=>{const titleKey=builtInTitleKeys[card.drill.id];const drill=titleKey?{...card.drill,title:t(`cards.builtInTitles.${titleKey}`)}:card.drill;return <DrillCard key={drill.id} {...card} drill={drill} {...cardLabels} description={card.description??(drill.steps.length===1?t('cards.singleSound'):t('cards.sequence',{count:new Intl.NumberFormat(locale).format(drill.steps.length)}))}/>};return <>
<PageHeading id="drills-title" title={t('page.title')} eyebrow={t('page.eyebrow')} reactBack={false} onBack={onBack}/>
      <GunContext name={gunName} hidden={contextHidden} prefix={t('gunContext.prefix')} suffix={t('gunContext.suffix')}/>
      <h3>{t('triggerGroup.title')}</h3><p className="muted">{t('triggerGroup.description')}</p>
      {practiceCatalog}
      <h3 className="practice-section-title">{t('sequenceGroup.title')}</h3><p id="sequenceDescription" className="muted small">{t(sequenceFull?'sequenceGroup.descriptionFull':'sequenceGroup.description')}</p>
      <div className={collectionHidden?"segmented-control hidden":"segmented-control"} role="group" aria-label={t('collection.label')}><button id="builtInDrillsTab" onClick={()=>onCollection?.(false)} type="button" aria-pressed={!customSelected} aria-controls="drillCatalog">{t('collection.builtIn')}</button><button id="customDrillsTab" className={customTabHidden?"hidden":undefined} onClick={()=>onCollection?.(true)} type="button" aria-pressed={customSelected} aria-controls="customDrillCatalog">{t('collection.custom')}</button></div>
      <div id="drillCatalog" className={customSelected?"drill-catalog hidden":"drill-catalog"}>{builtIns.map(sequenceCard)}</div>
      <button id="newCustomDrillBtn" onClick={onCreate} type="button" className={createHidden?"button secondary wide-action hidden":"button secondary wide-action"}>{t('custom.create')}</button>
      <div id="customDrillCatalog" className={customSelected?"drill-catalog":"drill-catalog hidden"}>{customs.map(sequenceCard)}{emptyCustom?<p className="empty-state">{t('custom.empty')}</p>:null}</div>
      {editor}
</>;}
