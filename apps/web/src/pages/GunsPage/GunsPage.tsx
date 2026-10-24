export type GunProfile = {id:string;name?:string;type?:string;needsDetails?:boolean};
export type GunLibraryRow = {gun:GunProfile;image:string;triggerReady:boolean;optionalReady:number;samples:number;presets:number};
export type GunsPageProps = {
 rows?:readonly GunLibraryRow[];selectedId?:string;locked?:boolean;full?:boolean;limit?:number;loaded?:boolean;
 onSelect?:(id:string)=>void;onEdit?:(gun:GunProfile)=>void;onDelete?:(gun:GunProfile)=>void;onAdd?:()=>void;onBackup?:()=>void;
};
/** Presentation only: storage, ownership guards and confirmation stay in the feature controller. */
export function GunsPage({rows=[],selectedId,locked=false,full=false,limit=2,loaded=false,onSelect,onEdit,onDelete,onAdd,onBackup}:GunsPageProps){
 const count=rows.length,capacity=loaded?(full?`${count} of 5 guns saved · Saved on this device`:`${count} saved gun${count===1?'':'s'}`):'0 of 5 guns saved';
 return <>
  <div className="gun-library-heading"><h2 id="gunsTitle">My Guns</h2><span id="gunCapacity" className="gun-capacity" aria-live="polite">{capacity}</span></div>
  <p className="muted">Choose a gun to open its own sounds and drills.</p>
  <p id="gunCreationNotice" className={`muted small${!loaded||full?' hidden':''}`}>This public version creates up to two guns. Existing saved profiles are kept.</p>
  <div id="gunList" className="gun-list">{rows.map(row=><article className="gun-profile" key={row.gun.id}>
   <button type="button" className="gun-card" data-gun-id={row.gun.id} disabled={locked} aria-pressed={row.gun.id===selectedId} onClick={()=>onSelect?.(row.gun.id)}>
    <span className="gun-card-head"><img className="gun-type-image" src={row.image} width="96" height="56" alt=""/><span className="gun-card-details"><strong className="gun-card-name">{row.gun.name||'Existing gun — add details'}</strong><span className="gun-card-type">{row.gun.type||'Choose gun type'}</span></span>{row.gun.id===selectedId&&<span className="gun-selected">Selected</span>}</span>
    <span className="gun-card-status"><span className={`gun-readiness${row.triggerReady?' ready':''}`}>{`${row.triggerReady?'Trigger ready':'Learn trigger'} · ${row.optionalReady} optional sounds ready · ${row.samples} samples`}</span><span className="gun-preset-count">{row.presets} custom presets</span></span>
   </button>
   <div className="gun-profile-actions"><button type="button" className="text-button edit-gun" data-edit-gun-id={row.gun.id} aria-label={`Edit ${row.gun.name||'existing gun'}`} disabled={locked} onClick={()=>onEdit?.(row.gun)}>Edit gun</button><button type="button" className="text-button delete-gun" data-delete-gun-id={row.gun.id} aria-label={`Delete ${row.gun.name||'existing gun'}`} disabled={locked} onClick={()=>onDelete?.(row.gun)}>Delete gun</button></div>
  </article>)}</div>
  <button id="addGunBtn" className={`button secondary wide-action add-gun-button${loaded&&!full&&count>=limit?' hidden':''}`} type="button" disabled={locked||count>=limit} onClick={onAdd}>{loaded?(count>=5?'5 of 5 guns saved':'+ Add gun'):<><span aria-hidden="true">+</span> Add Gun</>}</button>
  <aside className="storage-card"><span className="storage-symbol" aria-hidden="true">▤</span><div><strong>Saved on this device</strong><p>Refreshing or updating at this app address keeps your saved data. Export a backup before clearing browser storage.</p><button id="gunLibraryBackupBtn" className="text-button" type="button" onClick={onBackup}>Backup &amp; restore <span aria-hidden="true">›</span></button></div></aside>
 </>;
}
