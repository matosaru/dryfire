# Persistence, migration and backups

Revision: 1.6 · Scope: approved including CHG-014/015 storage and CHG-017 retention/limits · Implementation: schema 3 and version-4 compatible backups implemented; deployment verification separate

| ID | Requirement | State |
| --- | --- | --- |
| DATA-01 | Persist saved gun profiles, learned sounds, custom drills/configuration and session results through refreshes and compatible new deployments. | Approved; CHG-014 |
| DATA-02 | Keep each gun's sounds, drills and results independently owned and queryable. | Approved multi-gun scope |
| DATA-03 | Preserve compatible existing learned profiles, history and backups during upgrades. | Existing constraint |
| DATA-04 | Do not erase session history through sound reset or ordinary recent-detection trimming/clearing. | Approved; CHG-014 |

CHG-017 now caps new recordings at **10 per positive type and calibration category per gun**, while compatible older over-cap backups/profiles remain usable and restorable. New unknown/unmatched input is transient; previous unknown history remains intact. Recent recognized retention is the reviewed 1–500 range; session history is not trimmed. Schema 3, features 2 and backup format 4 remain unchanged. See [approved improvements](practice-improvements.md). The dated migration plans below preserve historical requirements, including their former recording cap.

## Current behavior and limits

The app uses IndexedDB database `dryfire-sound-trainer` for derived acoustic features, recognition events and settings. It stores no playable recordings and has no cloud synchronization. The service worker updates cached application files without clearing IndexedDB.

Refreshes and compatible deployments preserve data in the same browser/app storage context at the same origin (scheme, hostname and port). A preview domain, another browser or another device has separate storage. Local storage cannot guarantee recovery after deliberate site-data deletion, eviction or device loss.

## Implementation direction

These are engineering recommendations supporting the requested outcome, not a mandate for a particular backend:

- Keep a stable production origin and database identity. Upgrade the schema transactionally and retain original IDs, sound labels, compatible features and timestamps.
- Add gun profiles with stable IDs. Link learned samples, custom presets, configurations, events and session results to their owning gun. Persist the active selection.
- Preserve existing data in one legacy profile. Ask the user to name it and choose a type; do not assume that legacy data belongs to a handgun.
- Capture gun/session identity at the start of an operation rather than assigning results based on a later UI selection.
- Save sessions separately from the recent-detection store, whose current retention is the configured last 1–500 detections.
- Extend export/import to include all profiles, learned features, presets, settings and session/repetition results. Keep current version-1 backup migration support and validate imports before replacing data.
- Request persistent browser storage where supported and display accurate status. Do not describe this request as guaranteed protection from deletion.

## Historical CHG-012 migration plan (not current limits or backup version)

These engineering choices implement the existing preservation and ownership requirements; they do not approve the remaining proposed session or cloud features.

