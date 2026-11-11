import './SoundCheckPage.css';
import {GunContext} from '@dryfire/ui/GunContext';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {distanceHelp,normalizeMeasurementSystem} from '../../../../../src/measurementUnits.js';

export function SoundCheckPage({gunName,measurementSystem='metric'}:{gunName?:string;measurementSystem?:string}){const distance=distanceHelp(normalizeMeasurementSystem(measurementSystem));return <>
 <PageHeading id="soundCheck-title" title="Sound Check" eyebrow="TRIGGER PROFILE CHECK" reactBack={false}/>
 <GunContext name={gunName} prefix="Check the learned trigger profile for " suffix="."/>
 <section id="soundCheckSetup" className="sound-check-card" aria-labelledby="soundCheckSetupTitle">
  <h3 id="soundCheckSetupTitle">Prepare a labelled check</h3>
  <p className="muted small">Keep the phone in its practice position. Each attempt opens a two-second listening window. Raw audio is never saved or exported.</p>
  <label className="session-field" htmlFor="soundCheckActual"><span>Sound you will make</span><select id="soundCheckActual" defaultValue="trigger"><option value="trigger">Trigger pull</option><option value="other">Other / background sound</option><option value="rack">Rack slide</option><option value="reload">Change magazine</option><option value="draw">Draw from holster</option></select></label>
  <label className="session-field" htmlFor="soundCheckAttempts"><span>Attempts</span><input id="soundCheckAttempts" type="number" inputMode="numeric" min="1" max="50" step="1" defaultValue="10"/><small>1–50 · use a mix of trigger and non-trigger checks</small></label>
  <div className="sound-check-metadata"><label className="session-field" htmlFor="soundCheckRoom"><span>Room</span><select id="soundCheckRoom" defaultValue="normal"><option value="quiet">Quiet</option><option value="normal">Normal</option><option value="noisy">Noisy</option></select></label><label className="session-field" htmlFor="soundCheckDistance"><span>Phone distance</span><select id="soundCheckDistance" defaultValue="practice"><option value="close">Close</option><option value="practice">Normal</option><option value="far">Far</option></select></label></div>
  <p className="muted small sound-check-distance-help"><strong>Close:</strong> {distance.close} · <strong>Normal:</strong> {distance.practice} · <strong>Far:</strong> {distance.far}. Use your usual distance and keep it unchanged.</p>
  <div className="session-review-actions"><button id="soundCheckStartBtn" type="button" className="button primary wide-action" disabled aria-describedby="soundCheckSetupHint">Start Sound Check</button></div>
  <p id="soundCheckSetupHint" className="muted small">Preparing the check controls… Safety confirmation and microphone permission follow.</p>
 </section>
 <section id="soundCheckRun" className="sound-check-card hidden" aria-labelledby="soundCheckRunTitle">
  <p className="eyebrow">CURRENT ATTEMPT</p><h3 id="soundCheckRunTitle">Microphone preparation</h3>
  <div className="sound-check-progress"><strong id="soundCheckProgress">0 / 10</strong><span id="soundCheckExpected">Trigger pull</span></div>
  <label className="session-field" htmlFor="soundCheckRunActual"><span>Sound for next attempt</span><select id="soundCheckRunActual" defaultValue="trigger"><option value="trigger">Trigger pull</option><option value="other">Other / background sound</option><option value="rack">Rack slide</option><option value="reload">Change magazine</option><option value="draw">Draw from holster</option></select></label>
  <div className="practice-level-track" role="meter" aria-label="Sound check microphone level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}><div id="soundCheckLevel" className="practice-level-fill"/></div>
  <p id="soundCheckStatus" className="session-readiness" role="status" aria-live="polite">Preparing microphone…</p>
  <button id="soundCheckAttemptBtn" type="button" className="button primary wide-action" disabled>Begin attempt</button>
  <button id="soundCheckStopBtn" type="button" className="button secondary wide-action">Stop without saving</button>
 </section>
 <section id="soundCheckReview" className="sound-check-card hidden" aria-labelledby="soundCheckReviewTitle">
  <p className="eyebrow">CHECK COMPLETE</p><h3 id="soundCheckReviewTitle">Results for this check</h3>
  <div className="sound-check-stats"><div><strong id="soundCheckMatched">0</strong><span>Matched</span></div><div><strong id="soundCheckMissed">0</strong><span>Missed</span></div><div><strong id="soundCheckFalse">0</strong><span>False shots</span></div><div><strong id="soundCheckDuplicates">0</strong><span>Duplicates</span></div></div>
  <p id="soundCheckCandidate" className="muted small">Candidate comparison needs at least three new spectral trigger samples.</p>
  <p className="muted small">These counts describe this labelled check only. They do not prove universal accuracy or verify safe handling.</p>
  <button id="soundCheckExportBtn" type="button" className="button primary wide-action">Export privacy-safe report</button>
  <button id="soundCheckAgainBtn" type="button" className="button secondary wide-action">Run another check</button>
 </section>
 </>}
