import {useState,type FormEventHandler} from 'react';
export type GunSetupPageProps={name?:string;type?:string;title?:string;description?:string;notice?:string;submitLabel?:string;cancelHidden?:boolean;saving?:boolean;onSubmit?:FormEventHandler<HTMLFormElement>;onCancel?:()=>void;onRestore?:()=>void};
/** Name uses native form state; radio/hidden type share a React state owner. */
export function GunSetupPage({name,type='',title='Add your first gun',description='Give it a name and choose a type. Its sounds and drills stay separate.',notice='Create up to two gun profiles. Existing saved profiles remain available.',submitLabel='Save Gun & Continue',cancelHidden=true,saving=false,onSubmit,onCancel,onRestore}:GunSetupPageProps){
 const [selectedType,setType]=useState(type);
 return <><div className="gun-page-heading"><h2 id="gunSetupTitle">{title}</h2><p id="gunSetupDescription">{description}</p></div>
      <form id="gunForm" onSubmit={onSubmit} className="gun-form">
        <label htmlFor="gunName">Gun name<input id="gunName" defaultValue={name} name="gunName" type="text" required minLength={1} maxLength={80} placeholder="e.g. My handgun" autoComplete="off" /></label>
        <input id="gunType" name="gunType" type="hidden" value={selectedType} />
        <fieldset id="gunTypeChoices" className="gun-type-choices"><legend>Gun type</legend>
          <label className="gun-type-choice"><img className="gun-type-image" src="/gun-types/handgun.svg" width="96" height="56" alt="" /><span>Handguns</span><input type="radio" name="gunTypeChoice" value="Handguns" checked={selectedType==='Handguns'} onChange={()=>setType('Handguns')} required /></label>
          <label className="gun-type-choice"><img className="gun-type-image" src="/gun-types/rifle.svg" width="96" height="56" alt="" /><span>Rifles and Carbines</span><input type="radio" name="gunTypeChoice" value="Rifles and Carbines" checked={selectedType==='Rifles and Carbines'} onChange={()=>setType('Rifles and Carbines')} required /></label>
          <label className="gun-type-choice"><img className="gun-type-image" src="/gun-types/shotgun.svg" width="96" height="56" alt="" /><span>Shotguns</span><input type="radio" name="gunTypeChoice" value="Shotguns" checked={selectedType==='Shotguns'} onChange={()=>setType('Shotguns')} required /></label>
        </fieldset>
        <p id="gunCapacityNotice" className="muted small">{notice}</p>
        <aside className="storage-card"><span className="storage-symbol" aria-hidden="true">▤</span><div><strong>Saved on this device</strong><p>Gun profiles, learned sounds and drill presets stay here between visits. Use the same app address and browser.</p></div></aside>
        <button id="saveGunBtn" disabled={saving} className="button primary wide-action" type="submit">{submitLabel}</button>
        <button id="cancelGunSetupBtn" onClick={onCancel} className={`button secondary wide-action${cancelHidden?' hidden':''}`} type="button">Cancel</button>
      </form>
      <button id="restoreGunBackupBtn" onClick={onRestore} className="text-button wide-action" type="button">Restore from backup</button>
</>;
}
