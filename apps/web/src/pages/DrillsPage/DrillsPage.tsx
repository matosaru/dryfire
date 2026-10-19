import {PageHeading} from '@dryfire/ui/PageHeading';
import type {ReactNode} from 'react';
import {DrillCard,type DrillCardProps} from '@dryfire/ui/DrillCard';
export type DrillsPageProps={practice?:ReactNode;editor?:ReactNode;builtIns?:DrillCardProps[];customs?:DrillCardProps[];sequenceDescription?:string;emptyCustom?:boolean;gunName?:string;contextHidden?:boolean;collectionHidden?:boolean;customTabHidden?:boolean;customSelected?:boolean;createHidden?:boolean;onBack?:()=>void;onCollection?:(custom:boolean)=>void;onCreate?:()=>void;onFree?:()=>void};
export function DrillsPage({practice,editor,builtIns=[],customs=[],sequenceDescription,emptyCustom=false,gunName,contextHidden=false,collectionHidden=false,customTabHidden=false,customSelected=false,createHidden=true,onBack,onCollection,onCreate,onFree}:DrillsPageProps){return <>
<PageHeading id="drills-title" title="Drills" eyebrow="02 / PRACTICE PRESETS" reactBack={false} onBack={onBack}/>
      <p className={contextHidden?"gun-context hidden":"gun-context"}>Saved presets for <strong className="gun-context-name">{gunName}</strong>.</p>
      <h3>Dry-fire practice</h3><p className="muted">Trigger-based modes need only your trigger samples. Choose a mode, configure it, then start.</p>
      {practice}
      <h3 className="practice-section-title">Sequence drills</h3><p id="sequenceDescription" className="muted small">{sequenceDescription??'Choose a built-in or an existing saved preset. Each requires only the sounds in its sequence.'}</p>
      <div className={collectionHidden?"segmented-control hidden":"segmented-control"} role="group" aria-label="Drill collection"><button id="builtInDrillsTab" onClick={()=>onCollection?.(false)} type="button" aria-pressed={!customSelected} aria-controls="drillCatalog">Built-in Drills</button><button id="customDrillsTab" className={customTabHidden?"hidden":undefined} onClick={()=>onCollection?.(true)} type="button" aria-pressed={customSelected} aria-controls="customDrillCatalog">Custom</button></div>
      <div id="drillCatalog" className={customSelected?"drill-catalog hidden":"drill-catalog"}>{builtIns.map(card=><DrillCard key={card.drill.id} {...card}/>)}</div>
      <button id="newCustomDrillBtn" onClick={onCreate} type="button" className={createHidden?"button secondary wide-action hidden":"button secondary wide-action"}>+ Create Custom Drill</button>
      <div id="customDrillCatalog" className={customSelected?"drill-catalog":"drill-catalog hidden"}>{customs.map(card=><DrillCard key={card.drill.id} {...card}/>)}{emptyCustom?<p className="empty-state">No custom drills for this gun yet. Choose Create Custom Drill to add a sequence.</p>:null}</div>
      {editor}
      <button id="freeListenBtn" onClick={onFree} type="button" className="button secondary wide-action">Start free listening →</button>
</>;}
