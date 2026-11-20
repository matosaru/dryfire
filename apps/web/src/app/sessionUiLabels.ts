const SESSION_UI_KEYS = [
  'attempts', 'shots', 'left', 'stop', 'stopExample', 'stopPractice', 'microphoneInput',
  'microphoneLevel', 'relativeLevel', 'waitingAudio', 'activeTime', 'pause', 'resume',
  'nextRepetition', 'endPractice', 'practiceLatestEmpty', 'practiceReview', 'noAttempt',
  'retrySaving', 'repeatPractice', 'backDrills', 'sessionProgress', 'completed',
  'completedRepetitions', 'currentRepetition', 'microphoneInactive', 'latestRepetition',
  'latestEmpty', 'endSession', 'pauseNote', 'sessionReview', 'savedDevice',
  'repetitionResults', 'noRepetition', 'repeatSession', 'sessionTimingNote',
] as const;

export type SessionUiKey = typeof SESSION_UI_KEYS[number];
export type SessionUiLabels = Record<SessionUiKey, string>;

export function sessionUiLabels(message: (key: string) => string): SessionUiLabels {
  return Object.fromEntries(SESSION_UI_KEYS.map(key => [key, message(`sessionUi.${key}`)])) as SessionUiLabels;
}
