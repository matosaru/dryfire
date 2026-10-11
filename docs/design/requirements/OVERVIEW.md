# Product requirements and designs

This is the permanent entry point for Dry Fire With Ease requirements. Read it before changing product behavior, navigation, persistence or designs.

The authoritative specifications live in [requirements specifications](README.md). The [design catalog](../README.md) links the current visualisations and their recorded approval state.

The [implementation history and remaining plan](../implementation-history.md) tracks delivery after each request, separately from approval and deployment.

| Specification | Scope | Current state |
| --- | --- | --- |
| [Core behavior](core.md) | Existing sound learning, recognition, safety, resets, navigation and production delivery | Existing behavior to preserve |
| [Branding](branding.md) | Dry Fire With Ease display name and existing DF logo extended with WITH EASE | Approved; implemented and locally validated; deployment not verified |
| [Gun profiles](gun-profiles.md) | First visit, gun names/types, up to five guns and separate training data | Approved; implemented and locally validated; deployment unverified |
| [Drill sessions](drill-sessions.md) | Select/create, configure, start, progress and saved results | Approved; custom presets/timed sessions/results implemented and locally validated; deployment unverified |
| [Data persistence](persistence.md) | Refresh/deployment persistence, migration and backups | Multi-gun/session storage and version-4 backups with compatible formats 1–3 implemented; cloud unapproved |
| [Settings](settings.md) | Noise Filter, Auto Gain, Appearance and Vibration Feedback | Approved; implemented and locally validated; physical-device/deployment verification separate |
| [Trigger-first practice](practice-modes.md) | Optional non-trigger sounds, rejection calibration and all six practice modes | CHG-015 authorized and implemented; release evidence in implementation history; production/device verification separate |

## Approval and change control

- Follow the [requirements change process](change-process.md).
- Record approvals and revisions in the append-only [approval log](approval-log.md).
- Keep specifications and linked designs in Git. Link an immutable commit when recording approval of a design revision.
- A requirement can be approved without being implemented. A mockup can be published without its proposed details being approved.
- Previously granted approval remains valid for its recorded scope. Do not request it again unless that scope changes.
- New assistant-proposed product requirements must be documented and approved by the user before implementation. A specific direct instruction from the user can supply that approval; record it accurately.

The one-gun free-version limit is explicitly deferred. Accounts, cloud synchronization, raw-audio storage and further sound taxonomies are not implicitly authorized. CHG-015 explicitly adds optional derived reset/noise/cue calibration; it does not change the four positive action identifiers.
