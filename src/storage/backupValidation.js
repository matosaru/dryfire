import {FEATURE_VERSION} from '../featureFormat.js';
import {labels} from '../classifier.js';
import {ACTUAL_CLASSES} from '../evaluation.js';
import {getDrill} from '../drills.js';
import {DRILL_OUTCOMES,ACTIVE_GUN,MAX_COMPATIBLE_EXAMPLES_PER_CLASS,MAX_GUNS} from './constants.js';
import {normalizeMaxResults,validGunDetails,validFeatures,validatePracticeSetting,validateCustomDrills,currentPracticeSettings,currentPracticeRecord,supportedSession,sortedEvents} from './validation.js';
import {validateSession} from './sessionValidation.js';

function isJsonValue(value, depth = 0) {
  if (depth > 32) return false;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return Array.from(value).every(item => isJsonValue(item, depth + 1));
  if (!value || typeof value !== 'object' || Object.prototype.toString.call(value) !== '[object Object]') return false;
  return Object.values(value).every(item => isJsonValue(item, depth + 1));
}

export function validateBackup(backup, createLegacyGun, now) {
  if (!backup || backup.format !== 'sound-trainer-backup' || ![1, 2, 3, 4].includes(backup.version) || backup.featureVersion !== FEATURE_VERSION) {
    throw new Error('This file is not a compatible Dry Fire With Ease backup.');
  }
  const v1 = backup.version === 1;
  if (!Array.isArray(backup.examples) || !Array.isArray(backup.events) ||
      backup.examples.length > MAX_COMPATIBLE_EXAMPLES_PER_CLASS * labels.length * (v1 ? 1 : MAX_GUNS) ||
      backup.events.length > 500 * (v1 ? 1 : MAX_GUNS)) {
    throw new Error('Backup contains an invalid amount of data.');
  }
  const oldGun = v1 && (backup.examples.length || backup.events.length) ? createLegacyGun() : null;
  const guns = v1 ? (oldGun ? [oldGun] : []) : backup.guns;
  if (!Array.isArray(guns) || guns.length > MAX_GUNS) throw new Error('Backup contains an invalid gun library.');
  const gunIds = new Set();
  const safeGuns = Array.from(guns, gun => {
    if (!gun || typeof gun.id !== 'string' || !gun.id || gunIds.has(gun.id) || !Number.isFinite(gun.createdAt)) {
      throw new Error('Backup contains an invalid or duplicated gun profile.');
    }
    const legacy = gun.needsDetails === true && gun.name === '' && gun.type === null;
    if (!legacy) validGunDetails(gun.name, gun.type);
    if (gun.needsDetails !== undefined && gun.needsDetails !== legacy) throw new Error('Backup contains invalid gun details.');
    gunIds.add(gun.id);
    return { id: gun.id, name: legacy ? '' : gun.name.trim(), type: gun.type, needsDetails: legacy, createdAt: gun.createdAt };
  });
  const activeGunId = v1 ? oldGun?.id ?? null : backup.activeGunId;
  if ((activeGunId !== null && !gunIds.has(activeGunId)) || (safeGuns.length && activeGunId === null)) {
    throw new Error('Backup contains an invalid selected gun.');
  }
  const settings = v1 ? {} : backup.settings ?? {};
  if (!settings || Array.isArray(settings) || !isJsonValue(settings) || Object.hasOwn(settings, ACTIVE_GUN)) {
    throw new Error('Backup contains invalid global settings.');
  }
  const sourceGunSettings = v1 ? (oldGun ? [{ gunId: oldGun.id, key: 'maxResults', value: normalizeMaxResults(backup.settings?.maxResults ?? 50) }] : []) : backup.gunSettings;
  if (!Array.isArray(sourceGunSettings)) throw new Error('Backup contains invalid gun settings.');
  const settingIds = new Set();
  const safeGunSettings = Array.from(sourceGunSettings, row => {
    if (!row || !gunIds.has(row.gunId) || typeof row.key !== 'string' || !row.key || !isJsonValue(row.value)) {
      throw new Error('Backup contains invalid gun settings.');
    }
    const identity = JSON.stringify([row.gunId, row.key]);
    if (settingIds.has(identity)) throw new Error('Backup contains duplicated gun settings.');
    settingIds.add(identity);
    let value = structuredClone(row.value);
    if (row.key === 'customDrills') value = validateCustomDrills(value);
    if (row.key === 'maxResults') value = normalizeMaxResults(value);
    if (row.key === 'practiceConfig') value = currentPracticeSettings(value);
    value = validatePracticeSetting(row.key, value);
    return { gunId: row.gunId, key: row.key, value };
  });
  const presetCatalogs = new Map(safeGunSettings.filter(row => row.key === 'customDrills').map(row => [row.gunId, row.value]));
  for (const row of safeGunSettings) {
    if (row.key === 'selectedDrill' && row.value !== null && row.value !== '' && !getDrill(row.value, presetCatalogs.get(row.gunId) ?? [])) {
      throw new Error('Backup contains a selected drill unavailable for its gun.');
    }
  }
  const ownerOf = row => v1 ? oldGun?.id : row.gunId;
  const counts = new Map();
  const exampleIds = new Set();
  const safeExamples = Array.from(backup.examples, row => {
    if (!row || !labels.includes(row.label) || row.featureVersion !== FEATURE_VERSION ||
        !validFeatures(row.features) || row.features.length !== 15) throw new Error('Backup contains incompatible learned samples.');
    const gunId = ownerOf(row);
    if (!gunIds.has(gunId)) throw new Error('Backup contains a learned sample with an unknown gun owner.');
    const identity = JSON.stringify([gunId, row.label]);
    const count = (counts.get(identity) ?? 0) + 1;
    if (count > MAX_COMPATIBLE_EXAMPLES_PER_CLASS) throw new Error('Too many examples of one sound.');
    counts.set(identity, count);
    if (typeof row.id !== 'string' || !row.id || exampleIds.has(row.id)) throw new Error('Invalid or duplicated backup ID.');
    exampleIds.add(row.id);
    return { id: row.id, gunId, label: row.label, featureVersion: FEATURE_VERSION,
      features: [...row.features], createdAt: Number.isFinite(row.createdAt) ? row.createdAt : now() };
  });
  const eventIds = new Set();
  const eventCounts = new Map();
  const safeEvents = Array.from(backup.events, row => {
    if (!row || typeof row.id !== 'string' || !row.id || eventIds.has(row.id) ||
        ![...labels, 'unknown'].includes(row.label) || !Number.isFinite(row.score)) throw new Error('Backup contains an invalid recognition event.');
    if (row.actualLabel !== undefined && !ACTUAL_CLASSES.includes(row.actualLabel)) throw new Error('Backup contains an invalid verification label.');
    const gunId = ownerOf(row);
    if (!gunIds.has(gunId)) throw new Error('Backup contains an event with an unknown gun owner.');
    const count = (eventCounts.get(gunId) ?? 0) + 1;
    if (count > 500) throw new Error('Backup contains too many events for one gun.');
    eventCounts.set(gunId, count);
    const hasDrill = row.drillId !== undefined;
    const drill = hasDrill ? getDrill(row.drillId, presetCatalogs.get(gunId) ?? []) : null;
    let snapshot = null;
    if (row.drillTitle !== undefined || row.drillSteps !== undefined) {
      if (typeof row.drillTitle !== 'string' || !row.drillTitle.trim() || row.drillTitle.length > 80 ||
          !Array.isArray(row.drillSteps) || !row.drillSteps.length || row.drillSteps.length > 32 || !Array.from(row.drillSteps).every(label => labels.includes(label))) {
        throw new Error('Backup contains invalid drill sequence metadata.');
      }
      snapshot = { title: row.drillTitle, steps: [...row.drillSteps] };
    }
    const sequence = snapshot?.steps ?? drill?.steps;
    if ((!hasDrill && snapshot) || (hasDrill && ((!drill && !snapshot) || typeof row.drillId !== 'string' || !row.drillId ||
        !DRILL_OUTCOMES.includes(row.drillOutcome) || !Number.isInteger(row.drillPosition) || row.drillPosition < 0 ||
        row.drillPosition >= sequence.length ||
        (row.drillCompleted !== undefined && row.drillCompleted !== (row.drillOutcome === 'completed'))))) {
      throw new Error('Backup contains invalid drill metadata.');
    }
    eventIds.add(row.id);
    return { id: row.id, gunId, label: row.label, score: Math.max(0, Math.min(100, row.score)),
      createdAt: Number.isFinite(row.createdAt) ? row.createdAt : now(),
      ...(row.actualLabel ? { actualLabel: row.actualLabel } : {}),
      ...(hasDrill ? { drillId: row.drillId, drillOutcome: row.drillOutcome,
        drillPosition: row.drillPosition, drillCompleted: row.drillOutcome === 'completed',
        ...(snapshot ? { drillTitle: snapshot.title, drillSteps: snapshot.steps } : {}) } : {}) };
  });
  const events = [];
  for (const gun of safeGuns) {
    const max = normalizeMaxResults(safeGunSettings.find(row => row.gunId === gun.id && row.key === 'maxResults')?.value ?? 50);
    events.push(...sortedEvents(safeEvents.filter(row => row.gunId === gun.id)).slice(0, max));
  }
  const sessionRows = backup.version >= 3 ? backup.sessions ?? [] : [];
  if (!Array.isArray(sessionRows)) throw new Error('Backup contains invalid saved sessions.');
  for (const row of sessionRows) {
    if (!row || !gunIds.has(row.gunId)) throw new Error('Backup contains a saved session with an unknown gun owner.');
  }
  const sessionIds = new Set();
  const sessions = Array.from(sessionRows.filter(supportedSession), row => {
    const record = validateSession(currentPracticeRecord(row), row.gunId);
    if (sessionIds.has(record.id)) throw new Error('Backup contains duplicated saved session IDs.');
    sessionIds.add(record.id);
    return record;
  });
  return { guns: safeGuns, activeGunId, settings: structuredClone(settings), gunSettings: safeGunSettings, examples: safeExamples, events, sessions };
}
