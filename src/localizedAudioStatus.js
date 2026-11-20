import {translate} from '../apps/web/src/localization/runtime.ts';

const statusKeys = new Map([
  ['Requesting microphone permission…', 'requestRecordingPermission'],
  ['Recording… one sound now', 'recordingSound'],
  ['Analysing sound…', 'analyzing'],
  ['Requesting microphone access…', 'requestMicrophoneAccess'],
  ['Preparing microphone…', 'preparingMicrophone'],
  ['Room is noisy · Move closer or reduce background sound', 'roomNoisy'],
  ['Microphone ready · Listening before the signal', 'microphoneReady'],
  ['Live listening (AudioWorklet)', 'liveWorklet'],
  ['Live listening (compatibility mode)', 'compatibility'],
  ['Practice saved', 'practice.saved'],
  ['Session saved', 'session.saved'],
  ['Session cancelled before starting', 'session.cancelled'],
]);
const errorKeys = new Map([
  ['Recording is too short to analyse.', 'audioTooShort'],
  ['No clear sound detected. Move closer to the microphone or try a quieter room.', 'audioNoClearSound'],
  ['Audio was distorted. Move the microphone farther from the source.', 'audioDistorted'],
  ['Microphone access requires HTTPS or localhost and a compatible browser.', 'secureContext'],
  ['Web Audio is unavailable on this device.', 'webAudioUnavailable'],
  ['This WebView does not support PCM recording. Native audio capture is required.', 'pcmUnavailable'],
  ['No audio arrived from the microphone.', 'noMicrophoneAudio'],
  ['Microphone permission was denied. Enable it in browser or app settings.', 'microphoneDenied'],
  ['Microphone requires HTTPS/localhost and permission.', 'microphoneSecureContext'],
  ['No audio input arriving. Check microphone permission and try again.', 'noInput'],
  ['Listening stopped.', 'listeningStopped'],
  ['Neither AudioWorklet nor the compatibility recorder is available.', 'recorderUnavailable'],
  ['Microphone audio was interrupted. Restart the sound check or practice to reconnect.', 'microphoneInterrupted'],
  ['Microphone disconnected. Restart the sound check or practice to reconnect.', 'microphoneDisconnected'],
  ['Microphone input was muted. Check microphone access, then restart the sound check or practice.', 'microphoneMuted'],
  ['Microphone input stopped arriving. Restart the sound check or practice to reconnect.', 'inputStopped'],
  ['Practice guide could not load. Your setup is unchanged. Check your connection and reload to try again.', 'guideUnavailable'],
]);

export function translateAudioStatus(status) {
  const countdown = /^Get ready… (\d+)$/.exec(status);
  if (countdown) return translate('common', 'runtimeAudio.getReady', {count: Number(countdown[1])});
  const key = statusKeys.get(status);
  const errorKey=errorKeys.get(status);
  if(errorKey)return translate('common',`runtimeErrors.${errorKey}`);
  if (!key) return status;
  if (key.includes('.')) return translate('common', `runtime.${key}`);
  return translate('common', `runtimeAudio.${key}`);
}

export function translateApplicationError(error) {
  const errorKeys={INVALID_BACKUP:'invalidBackup',GUN_REQUIRED:'gunRequired',GUN_MISSING:'gunMissing',GUN_LIMIT:'gunLimit',SAMPLE_LIMIT:'sampleLimit',CALIBRATION_LIMIT:'calibrationLimit',EVENT_MISSING:'recordMissing',SESSION_MISSING:'recordMissing',SESSION_DATA_CONFLICT:'sessionDataConflict',DATABASE_UNAVAILABLE:'databaseUnavailable',DATABASE_OPEN_FAILED:'databaseUnavailable',DATABASE_BLOCKED:'databaseBlocked',DATABASE_TRANSACTION_FAILED:'databaseTransactionFailed',TRAINING_DATA_INVALID:'trainingDataInvalid',GUIDE_UNAVAILABLE:'guideUnavailable',AUDIO_TOO_SHORT:'audioTooShort',AUDIO_NO_CLEAR_SOUND:'audioNoClearSound',AUDIO_DISTORTED:'audioDistorted',MICROPHONE_SECURE_CONTEXT:'microphoneSecureContext',WEB_AUDIO_UNAVAILABLE:'webAudioUnavailable',PCM_UNAVAILABLE:'pcmUnavailable',NO_MICROPHONE_AUDIO:'noMicrophoneAudio',MICROPHONE_DENIED:'microphoneDenied',NO_AUDIO_INPUT:'noInput',LISTENING_STOPPED:'listeningStopped',RECORDER_UNAVAILABLE:'recorderUnavailable'};
  const key=errorKeys[error?.code];
  if(key)return translate('common',`runtimeErrors.${key}`);
  if(error?.code==='NAVIGATION_LOCKED')return translate('common','runtimeMain.navigationLocked');
  if(error?.code==='PRACTICE_RESULTS_UNSAVED')return translate('common','sessionUi.practiceSaveRetry');
  if(error?.code==='PROGRESS_CHARTS_UNAVAILABLE')return translate('common','runtimeErrors.progressChartsUnavailable');
  return translateAudioStatus(error?.message||String(error));
}
