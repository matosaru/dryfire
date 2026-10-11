import { addExample, getExamples, addCalibrationExample, clearCalibrationExamples, clearExamples, createGun, exportBackup, getCalibrationExamples, getSession, getSessions, recoverInterruptedSessions, restoreBackup, saveSession, setGunSetting } from '../src/storage.js';
import { createPractice, tickPractice, detectPractice, toPracticeRecord } from '../src/practiceSession.js';
const removeDb = () => new Promise((resolve, reject) => {
  const request = indexedDB.deleteDatabase('dryfire-sound-trainer'); request.onsuccess = resolve; request.onerror = () => reject(request.error);
});
beforeEach(removeDb); afterAll(removeDb);
const config = { repetitions: 1, fixedDelaySeconds: 0, delayMode: 'fixed', soundAtStart: false };
function record(gun) {
  let s = createPractice({ id: 'practice-test', gun, mode: 'single', config, monoNow: 0, epochNow: 1000 });
  s = tickPractice(s, { monoNow: 0, epochNow: 1000 });
  s = detectPractice(s, { label: 'trigger', score: 90, detectedAtMs: 300 }, { monoNow: 400, epochNow: 1400 });
  return toPracticeRecord(s);
}
test('early Single misses round-trip through saved history and backup without a shot', async () => {
  const gun = await createGun({ name: 'Early fixture', type: 'Handguns' });
  const s = createPractice({ id: 'early-test', gun, config: { ...config, fixedDelaySeconds: 1 }, monoNow: 0, epochNow: 1000 });
  const result = toPracticeRecord(detectPractice(s, { label: 'trigger', score: 90, detectedAtMs: 500 }, { monoNow: 700, epochNow: 1700 }));
  await saveSession(result, gun.id);
  await restoreBackup(await exportBackup());
  expect(await getSession(result.id, gun.id)).toEqual(result);
  expect(result).toMatchObject({ completed: 1, shots: 0, repetitions: [{ reason: 'early', status: 'miss' }] });
});
test('practice records persist with owner and immutable snapshot checks', async () => {
  const a = await createGun({ name: 'A', type: 'Handguns' }), b = await createGun({ name: 'B', type: 'Shotguns' });
  const saved = record(a); await saveSession(saved, a.id);
  expect(await getSession(saved.id, a.id)).toEqual(saved);
  expect(await getSession(saved.id, b.id)).toBeNull();
  await expect(saveSession({ ...saved, config: { ...saved.config, repetitions: 2 }, revision: saved.revision + 1 }, a.id)).rejects.toThrow();
});
test('calibration is independently owned, limited, validated and selectively reset', async () => {
  const a = await createGun({ name: 'A', type: 'Handguns' }), b = await createGun({ name: 'B', type: 'Shotguns' });
  await addCalibrationExample('reset', Array(15).fill(.2), a.id);
  await addCalibrationExample('cue', Array(15).fill(.4), a.id);
  expect(await getCalibrationExamples(b.id)).toEqual([]);
  await clearCalibrationExamples('reset', a.id);
  expect((await getCalibrationExamples(a.id)).map(x => x.kind)).toEqual(['cue']);
  await expect(setGunSetting('calibrationExamples', [{ kind: 'reset', features: [NaN] }], a.id)).rejects.toThrow();
  await expect(setGunSetting('enabledSoundLabels', ['made-up'], a.id)).rejects.toThrow();
});
test('new rejection calibration is limited to ten per category without sharing caps across guns', async () => {
  const a = await createGun({ name: 'A', type: 'Handguns' }), b = await createGun({ name: 'B', type: 'Shotguns' });
  const features = Array(15).fill(.2);
  const attempts = await Promise.allSettled(Array.from({ length: 12 }, () => addCalibrationExample('noise', features, a.id)));
  expect(attempts.filter(row => row.status === 'fulfilled')).toHaveLength(10);
  expect(await getCalibrationExamples(a.id)).toHaveLength(10);
  await addCalibrationExample('reset', features, a.id);
  await addCalibrationExample('noise', features, b.id);
  expect(await getCalibrationExamples(b.id)).toHaveLength(1);
});

