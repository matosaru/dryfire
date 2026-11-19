import {useLocaleMessages} from '../../localization/runtime.ts';
export type GunProfile = {id:string;name?:string;type?:string;needsDetails?:boolean};
export type GunLibraryRow = {gun:GunProfile;image:string;triggerReady:boolean;optionalReady:number;samples:number;presets:number};
export type GunsPageProps = {
 rows?:readonly GunLibraryRow[];selectedId?:string;locked?:boolean;full?:boolean;limit?:number;loaded?:boolean;
 onSelect?:(id:string)=>void;onEdit?:(gun:GunProfile)=>void;onDelete?:(gun:GunProfile)=>void;onAdd?:()=>void;onBackup?:()=>void;
};
/** Presentation only: storage, ownership guards and confirmation stay in the feature controller. */
export function GunsPage({rows=[],selectedId,locked=false,full=false,limit=2,loaded=false,onSelect,onEdit,onDelete,onAdd,onBackup}:GunsPageProps){
 const {t}=useLocaleMessages('guns');
 const count=rows.length,capacity=loaded?(full?t('capacity.full',{count}):t('capacity.saved',{count})):t('capacity.unloaded');
 return <>
  <div className="gun-library-heading"><h2 id="gunsTitle">{t('page.title')}</h2><span id="gunCapacity" className="gun-capacity" aria-live="polite">{capacity}</span></div>
  <p className="muted">{t('page.description')}</p>
  <p id="gunCreationNotice" className={`muted small${!loaded||full?' hidden':''}`}>{t('notice.public')}</p>
  <div id="gunList" className="gun-list">{rows.map(row=><article className="gun-profile" key={row.gun.id}>
    <button type="button" className="gun-card" data-gun-id={row.gun.id} disabled={locked} aria-pressed={row.gun.id===selectedId} onClick={()=>onSelect?.(row.gun.id)}>
    <span className="gun-card-head"><img className="gun-type-image" src={row.image} width="96" height="56" alt=""/><span className="gun-card-details"><strong className="gun-card-name">{row.gun.name||t('profile.existing')}</strong><span className="gun-card-type">{row.gun.type?t(`type.${row.gun.type}`):t('profile.chooseType')}</span></span>{row.gun.id===selectedId&&<span className="gun-selected">{t('profile.selected')}</span>}</span>
    <span className="gun-card-status"><span className={`gun-readiness${row.triggerReady?' ready':''}`}>{`${row.triggerReady?t('profile.triggerReady'):t('profile.learnTrigger')} · ${t('profile.optionalSounds',{count:row.optionalReady})} · ${t('profile.samples',{count:row.samples})}`}</span><span className="gun-preset-count">{t('profile.presets',{count:row.presets})}</span></span>
   </button>
   <div className="gun-profile-actions"><button type="button" className="text-button edit-gun" data-edit-gun-id={row.gun.id} aria-label={t('actions.editNamed',{name:row.gun.name||t('profile.existing')})} disabled={locked} onClick={()=>onEdit?.(row.gun)}>{t('actions.edit')}</button><button type="button" className="text-button delete-gun" data-delete-gun-id={row.gun.id} aria-label={t('actions.deleteNamed',{name:row.gun.name||t('profile.existing')})} disabled={locked} onClick={()=>onDelete?.(row.gun)}>{t('actions.delete')}</button></div>
  </article>)}</div>
  <button id="addGunBtn" className={`button secondary wide-action add-gun-button${loaded&&!full&&count>=limit?' hidden':''}`} type="button" disabled={locked||count>=limit} onClick={onAdd}>{loaded?(count>=5?t('capacity.maximum'):`+ ${t('actions.add')}`):<><span aria-hidden="true">{t('actions.addSymbol')}</span> {t('actions.addTitle')}</>}</button>
  <aside className="storage-card"><span className="storage-symbol" aria-hidden="true">▤</span><div><strong>{t('storage.title')}</strong><p>{t('storage.description')}</p><button id="gunLibraryBackupBtn" className="text-button" type="button" onClick={onBackup}>{t('storage.backup')} <span aria-hidden="true">›</span></button></div></aside>
 </>;
}
