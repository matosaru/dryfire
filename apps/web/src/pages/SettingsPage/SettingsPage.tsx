import {PreferenceToggle} from '@dryfire/ui/PreferenceToggle';
import {SettingsAction} from '../../features/settings/components/SettingsAction/index.ts';
import {GunContext} from '@dryfire/ui/GunContext';
import {SettingsSection} from '../../features/settings/components/SettingsSection/index.ts';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {useLocaleMessages} from '../../localization/runtime.ts';
import type {ReactNode,ChangeEventHandler} from 'react';
export type SettingsState={gunName?:string;language?:'en'|'de'|'nl';contextHidden?:boolean;installationOpen?:boolean;texts?:Record<string,string>;disabled?:Record<string,boolean>};
export type SettingsPageProps={state?:SettingsState;fileInput?:ReactNode;preview?:ReactNode;onBack?:()=>void;onAction?:(id:string)=>void;onPreference?:(id:string,value:string|boolean)=>void;onImport?:ChangeEventHandler<HTMLInputElement>};
/** Shared source for Settings; persistence/capabilities/preview lifetimes remain feature-owned. */
export function SettingsPage({state,fileInput,preview,onBack,onAction,onPreference,onImport}:SettingsPageProps){const {locale,t}=useLocaleMessages('settings');return <><PageHeading id="settings-title" title={t('page.title')} eyebrow={t('page.eyebrow')} reactBack={false} onBack={onBack}/>
      {preview}
      <GunContext name={state?.gunName} hidden={state?.contextHidden} prefix={t('gunContext.prefix')} suffix={t('gunContext.suffix')}/>
      <details className="install-details" open={state?.installationOpen}><summary>{t('installation.summary')} <span>›</span></summary><div className="install-card">
        <div className="install-badge">{t('installation.badge')}</div>
        <h3>{t('installation.title')}</h3>
        <p id="installStatus" className="muted">{state?.texts?.installStatus??t('installation.checking')}</p>
        <ol><li>{t('installation.stepOneBefore')}<strong>{t('installation.safari')}</strong>.</li><li>{t('installation.stepTwoBefore')}<strong>{t('installation.share')}</strong>{t('installation.stepTwoAfter')}</li><li>{t('installation.stepThreeBefore')} <strong>{t('installation.addToHome')}</strong>{t('installation.stepThreeAfter')}</li><li>{t('installation.stepFourBefore')} <strong>{t('installation.openAsWebApp')}</strong>{t('installation.stepFourMiddle')}<strong>{t('installation.add')}</strong>{t('installation.stepFourAfter')}</li></ol>
        <p className="small muted">{t('installation.disclaimer')}</p>
      </div>
      </details><SettingsSection title={t('learnedSounds.title')}>
        <p className="muted small">{t('learnedSounds.description')}</p>
        <p id="soundResetSummary" className="muted small" role="status">{state?.texts?.soundResetSummary}</p>
        <SettingsAction id="resetModelBtn" label={t('learnedSounds.reset')} icon="⏻" disabled={state?.disabled?.resetModelBtn} onAction={onAction} className="button danger"/>
        <p id="soundResetOutcome" className="small" role="status">{state?.texts?.soundResetOutcome}</p>
      </SettingsSection>
      <SettingsSection title={t('backup.title')}>
        <p className="muted small">{t('backup.description')}</p>
        <div className="settings-actions"><SettingsAction id="exportBtn" label={t('backup.export')} icon="↑" disabled={state?.disabled?.exportBtn} onAction={onAction} className="button secondary"/><SettingsAction id="importBtn" label={t('backup.import')} icon="↓" disabled={state?.disabled?.importBtn} onAction={onAction} className="button secondary"/>{fileInput??<input id="importFile" onChange={onImport} type="file" accept="application/json,.json" className="hidden" />}</div>
        <p className="small muted">{t('backup.importNote')}</p>
      </SettingsSection>
      <SettingsSection title={t('audio.title')} className="preference-group">
        <PreferenceToggle id="noiseFilter" label={t('audio.noiseFilter')} description={state?.texts?.noiseFilterStatus??t('audio.checking')} descriptionId="noiseFilterStatus" descriptionRole="status" onChange={event=>onPreference?.('noiseFilter',event.currentTarget.checked)}/>
        <PreferenceToggle id="autoGainControl" label={t('audio.autoGain')} description={state?.texts?.autoGainStatus??t('audio.checking')} descriptionId="autoGainStatus" descriptionRole="status" onChange={event=>onPreference?.('autoGainControl',event.currentTarget.checked)}/>
        <p className="muted small">{t('audio.note')}</p>
      </SettingsSection>
      <SettingsSection title={t('preferences.title')} className="preference-group">
        <label className="preference-select" htmlFor="appearance"><span>{t('preferences.appearance')}</span><select id="appearance" onChange={event=>onPreference?.('appearance',event.currentTarget.value)}><option value="dark">{t('preferences.dark')}</option><option value="light">{t('preferences.light')}</option><option value="system">{t('preferences.system')}</option></select></label>
        <label className="preference-select" htmlFor="measurementSystem"><span>{t('preferences.units')}</span><select id="measurementSystem" onChange={event=>onPreference?.('measurementSystem',event.currentTarget.value)}><option value="metric">{t('preferences.metric')}</option><option value="imperial">{t('preferences.imperial')}</option></select></label>
        <label className="preference-select" htmlFor="language"><span>{t('language.label')}</span><select id="language" value={state?.language??locale} aria-describedby="languageHelp" onChange={event=>onPreference?.('language',event.currentTarget.value)}><option value="en">{t('language.english')}</option><option value="de">{t('language.german')}</option><option value="nl">{t('language.dutch')}</option></select></label>
        <p id="languageHelp" className="muted small">{t('language.description')}</p>
        <PreferenceToggle id="vibrationFeedback" label={t('preferences.vibration')} description={state?.texts?.vibrationStatus??t('audio.checking')} descriptionId="vibrationStatus" descriptionRole="status" onChange={event=>onPreference?.('vibrationFeedback',event.currentTarget.checked)}/>
        <p className="muted small">{t('preferences.vibrationNote')}</p>
      </SettingsSection>
      <SettingsSection title={t('deleteData.title')}><p className="muted small">{t('deleteData.description')}</p><button id="resetLibraryBtn" disabled={state?.disabled?.resetLibraryBtn} onClick={()=>onAction?.('resetLibraryBtn')} className="button danger wide-action" type="button">{t('deleteData.action')}</button></SettingsSection>
      <SettingsSection title={t('device.title')}><p id="deviceCheck" className="small muted">{state?.texts?.deviceCheck}</p></SettingsSection>
</>;}
