# Persistence, migration and backups

Revision: 1.0 · Scope: refresh/deployment durability requested · Implementation: existing single-profile storage; multi-gun storage pending

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

## Cloud recovery is not yet approved

Accounts, authenticated cloud backup, cross-device synchronization and server-side data storage remain proposed scope. If requested, document identity/ownership, access checks, offline synchronization, conflicts, recovery and deletion before implementation. Workers plus D1 is a possible architecture, not an approved requirement. Raw-audio retention and upload require a separate decision.

## Acceptance criteria

1. Refresh and a new compatible app build on the same production origin retain saved profiles and related records.
2. Upgrading an existing single-profile database preserves compatible records and their original timestamps.
3. Changing the active gun does not mix or silently reassign samples, presets or results.
4. Completed sessions survive recent-detection trimming and sound-profile resets.
5. A complete backup can restore owned data without mixing guns; malformed backups cannot partially erase the current database.
6. UI wording distinguishes **Saved on this device** from any future genuinely verified cloud synchronization.
