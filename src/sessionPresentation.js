import {practiceResultPresentation,sequenceResultPresentation,sessionSeconds as seconds} from '../apps/web/src/features/sessions/resultPresentation.ts';
// Shared read-only presentation for live sessions and explicitly simulated help examples.
import { continuousPractice, practiceElapsed, practiceStatistics } from './practiceSession.js';

function resultDetailsNode(model,node){
  const card=node('details','','session-result-card');
  card.append(node('summary',model.summary));
  const body=node('div','','session-result-body');
  for(const paragraph of model.paragraphs)body.append(node('p',paragraph.text,paragraph.className));
  if(model.detections.length){const list=node('ol','','session-detection-list');for(const text of model.detections)list.append(node('li',text));body.append(list);}
  card.append(body);return card;
}

export function practiceResultDetails(row,{node,titleFor}){
  return resultDetailsNode(practiceResultPresentation(row,titleFor),node);
}

export function renderPracticeReview(record, { $, node, state, savedRevision, saveError, saving, interruption, locked, getContext, details }) {
  $('practiceReviewStatus').textContent = `Practice ${record.status}`;
  $('practiceReviewStatus').dataset.status = record.status;
  const stats = practiceStatistics(record);
  const started = record.repetitions.some(row => row.goAt !== null);
  $('practiceSummary').replaceChildren(node('p', `${record.shots} accepted shots`, 'session-summary-count'),
    node('p', `${stats.hits} recognized attempts · ${stats.misses} misses`, 'muted small'), node('p', `${record.gunName} · active ${seconds(record.elapsedMs)}`, 'muted small'),
    node('p', `${new Date(record.startedAt).toLocaleString()} · ${!started ? 'No GO signal' : record.config.startSource === 'external' ? 'External cue onset timing' : 'Scheduled GO timing'}`, 'muted small'));
  if (continuousPractice(record.practiceMode) && stats.intervalMeanMs !== null) {
    $('practiceSummary').append(node('p', `Click intervals · mean ${seconds(stats.intervalMeanMs)} · min ${seconds(stats.intervalMinMs)} · max ${seconds(stats.intervalMaxMs)} · spread ${seconds(stats.intervalSpreadMs)}`, 'muted small'));
  }
  if (record.practiceMode === 'par') $('practiceSummary').append(node('p', `Par ${record.config.parSeconds.toFixed(1)} s · onset at the deadline is in time`, 'muted small'));
  if (record.config.startSource === 'app' && record.config.soundAtStart && started) $('practiceSummary').append(node('p', 'Beep mode excluded the first 0.08 s after start. Audible speaker latency varies by device.', 'muted small'));
  $('practiceSaved').textContent = saveError ? 'Not saved. Keep this page open and retry saving.' : state && savedRevision !== state.revision ? 'Saving on this device…' : 'Saved on this device';
  $('practiceRetryBtn').classList.toggle('hidden', !saveError); $('practiceRetryBtn').disabled = saving || !!interruption;
  $('practiceResults').replaceChildren(...record.repetitions.map(details));
  if (!record.repetitions.length) $('practiceResults').append(node('p', 'No attempt completed.', 'empty-state'));
  $('practiceRepeatBtn').disabled = locked() || record.gunId !== getContext().gun?.id;
}

export function renderPracticeRun({ $, state, mode, pending, clock, microphone, readConfig, interruption, closing, saving, inputFeedback, renderInput, details, node }) {
  const elapsed = state ? practiceElapsed(state, clock()) : 0;
  const continuous = continuousPractice(mode), free = mode === 'free';
  $('practiceCompletedLabel').textContent = continuous ? 'Clicks' : 'Attempts';
  $('practiceCompleted').textContent = state?.completed ?? 0; $('practiceShots').textContent = state?.shots ?? 0;
  $('practiceRemainingLabel').textContent = free ? 'Seconds left' : 'Left';
  $('practiceRemaining').textContent = free ? Math.ceil(Math.max(0, (state?.config.durationSeconds ?? 60) - elapsed / 1000)) : state?.remaining ?? readConfig().repetitions;
  $('practiceElapsed').textContent = seconds(elapsed);
  const phase = pending ? 'connecting' : state?.phase;
  $('practiceRun').dataset.phase = phase || 'idle';
  const showInput = ['countdown', 'active', 'await-cue'].includes(phase);
  const showStop = showInput || phase === 'countdown';
  $('practiceStopBtn').classList.toggle('hidden', !showStop);
  $('practiceStopBtn').disabled = !!interruption || closing;
  $('practiceLevelPanel').classList.toggle('hidden', !showInput);
  $('practiceSignal').classList.toggle('hidden', phase === 'active' || phase === 'await-cue');
  const signal = phase === 'countdown' ? String(Math.max(0, Math.ceil((state.countdownEndsAtMs - clock()) / 1000)))
    : ({ connecting: '…', 'await-cue': 'WAIT', result: 'NEXT', paused: 'PAUSED', closing: 'TIME' }[phase] || '—');
  $('practiceSignal').textContent = signal;
  $('practiceSignal').classList.toggle('is-paused', phase === 'paused');
  const countdownText = phase === 'countdown' ? `Next signal in ${Math.max(0, (state.countdownEndsAtMs - clock()) / 1000).toFixed(1)} s. Get ready.` : '';
  $('practiceAnnouncement').textContent = ({ connecting: 'Preparing microphone. Waiting for audio input before countdown…', countdown: countdownText, active: mode === 'reload' ? 'Practice started. Follow the selected events in order.' : 'Practice started. Listening for trigger clicks.',
    'await-cue': 'Listening for your calibrated external beep.', result: mode === 'single' ? (state?.repetitions.at(-1)?.reason === 'early' ? 'Early trigger saved as a miss. Preparing the next signal automatically.' : 'Click saved. Preparing the next signal automatically.') : 'Reset when ready, then choose Next repetition.', paused: 'Microphone released. Resume starts with a fresh signal.', closing: 'Time limit reached. Finishing audio captured before the deadline.' }[phase] || '');
  $('practiceMicrophone').textContent = microphone ? '● Microphone connected' : 'Microphone inactive';
  $('practiceInputFeedback').textContent = inputFeedback;
  renderInput();
  $('practicePauseBtn').classList.toggle('hidden', phase === 'paused'); $('practicePauseBtn').disabled = pending || saving || !!interruption;
  $('practiceResumeBtn').classList.toggle('hidden', phase !== 'paused'); $('practiceResumeBtn').disabled = pending || saving || !!interruption;
  $('practiceNextBtn').classList.toggle('hidden', phase !== 'result' || mode === 'single'); $('practiceNextBtn').disabled = pending || saving || !!interruption;
  $('practiceEndBtn').classList.toggle('hidden', showStop);
  $('practiceEndBtn').disabled = !!interruption || closing;
  const latest = state?.repetitions.filter(row => row.status !== 'partial').at(-1);
  $('practiceLatest').replaceChildren(latest ? details(latest) : node('p', 'Recognized clicks and repetition outcomes appear here.', 'muted small'));
}

