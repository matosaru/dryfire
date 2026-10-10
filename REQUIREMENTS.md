# Product requirements and designs

This is the permanent entry point for Dry Fire Sound Trainer requirements. Read it before changing product behavior, navigation, persistence or designs.

The authoritative specifications live in [docs/requirements](docs/requirements/README.md). The [design catalog](docs/design/README.md) links the current visualisations and their recorded approval state.

| Specification | Scope | Current state |
| --- | --- | --- |
| [Core behavior](docs/requirements/core.md) | Existing sound learning, recognition, safety, resets, navigation and production delivery | Existing behavior to preserve |
| [Gun profiles](docs/requirements/gun-profiles.md) | First visit, gun names/types, up to five guns and separate training data | User-approved flow; implementation pending |
| [Drill sessions](docs/requirements/drill-sessions.md) | Select/create, configure, start, progress and saved results | Requested scope; detailed interaction proposals in review |
| [Data persistence](docs/requirements/persistence.md) | Refresh/deployment persistence, migration and backups | Persistence requested; cloud synchronization unapproved |
| [Settings](docs/requirements/settings.md) | Noise Filter, Auto Gain, Appearance and Vibration Feedback | Requested; detailed behavior still proposed |

## Approval and change control

- Follow the [requirements change process](docs/requirements/change-process.md).
- Record approvals and revisions in the append-only [approval log](docs/requirements/approval-log.md).
- Keep specifications and linked designs in Git. Link an immutable commit when recording approval of a design revision.
- A requirement can be approved without being implemented. A mockup can be published without its proposed details being approved.
- Previously granted approval remains valid for its recorded scope. Do not request it again unless that scope changes.
- New assistant-proposed product requirements must be documented and approved by the user before implementation. A specific direct instruction from the user can supply that approval; record it accurately.

The one-gun free-version limit is explicitly deferred. Accounts, cloud synchronization, raw-audio storage and new sound categories are not implicitly authorized by the current designs.
