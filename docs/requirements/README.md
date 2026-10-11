# Functional requirements

Revision 1.7 · CHG-018 documentation reorganization · 2026-10-11

This is the single current functional index. Markdown requirements define behavior; [screen designs](../design/README.md) define layouts and provide actual visual evidence. Approval, implementation and deployment are tracked separately in the [project plan](../project/implementation-history.md).

| Specification | Authoritative scope | Current application status |
| --- | --- | --- |
| [Core](core.md) | Learning, recognition, safety, resets and navigation invariants | Implemented |
| [Branding](branding.md) | Dry Fire With Ease display name and DF / WITH EASE lockup | Implemented |
| [Gun profiles](gun-profiles.md) | Names/types, up to five guns and independent owned data | Implemented, with CHG-019 Edit/type-image correction |
| [Drill sessions](drill-sessions.md) | Built-in/custom sequence editor, Configure / Run / Review | Implemented |
| [Practice modes](practice-modes.md) | Trigger-first learning, six modes, current run/STOP/microphone behavior | Implemented |
| [Practice improvements and input limits](practice-improvements.md) | UPDATE-01–06 and LIMIT-01–03: automatic Single, charts, unknown filtering, screen history, safety modal and complete approved bounds | Implemented |
| [Persistence](persistence.md) | Local durability, migrations, backups and ownership | Implemented: schema 3 / backup 4; older compatible backups supported |
| [Settings](settings.md) | Browser-backed audio preferences, themes and supported vibration | Implemented; physical iPhone capability checks remain separate |

Prior published source baseline: [`b29837a`](https://github.com/matosaru/dryfire/commit/b29837a). Its 257 Jest tests / 21 suites, 16 smoke checks, seven browser suites / 46 checks and GitHub CI passed. Local screenshots and CI do not establish Cloudflare deployment or physical microphone accuracy.

## Interpretation and maintenance

- Keep stable requirement IDs; do not recycle them. A direct user instruction or explicit approval authorizes its documented scope. [Approval evidence](../project/approval-log.md) is append-only.
- Use [the change process](../project/change-process.md). Proposed assistant additions need approval before product implementation; existing approvals do not need to be requested again.
- Older delivered behavior remains in dated historical sections or [historical plans](history/chg-014-approved-plan.md), with explicit current overrides. It does not supersede current bounds or automatic Single behavior.
- [Site architecture](../architecture/site-tree.md) maps every functional screen/state to its specification and design. Update all affected documents together and run the documentation checks.
- Approval labels: **approved**, **requested**, **proposed**, **deferred**. Delivery labels: **not implemented**, **partial**, **implemented**. Report tests, push, deployment and device verification separately.

## Deferred scope

One-gun free-tier enforcement, accounts/cloud synchronization, cross-device recovery, raw-audio storage and camera/sensor movement analysis remain deferred or unapproved. CHG-019 authorizes explicit whole-library reset, while individual gun deletion remains proposed. The SEO package is a prepared proposal; public pages/routes and production metadata have not been added by this documentation update.