- Upgrade IndexedDB from schema version 1 to 2 while retaining the database name **dryfire-sound-trainer**. Perform schema/data migration transactionally. Keep existing record IDs, sound IDs, compatible feature vectors and timestamps.
- Create gun profiles with stable IDs and persist the active selection. Scope learned features, custom presets and recognition history to their owning gun; persist per-gun drill selection independently. Existing global browser preferences retain their values.
- Retain the existing `examples`, `events` and `settings` stores; add `guns` and compound-keyed `gunSettings` (`gunId`, `key`). Index examples/events by `gunId`. Per-gun settings hold `maxResults`, `selectedDrill`, `customDrills` and compatible `drillConfig`; storing a configuration field does not implement the pending session runner. `activeGunId` is internal global selection state.
- Put existing legacy learned features/history in a single unnamed **needsDetails** gun with no assumed type. Require the user to supply its name and one of the approved types before continuing; do not discard records. A database without learned features or history starts with no fabricated gun. Move the legacy `maxResults` value into that gun's settings and preserve unrelated browser preferences.
- Keep the existing fifty-example limit per sound independently for each gun. Recognition-history retention remains the configured last 1–500 events **per gun**; trimming one gun never erases another gun's history. Custom-drill event metadata retains a snapshot of the preset title/sequence so later editing does not rewrite the historic detection context.
- Snapshot gun ownership when capture/listening begins. Block switching until that operation stops, so asynchronous features and detections cannot move to a different gun.
- Export version-2 whole-library backups containing guns, owned learned features, custom presets, recognition history, per-gun drill selection and current settings. Validate the complete payload before replacing saved data. Do not include pending session records or imply those records already exist.
- Continue restoring compatible version-1 backups. Restore legacy features/history into one profile requiring name/type, rather than mixing them into an arbitrary selected gun; an empty backup creates no fabricated gun. Restore the legacy retention setting for that gun, preserve unrelated current browser preferences and retain the stable sound identifiers.
- As in the existing backup behavior, exports contain compatible current-version derived features. Incompatible legacy vectors remain in IndexedDB after migration and are reported as outdated until the user confirms the relevant sound reset; they are not exported as usable training examples. Version-2 restore replaces the complete library, including backed-up global preferences, in one validated transaction; invalid owners, duplicate settings or invalid own-gun preset references are rejected before replacement.
- The browser import control rejects files larger than 10 MB before parsing. Imports still require replacement confirmation; a size limit does not replace full content/ownership validation.
- Keep the same-origin local-storage limit explicit. Browser refresh/deployment does not imply cloud backup, cross-device synchronization or guaranteed recovery after site-data deletion.

CHG-012 delivered the multi-gun storage described above. Its historical backup format remains supported; CHG-014 extends it as specified below. Persistent-storage status controls and cloud recovery remain outside the current scope.

## Historical CHG-014 durable-session extension (backup 3 superseded by 4)