export function sequenceResultDetails(row,{node,titleFor}){
  return resultDetailsNode(sequenceResultPresentation(row,titleFor),node);
}

export function renderSequenceReview(record, { $, node, state, savedRevision, saveError, saving, pending, retrySaveButton, locked, getContext, resultDetails }) {
  $('#sessionReviewStatus').dataset.status = record.status;
  $('#sessionReviewStatus').textContent = record.status === 'completed' ? 'Session completed' : `Session ${record.status}`;
  const summary = $('#sessionReviewSummary');
  summary.replaceChildren(node('p', `${record.completed} / ${record.config.repetitions}`, 'session-summary-count'),
    node('p', `${record.completed} completed · ${record.remaining} left`, 'muted small'),
    node('p', `${record.gunName} · ${new Date(record.startedAt).toLocaleString()}`, 'muted small'));
  const host = $('#sessionResultList');
  host.replaceChildren();
  if (!record.repetitions.length) host.append(node('p', 'No repetition was completed before this session ended.', 'empty-state'));
  for (const row of record.repetitions) host.append(resultDetails(row));
  const durable = !state || savedRevision === state.revision;
  $('#sessionReview .session-saved-note').textContent = saveError
    ? 'Results are not saved. Keep this page open and retry saving.'
    : durable ? 'Saved on this device' : 'Saving results on this device…';
  retrySaveButton.classList.toggle('hidden', !saveError);
  retrySaveButton.disabled = saving || pending;
  $('#repeatSessionBtn').disabled = locked() || !!saveError || getContext().gun?.id !== record.gunId;
}

export function renderSequenceRun({ $, state, pending, clock, microphone, readConfig, savedRevision, titleFor, resultDetails, announce, node }) {
  const config = state?.config || readConfig();
  $('#sessionCompletedCount').textContent = state?.completed ?? 0;
  $('#sessionLeftCount').textContent = state?.remaining ?? config.repetitions;
  $('#sessionProgressMeter').max = config.repetitions;
  $('#sessionProgressMeter').value = state?.completed ?? 0;
  $('#sessionCountdown').classList.toggle('is-go', state?.phase === 'active' && !pending);
  $('#sessionCountdown').classList.toggle('is-paused', state?.phase === 'paused');
  $('#sessionCountdown').classList.toggle('is-connecting', pending);
  $('#sessionMicrophoneStatus').textContent = microphone ? '● Microphone active' : pending ? 'Connecting microphone…' : 'Microphone inactive';
  $('#sessionMicrophoneStatus').classList.toggle('is-live', !!microphone);
  $('#pauseSessionBtn').classList.toggle('hidden', state?.phase === 'paused');
  $('#pauseSessionBtn').disabled = pending || !state || state.completed === config.repetitions;
  $('#resumeSessionBtn').classList.toggle('hidden', state?.phase !== 'paused');
  $('#resumeSessionBtn').disabled = pending;
  $('#endSessionBtn').disabled = false;
  if (pending) { $('#sessionCountdown').textContent = 'Connecting'; announce('Waiting for microphone permission.'); }
  else if (state.phase === 'countdown') {
    const remaining = Math.max(0, state.countdownEndsAtMs - clock());
    $('#sessionCountdown').textContent = (remaining / 1000).toFixed(1);
    announce(`Get ready · ${Math.ceil(remaining / 1000)} seconds.`);
  } else if (state.phase === 'active') {
    $('#sessionCountdown').textContent = 'GO';
    announce(`GO · awaiting ${titleFor(state.drillSteps[state.current.stepIndex])}.`);
  } else if (state.phase === 'paused') { $('#sessionCountdown').textContent = 'Paused'; announce('Paused. Resume starts a fresh countdown.'); }
  else {
    const durable = savedRevision === state.revision;
    $('#sessionCountdown').textContent = durable ? 'Saved' : 'Saving';
    announce(durable ? 'Repetition completed and saved.' : 'Repetition detected · saving results.');
  }
  const latest = state?.repetitions.filter(row => row.status === 'completed').at(-1);
  $('#sessionLatestResult').replaceChildren(latest ? resultDetails(latest) : node('p', 'Your completed repetition will appear here.', 'muted small'));
}