test('format4 round-trips practice/calibration and rejects malformed data atomically', async () => {
  const a = await createGun({ name: 'A', type: 'Handguns' });
  await addCalibrationExample('noise', Array(15).fill(.3), a.id);
  await saveSession(record(a), a.id);
  const backup = await exportBackup(); expect(backup.version).toBe(4);
  await restoreBackup(backup);
  const again = await exportBackup(); delete again.exportedAt; const expected = structuredClone(backup); delete expected.exportedAt;
  expect(again).toEqual(expected);
  const bad = structuredClone(backup); bad.sessions[0].shots = 400;
  await expect(restoreBackup(bad)).rejects.toThrow();
  expect(await getSession(backup.sessions[0].id, a.id)).toEqual(backup.sessions[0]);
});

test('older over-cap profiles and calibration restore and export intact while new recording is blocked', async () => {
  const gun = await createGun({ name: 'Older profile', type: 'Handguns' });
  await addExample('trigger', Array(15).fill(.2), gun.id);
  await addCalibrationExample('reset', Array(15).fill(.3), gun.id);
  const backup = await exportBackup();
  backup.examples = Array.from({ length: 12 }, (_, i) => ({ ...backup.examples[0], id: `old-example-${i}` }));
  const calibration = backup.gunSettings.find(row => row.key === 'calibrationExamples');
  calibration.value = Array.from({ length: 12 }, (_, i) => ({ ...calibration.value[0], id: `old-calibration-${i}` }));
  await restoreBackup(backup);
  expect(await getExamples(gun.id)).toHaveLength(12);
  expect(await getCalibrationExamples(gun.id)).toHaveLength(12);
  await expect(addExample('trigger', Array(15).fill(.4), gun.id)).rejects.toThrow(/maximum|limit/i);
  await expect(addCalibrationExample('reset', Array(15).fill(.4), gun.id)).rejects.toThrow(/maximum|limit/i);
  const exported = await exportBackup();
  expect(exported.examples).toHaveLength(12);
  expect(exported.gunSettings.find(row => row.key === 'calibrationExamples').value).toHaveLength(12);
});
test('running practice recovers as interrupted without erasing its partial', async () => {
  const gun = await createGun({ name: 'A', type: 'Handguns' });
  let state = createPractice({ id: 'in-progress', gun, mode: 'reload', config, monoNow: 0, epochNow: 1000 });
  state = tickPractice(state, { monoNow: 0, epochNow: 1000 });
  state = detectPractice(state, { label: 'rack', score: 80, detectedAtMs: 100 }, { monoNow: 200, epochNow: 1200 });
  await saveSession(toPracticeRecord(state), gun.id);
  await recoverInterruptedSessions(gun.id);
  const [saved] = await getSessions(gun.id);
  expect(saved).toMatchObject({ status: 'interrupted', shots: 0, currentAttempt: null });
  expect(saved.repetitions[0].detections).toHaveLength(1);
});
test('full sound reset clears owned rejection/cue calibration and preserves sessions and other guns', async () => {
  const a = await createGun({ name: 'A', type: 'Handguns' }), b = await createGun({ name: 'B', type: 'Shotguns' });
  await addCalibrationExample('reset', Array(15).fill(.2), a.id);
  await addCalibrationExample('cue', Array(15).fill(.4), b.id);
  const saved = record(a); await saveSession(saved, a.id);
  await clearExamples(a.id);
  expect(await getCalibrationExamples(a.id)).toEqual([]);
  expect(await getCalibrationExamples(b.id)).toHaveLength(1);
  expect(await getSession(saved.id, a.id)).toEqual(saved);
});
