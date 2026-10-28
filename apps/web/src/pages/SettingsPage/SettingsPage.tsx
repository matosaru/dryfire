import {PreferenceToggle} from '@dryfire/ui/PreferenceToggle';
import {SettingsAction} from '../../features/settings/components/SettingsAction/index.ts';
import {GunContext} from '@dryfire/ui/GunContext';
import {SettingsSection} from '../../features/settings/components/SettingsSection/index.ts';
import {PageHeading} from '@dryfire/ui/PageHeading';
import type {ReactNode,ChangeEventHandler} from 'react';
export type SettingsState={gunName?:string;contextHidden?:boolean;installationOpen?:boolean;texts?:Record<string,string>;disabled?:Record<string,boolean>};
export type SettingsPageProps={state?:SettingsState;fileInput?:ReactNode;preview?:ReactNode;onBack?:()=>void;onAction?:(id:string)=>void;onPreference?:(id:string,value:string|boolean)=>void;onImport?:ChangeEventHandler<HTMLInputElement>};
/** Shared source for Settings; persistence/capabilities/preview lifetimes remain feature-owned. */
export function SettingsPage({state,fileInput,preview,onBack,onAction,onPreference,onImport}:SettingsPageProps){return <><PageHeading id="settings-title" title="Settings" eyebrow="05 / DEVICE & PRIVACY" reactBack={false} onBack={onBack}/>
      {preview}
      <GunContext name={state?.gunName} hidden={state?.contextHidden} prefix="Sound resets affect " suffix=" only."/>
      <details className="install-details" open={state?.installationOpen}><summary>Install on your iPhone <span>›</span></summary><div className="install-card">
        <div className="install-badge">iOS · HOME SCREEN</div>
        <h3>Install on your iPhone</h3>
        <p id="installStatus" className="muted">{state?.texts?.installStatus??"Checking installation status…"}</p>
        <ol><li>Open your deployed HTTPS address in <strong>Safari</strong>.</li><li>Tap the <strong>Share</strong> button.</li><li>Choose <strong>Add to Home Screen</strong>.</li><li>Enable <strong>Open as Web App</strong> (if shown), then tap <strong>Add</strong>.</li></ol>
        <p className="small muted">This installs a web app icon and standalone experience, not an App Store IPA. The microphone runs only when the app is open.</p>
      </div>
      </details><SettingsSection title="Learned Sounds">
        <p className="muted small">For one sound, use Reset on its card in Learn. Full reset erases this gun's learned sounds and reset/noise/beep calibration. Its saved results and other guns' data stay intact.</p>
        <p id="soundResetSummary" className="muted small" role="status">{state?.texts?.soundResetSummary}</p>
        <SettingsAction id="resetModelBtn" label="Reset all sounds for this gun" icon="⏻" disabled={state?.disabled?.resetModelBtn} onAction={onAction} className="button danger"/>
        <p id="soundResetOutcome" className="small" role="status">{state?.texts?.soundResetOutcome}</p>
      </SettingsSection>
      <SettingsSection title="Backup & Data" className="deferred-settings">
        <p className="muted small">Export all gun profiles, learned numeric sound features, drill presets, recognition history, saved sessions and preferences. The backup contains no raw recordings. Keep this file private.</p>
        <div className="settings-actions"><SettingsAction id="exportBtn" label="Export backup" icon="↑" disabled={state?.disabled?.exportBtn} onAction={onAction} className="button secondary"/><SettingsAction id="importBtn" label="Import backup" icon="↓" disabled={state?.disabled?.importBtn} onAction={onAction} className="button secondary"/>{fileInput??<input id="importFile" onChange={onImport} type="file" accept="application/json,.json" className="hidden" />}</div>
        <p className="small muted">Import replaces saved guns, sounds, history, presets, sessions and preferences on this device. Older backups contain no saved sessions. Files from another device may perform differently.</p>
      </SettingsSection>
      <SettingsSection title="Audio processing · this gun" className="preference-group deferred-settings">
        <PreferenceToggle id="noiseFilter" label="Noise Filter" description="Checking browser support…" descriptionId="noiseFilterStatus" descriptionRole="status" onChange={event=>onPreference?.('noiseFilter',event.currentTarget.checked)}/>
        <PreferenceToggle id="autoGainControl" label="Auto Gain" description="Checking browser support…" descriptionId="autoGainStatus" descriptionRole="status" onChange={event=>onPreference?.('autoGainControl',event.currentTarget.checked)}/>
        <p className="muted small">Changes apply to the next capture. Audio processing may affect recognition and require fresh examples; it never deletes your learned sounds.</p>
      </SettingsSection>
      <SettingsSection title="Appearance & feedback · this device" className="preference-group deferred-settings">
        <label className="preference-select" htmlFor="appearance"><span>Appearance</span><select id="appearance" onChange={event=>onPreference?.('appearance',event.currentTarget.value)}><option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option></select></label>
        <PreferenceToggle id="vibrationFeedback" label="Vibration Feedback" description="Checking browser support…" descriptionId="vibrationStatus" descriptionRole="status" onChange={event=>onPreference?.('vibrationFeedback',event.currentTarget.checked)}/>
        <p className="muted small">When enabled and supported, vibration is requested at GO and repetition completion.</p>
      </SettingsSection>
      <SettingsSection title="Delete local app data" className="deferred-settings"><p className="muted small">Deletes every saved gun, learned sound, calibration, preset, setting and history on this browser. Export a backup first. This action cannot be undone without a backup.</p><button id="resetLibraryBtn" disabled={state?.disabled?.resetLibraryBtn} onClick={()=>onAction?.('resetLibraryBtn')} className="button danger wide-action" type="button">Delete all guns &amp; app data</button></SettingsSection>
      <SettingsSection title="Device information" className="deferred-settings"><p id="deviceCheck" className="small muted">{state?.texts?.deviceCheck}</p></SettingsSection>
</>;}
