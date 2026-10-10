# Persistence, migration and backups

Revision: 1.1 · Scope: refresh/deployment durability requested · Implementation: multi-gun storage/backups implemented and locally validated (CHG-012); dedicated session storage pending

| ID | Requirement | State |
| --- | --- | --- |
| DATA-01 | Persist saved gun profiles, learned sounds, custom drills/configuration and session results through refreshes and compatible new deployments. | Requested |
| DATA-02 | Keep each gun's sounds, drills and results independently owned and queryable. | Approved multi-gun scope |
| DATA-03 | Preserve compatible existing learned profiles, history and backups during upgrades. | Existing constraint |
| DATA-04 | Do not erase session history through sound reset or ordinary recent-detection trimming. | Existing constraint extended to requested saved sessions |

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

## Concrete migration and backup plan for CHG-012

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

Dedicated session/repetition storage, persistent-storage status controls and cloud recovery remain pending. Acceptance criteria involving dedicated sessions apply when that separate session runner is implemented.

## Cloud recovery is not yet approved

Accounts, authenticated cloud backup, cross-device synchronization and server-side data storage remain proposed scope. If requested, document identity/ownership, access checks, offline synchronization, conflicts, recovery and deletion before implementation. Workers plus D1 is a possible architecture, not an approved requirement. Raw-audio retention and upload require a separate decision.

## Acceptance criteria

1. Refresh and a new compatible app build on the same production origin retain saved profiles and related records.
2. Upgrading an existing single-profile database preserves compatible records and their original timestamps.
3. Changing the active gun does not mix or silently reassign samples, presets or results.
4. Completed sessions survive recent-detection trimming and sound-profile resets.
5. A complete backup can restore owned data without mixing guns; malformed backups cannot partially erase the current database.
6. UI wording distinguishes **Saved on this device** from any future genuinely verified cloud synchronization.