The user explicitly approved the [published revision 1.0 plan](https://github.com/matosaru/dryfire/blob/ebac22b/docs/design/requirements/next-implementation.md) with **“proceed”**. Engineering choices implement that approved retention/ownership behavior without adding cloud services.

- Upgrade the same database transactionally from schema 2 to **3**, adding a separate owned `sessions` store; retain existing stores, gun IDs, learned features, events, settings and timestamps. No automatic session retention/trim is introduced.
- Snapshot gun/drill identity, title/sequence/configuration, timestamps/status, completed/partial repetition outcomes, detected events/counts and relative timings. Guard reads/writes by the owning gun. Later preset changes never rewrite past snapshots.
- Serialize durable revisioned snapshot writes. Save completed outcomes before advancing to another repetition. Pause/interruption retains partial outcomes; refresh opens the last saved review, and an abrupt shutdown recovers the last durable snapshot without automatically reacquiring the microphone.
- Sound reset and recent-recognition trimming/clearing preserve the separate session store. History can reopen sessions for the selected gun only.
- Export **version-3** whole-library backups including owned sessions and per-gun audio/device-wide appearance/vibration preferences. Continue accepting versions 1 and 2. The existing replacement confirmation explicitly discloses replacing saved sessions; older backups contain none and restore an empty session collection.
- Validate all records, associations and ownership before atomic replacement. Invalid session owners/records must leave all current stores unchanged. Preserve the existing 10 MB browser import limit.
- Same-origin/device local-storage limits remain explicit; this adds no accounts, cloud recovery, raw audio or cross-device synchronization.

Component validation on 2026-10-11: the schema-3/session/backup implementation passes 61 targeted storage checks, including records generated by the actual session engine and malformed-completion/split-proof rejection. Session reads reject foreign ownership; recovery uses the last durable partial snapshot rather than claiming the actual browser-shutdown time. Final application integration/browser acceptance also passed; [implementation history](../project/implementation-history.md) records 186 Jest/16 smoke checks and six browser suites. Deployment and physical-device verification remain separate.

## Cloud recovery is not yet approved

Accounts, authenticated cloud backup, cross-device synchronization and server-side data storage remain proposed scope. If requested, document identity/ownership, access checks, offline synchronization, conflicts, recovery and deletion before implementation. Workers plus D1 is a possible architecture, not an approved requirement. Raw-audio retention and upload require a separate decision.

## Acceptance criteria

1. Refresh and a new compatible app build on the same production origin retain saved profiles and related records.
2. Upgrading an existing single-profile database preserves compatible records and their original timestamps.
3. Changing the active gun does not mix or silently reassign samples, presets or results.
4. Completed sessions survive recent-detection trimming and sound-profile resets.
5. A complete backup can restore owned data without mixing guns; malformed backups cannot partially erase the current database.
6. UI wording distinguishes **Saved on this device** from any future genuinely verified cloud synchronization.

## Authorized trigger-first practice extension — CHG-015

The [consolidated practice specification](practice-modes.md) implements the user's explicit automatic-work instruction. Reuse **schema 3** and the owned sessions/settings stores, preserving old records without a destructive migration.

- Practice records discriminate `kind: practice` and snapshot mode, gun, configuration, accepted shots, resolved/remaining attempts, misses/partials, captured audio offsets and intervals. Validate identities, timing/outcome/count proofs and immutable snapshots before writes/restoration. Last-durable-snapshot recovery opens interrupted Review without capture.
- Gun-owned settings hold typed `practiceConfig`, `enabledSoundLabels` and `calibrationExamples`. Derived reset/noise/cue examples contain no playable audio; compatible examples are used as rejection evidence. Trigger remains enabled; old trained optional sounds start enabled to preserve existing behavior.
- Export **backup format 4** with legacy and practice records, calibration and preferences. Accept compatible formats **1, 2 and 3**. Whole-library replacement is confirmed and atomic; invalid practice data must not partially replace the current library. Preserve the existing 10 MB import limit.
- Full sound reset atomically clears positive and rejection/cue features only for the selected gun; all saved practice/legacy results, mode presets and other guns survive. Category resets preserve the other categories. Recent-recognition retention/clear remains independent of saved sessions.
- Serialize saves and preserve unsaved outcomes in Review with an honest Retry action. Prevent leaving that unsaved review; browser shutdown can retain only previously durable data. This is local persistence, not cloud recovery.

## User-requested whole-library reset — CHG-019

The separately confirmed [SET-06 action](settings.md#explicit-data-reset--chg-019) clears all six app stores in one readwrite transaction. An aborted transaction must retain the full library. No schema/version migration or origin-wide browser-storage wipe is added. Ordinary per-sound/full-sound reset and recent-history trimming continue preserving profiles and saved sessions. Compatible external backups remain restorable after full reset.

## Explicit history and session deletion — CHG-020

| ID | Requirement | State |
| --- | --- | --- |
| DATA-05 | History labels the existing action **Clear recognition history**. Confirmed clearing removes only the selected gun's recent recognized-event rows, then immediately clears the visible recognition log, latest prediction/verification, Live Listen timeline/counts and recognition statistics. Saved sessions/progress and all learned sounds remain intact. | Direct user report; correction of approved behavior |
| DATA-06 | History provides a separate **Clear saved sessions** action beside the saved-session section. Confirmation names the selected gun, includes both practice and sequence sessions and explains that their progress statistics will be removed. Cancel changes nothing. Confirm deletes only that gun's saved sessions, clears stale Review context and immediately refreshes session cards, filters/charts/statistics to their empty state. Learned sounds, presets/settings, recognition history and other guns survive. | Approved by direct instruction, 2026-10-11; implemented and locally validated |

Flush queued event/configuration work before confirmed deletion, snapshot the intended owner, and block the controls while capture, saving, unsaved Review or library operations are active. Earlier async reads must not restore stale deleted rows on screen. Deleted Review routes resolve to the drill catalog rather than displaying stale results. A storage failure reports an error without claiming success; successful deletion persists through reload and export. No automatic retention or schema/backup-format change is introduced. GUN-12 deletion also removes all owned stores in one atomic transaction.

Acceptance: clear recognition events and verify both visible logs/counts plus storage; preserve saved sessions/progress. Clear mixed practice/sequence sessions and verify cards/charts/Review after reload; preserve recognition/learned data and another gun's sessions. Test cancel, write/transaction failure, stale navigation/read handling and new sessions after clearing. Current design: [History](../design/screens/history/README.md).
