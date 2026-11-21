import {GunContext} from '@dryfire/ui/GunContext';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {normalizeMeasurementSystem} from '../../../../../src/measurementUnits.js';
import {useLocaleMessages} from '../../localization/runtime.ts';

export function SoundCheckPage({gunName,measurementSystem='metric'}:{gunName?:string;measurementSystem?:string}){const {t}=useLocaleMessages('sound-check'),{t:common}=useLocaleMessages('common'),system=normalizeMeasurementSystem(measurementSystem);return <>
 <PageHeading id="soundCheck-title" title={t('page.title')} eyebrow={t('page.eyebrow')} backLabel={common('navigation.back')} reactBack={false}/>
 <GunContext name={gunName} prefix={t('gunContext.prefix')} suffix={t('gunContext.suffix')}/>
 <section id="soundCheckSetup" className="sound-check-card" aria-labelledby="soundCheckSetupTitle">
  <h3 id="soundCheckSetupTitle">{t('setup.title')}</h3>
  <p className="muted small">{t('setup.description')}</p>
  <label className="session-field" htmlFor="soundCheckActual"><span>{t('setup.soundLabel')}</span><select id="soundCheckActual" defaultValue="trigger"><option value="trigger">{t('sound.trigger')}</option><option value="other">{t('sound.other')}</option><option value="rack">{t('sound.rack')}</option><option value="reload">{t('sound.reload')}</option><option value="draw">{t('sound.draw')}</option></select></label>
  <label className="session-field" htmlFor="soundCheckAttempts"><span>{t('setup.attemptsLabel')}</span><input id="soundCheckAttempts" type="number" inputMode="numeric" min="1" max="50" step="1" defaultValue="10"/><small>{t('setup.attemptsHelp')}</small></label>
  <div className="sound-check-metadata"><label className="session-field" htmlFor="soundCheckRoom"><span>{t('setup.roomLabel')}</span><select id="soundCheckRoom" defaultValue="normal"><option value="quiet">{t('sound.quiet')}</option><option value="normal">{t('setup.normal')}</option><option value="noisy">{t('sound.noisy')}</option></select></label><label className="session-field" htmlFor="soundCheckDistance"><span>{t('setup.distanceLabel')}</span><select id="soundCheckDistance" defaultValue="practice"><option value="close">{t('setup.close')}</option><option value="practice">{t('setup.normal')}</option><option value="far">{t('setup.far')}</option></select></label></div>
  <p className="muted small sound-check-distance-help"><strong>{t('setup.close')}:</strong> {t(`distance.${system}.close`)} · <strong>{t('setup.normal')}:</strong> {t(`distance.${system}.normal`)} · <strong>{t('setup.far')}:</strong> {t(`distance.${system}.far`)}. {t('setup.distanceReminder')}</p>
  <div className="session-review-actions"><button id="soundCheckStartBtn" type="button" className="button primary wide-action" disabled aria-describedby="soundCheckSetupHint">{t('setup.start')}</button></div>
  <p id="soundCheckSetupHint" className="muted small">{t('setup.preparing')}</p>
 </section>
 <section id="soundCheckRun" className="sound-check-card hidden" aria-labelledby="soundCheckRunTitle">
  <p className="eyebrow">{t('run.eyebrow')}</p><h3 id="soundCheckRunTitle">{t('run.title')}</h3>
  <div className="sound-check-progress"><strong id="soundCheckProgress">0 / 10</strong><span id="soundCheckExpected">{t('sound.trigger')}</span></div>
  <label className="session-field" htmlFor="soundCheckRunActual"><span>{t('run.soundLabel')}</span><select id="soundCheckRunActual" defaultValue="trigger"><option value="trigger">{t('sound.trigger')}</option><option value="other">{t('sound.other')}</option><option value="rack">{t('sound.rack')}</option><option value="reload">{t('sound.reload')}</option><option value="draw">{t('sound.draw')}</option></select></label>
  <div className="practice-level-track" role="meter" aria-label={t('run.meter')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}><div id="soundCheckLevel" className="practice-level-fill"/></div>
  <p id="soundCheckStatus" className="session-readiness" role="status" aria-live="polite">{t('status.preparing')}</p>
  <button id="soundCheckAttemptBtn" type="button" className="button primary wide-action" disabled>{t('run.attempt')}</button>
  <button id="soundCheckStopBtn" type="button" className="button secondary wide-action">{t('run.stop')}</button>
 </section>
 <section id="soundCheckReview" className="sound-check-card hidden" aria-labelledby="soundCheckReviewTitle">
  <p className="eyebrow">{t('review.eyebrow')}</p><h3 id="soundCheckReviewTitle">{t('review.title')}</h3>
  <div className="sound-check-stats"><div><strong id="soundCheckMatched">0</strong><span>{t('review.matched')}</span></div><div><strong id="soundCheckMissed">0</strong><span>{t('review.missed')}</span></div><div><strong id="soundCheckFalse">0</strong><span>{t('review.falseShots')}</span></div><div><strong id="soundCheckDuplicates">0</strong><span>{t('review.duplicates')}</span></div></div>
  <p id="soundCheckCandidate" className="muted small">{t('review.candidateNeedsSamples')}</p>
  <p className="muted small">{t('review.disclosure')}</p>
  <button id="soundCheckExportBtn" type="button" className="button primary wide-action">{t('review.export')}</button>
  <button id="soundCheckAgainBtn" type="button" className="button secondary wide-action">{t('review.again')}</button>
 </section>
 </>}
