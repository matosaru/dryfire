import type {ReactNode,ChangeEventHandler} from 'react';
export type SettingsPageProps={preview?:ReactNode;onBack?:()=>void;onAction?:(id:string)=>void;onPreference?:(id:string,value:string|boolean)=>void;onImport?:ChangeEventHandler<HTMLInputElement>};
/** Shared source for Settings; persistence/capabilities/preview lifetimes remain feature-owned. */
export function SettingsPage({preview,onBack,onAction,onPreference,onImport}:SettingsPageProps){return <><div className="section-head"><button type="button" className="back-button" data-back="" onClick={onBack} aria-label="Back to previous screen">‹</button><div><p className="eyebrow">05 / DEVICE &amp; PRIVACY</p><h2 id="settings-title">Settings</h2></div></div>
      {preview}
      <p className="gun-context">Sound resets affect <strong className="gun-context-name"></strong> only.</p>
      <details className="install-details"><summary>Install on your iPhone <span>›</span></summary><div className="install-card">
        <div className="install-badge">iOS · HOME SCREEN</div>
        <h3>Install on your iPhone</h3>
        <p id="installStatus" className="muted">Checking installation status…</p>
        <ol><li>Open your deployed HTTPS address in <strong>Safari</strong>.</li><li>Tap the <strong>Share</strong> button.</li><li>Choose <strong>Add to Home Screen</strong>.</li><li>Enable <strong>Open as Web App</strong> (if shown), then tap <strong>Add</strong>.</li></ol>
        <p className="small muted">This installs a web app icon and standalone experience, not an App Store IPA. The microphone runs only when the app is open.</p>
      </div>
      </details><div className="settings-group">
        <h3>Learned Sounds</h3>
        <p className="muted small">For one sound, use Reset on its card in Learn. Full reset erases this gun's learned sounds and reset/noise/beep calibration. Its saved results and other guns' data stay intact.</p>
        <p id="soundResetSummary" className="muted small" role="status"></p>
        <button id="resetModelBtn" onClick={()=>onAction?.('resetModelBtn')} className="button danger" type="button"><span className="settings-action-icon" aria-hidden="true">⏻</span><span>Reset all sounds for this gun</span><span className="settings-chevron" aria-hidden="true">›</span></button>
        <p id="soundResetOutcome" className="small" role="status"></p>
      </div>
      <div className="settings-group">
        <h3>Backup &amp; Data</h3>
        <p className="muted small">Export all gun profiles, learned numeric sound features, drill presets, recognition history, saved sessions and preferences. The backup contains no raw recordings. Keep this file private.</p>
        <div className="settings-actions"><button id="exportBtn" onClick={()=>onAction?.('exportBtn')} className="button secondary" type="button"><span className="settings-action-icon" aria-hidden="true">↑</span><span>Export backup</span><span className="settings-chevron" aria-hidden="true">›</span></button><button id="importBtn" onClick={()=>onAction?.('importBtn')} className="button secondary" type="button"><span className="settings-action-icon" aria-hidden="true">↓</span><span>Import backup</span><span className="settings-chevron" aria-hidden="true">›</span></button><input id="importFile" onChange={onImport} type="file" accept="application/json,.json" className="hidden" /></div>
        <p className="small muted">Import replaces saved guns, sounds, history, presets, sessions and preferences on this device. Older backups contain no saved sessions. Files from another device may perform differently.</p>
      </div>
      <div className="settings-group preference-group">
        <h3>Audio processing · this gun</h3>
        <label className="preference-toggle" htmlFor="noiseFilter"><span><strong>Noise Filter</strong><small id="noiseFilterStatus" role="status">Checking browser support…</small></span><input id="noiseFilter" onChange={event=>onPreference?.('noiseFilter',event.currentTarget.checked)} type="checkbox" role="switch" aria-describedby="noiseFilterStatus" /></label>
        <label className="preference-toggle" htmlFor="autoGainControl"><span><strong>Auto Gain</strong><small id="autoGainStatus" role="status">Checking browser support…</small></span><input id="autoGainControl" onChange={event=>onPreference?.('autoGainControl',event.currentTarget.checked)} type="checkbox" role="switch" aria-describedby="autoGainStatus" /></label>
        <p className="muted small">Changes apply to the next capture. Audio processing may affect recognition and require fresh examples; it never deletes your learned sounds.</p>
      </div>
      <div className="settings-group preference-group">
        <h3>Appearance &amp; feedback · this device</h3>
        <label className="preference-select" htmlFor="appearance"><span>Appearance</span><select id="appearance" onChange={event=>onPreference?.('appearance',event.currentTarget.value)}><option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option></select></label>
        <label className="preference-toggle" htmlFor="vibrationFeedback"><span><strong>Vibration Feedback</strong><small id="vibrationStatus" role="status">Checking browser support…</small></span><input id="vibrationFeedback" onChange={event=>onPreference?.('vibrationFeedback',event.currentTarget.checked)} type="checkbox" role="switch" aria-describedby="vibrationStatus" /></label>
        <p className="muted small">When enabled and supported, vibration is requested at GO and repetition completion.</p>
      </div>
      <div className="settings-group"><h3>Delete local app data</h3><p className="muted small">Deletes every saved gun, learned sound, calibration, preset, setting and history on this browser. Export a backup first. This action cannot be undone without a backup.</p><button id="resetLibraryBtn" onClick={()=>onAction?.('resetLibraryBtn')} className="button danger wide-action" type="button">Delete all guns &amp; app data</button></div>
      <div className="settings-group"><h3>Device information</h3><p id="deviceCheck" className="small muted"></p></div>
</>;}
