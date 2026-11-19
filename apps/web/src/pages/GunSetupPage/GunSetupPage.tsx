import {useState,type FormEventHandler} from 'react';
import {useLocaleMessages} from '../../localization/runtime.ts';
export type GunSetupVariant='first'|'add'|'edit'|'repair';
export type GunSetupPageProps={name?:string;type?:string;title?:string;description?:string;notice?:string;noticeMode?:'limit'|'full';submitLabel?:string;variant?:GunSetupVariant;cancelHidden?:boolean;saving?:boolean;onSubmit?:FormEventHandler<HTMLFormElement>;onCancel?:()=>void;onRestore?:()=>void};
/** Name uses native form state; radio/hidden type share a React state owner. */
export function GunSetupPage({name,type='',title,description,notice,noticeMode='limit',submitLabel,variant,cancelHidden=true,saving=false,onSubmit,onCancel,onRestore}:GunSetupPageProps){
 const {t}=useLocaleMessages('gun-setup'),resolvedVariant=variant??'first';
 const resolvedTitle=variant?t(`page.${resolvedVariant}Title`):title??t('page.firstTitle');
 const resolvedDescription=variant?t(`page.${resolvedVariant}Description`):description??t('page.firstDescription');
 const resolvedSubmit=variant?t(variant==='first'||variant==='add'?'actions.saveFirst':'actions.save'):submitLabel??t('actions.saveFirst');
 const [selectedType,setType]=useState(type);
 return <><div className="gun-page-heading"><h2 id="gunSetupTitle">{resolvedTitle}</h2><p id="gunSetupDescription">{resolvedDescription}</p></div>
      <form id="gunForm" onSubmit={onSubmit} className="gun-form">
        <label htmlFor="gunName">{t('fields.name')}<input id="gunName" defaultValue={name} name="gunName" type="text" required minLength={1} maxLength={80} placeholder={t('fields.namePlaceholder')} autoComplete="off" /></label>
        <input id="gunType" name="gunType" type="hidden" value={selectedType} />
        <fieldset id="gunTypeChoices" className="gun-type-choices"><legend>{t('fields.type')}</legend>
          <label className="gun-type-choice"><img className="gun-type-image" src="/gun-types/handgun.svg" width="96" height="56" alt="" /><span>{t('fields.Handguns')}</span><input type="radio" name="gunTypeChoice" value="Handguns" checked={selectedType==='Handguns'} onChange={()=>setType('Handguns')} required /></label>
          <label className="gun-type-choice"><img className="gun-type-image" src="/gun-types/rifle.svg" width="96" height="56" alt="" /><span>{t('fields.Rifles and Carbines')}</span><input type="radio" name="gunTypeChoice" value="Rifles and Carbines" checked={selectedType==='Rifles and Carbines'} onChange={()=>setType('Rifles and Carbines')} required /></label>
          <label className="gun-type-choice"><img className="gun-type-image" src="/gun-types/shotgun.svg" width="96" height="56" alt="" /><span>{t('fields.Shotguns')}</span><input type="radio" name="gunTypeChoice" value="Shotguns" checked={selectedType==='Shotguns'} onChange={()=>setType('Shotguns')} required /></label>
        </fieldset>
        <p id="gunCapacityNotice" className="muted small">{notice??t(noticeMode==='full'?'notice.full':'notice.limit')}</p>
        <aside className="storage-card"><span className="storage-symbol" aria-hidden="true">▤</span><div><strong>{t('storage.title')}</strong><p>{t('storage.description')}</p></div></aside>
        <button id="saveGunBtn" disabled={saving} className="button primary wide-action" type="submit">{resolvedSubmit}</button>
        <button id="cancelGunSetupBtn" onClick={onCancel} className={`button secondary wide-action${cancelHidden?' hidden':''}`} type="button">{t('actions.cancel')}</button>
      </form>
      <button id="restoreGunBackupBtn" onClick={onRestore} className="text-button wide-action" type="button">{t('actions.restore')}</button>
</>;
}
