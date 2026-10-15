# Functional requirements

Revision 1.23 · CHG-041 shared Beta disclosure / CHG-040 same-Worker named Preview correction / CHG-039 private deploy target validation / CHG-038 private Full default / CHG-037 shared page architecture / CHG-036 b/main Free and dev Full branch profiles / CHG-035 private-preview simulation / CHG-034 two-gun public edition / CHG-033 informational-page bottom navigation · 2026-10-15

CHG-027 starts [About](about.md) with email support; CHG-029 separates [Contact](contact.md) and refines the centered shared footer links in independent app screens. Suggested copy remains reviewable; broader CHG-026 implementations stay paused.

This is the single current functional index. Markdown requirements define behavior; [screen designs](../design/README.md) define layouts and provide actual visual evidence. Approval, implementation and deployment are tracked separately in the [project plan](../project/implementation-history.md).

| Specification | Authoritative scope | Current application status |
| --- | --- | --- |
| [Page layout](page-layout.md) | Shared header/main/footer/fixed navigation across all screens, safe-area/scroll/readiness guards | Implemented with reusable templates; 56 current captures and 266 browser references reviewed; final CI/publication in the delivery tracker |
| [Core](core.md) | Learning, recognition, safety, resets and navigation invariants | Implemented |
| [Branding](branding.md) | Dry Fire With Ease display name, DF / WITH EASE lockup, BETA status and shared copyright | Implemented |
| [Gun profiles](gun-profiles.md) | Names/types, up to five guns and independent owned data | Implemented, including CHG-019 Edit/type images and CHG-020 single-gun/all-owned-data deletion |
| [Drill sessions](drill-sessions.md) | Built-in/custom sequence editor, Configure / Run / Review | Implemented |
| [Practice modes](practice-modes.md) | Trigger-first learning, six modes, current run/STOP/microphone behavior | Implemented |
| [Practice start timing](practice-start.md) | CHG-022 actual microphone readiness, early Single failures and louder cue | Implemented and pushed; source CI passes, device/deployment evidence in the delivery tracker |
| [Practice improvements and input limits](practice-improvements.md) | UPDATE-01–06 and LIMIT-01–03: automatic Single, charts, unknown filtering, screen history, safety modal and complete approved bounds | Implemented |
| [Persistence](persistence.md) | Local durability, migrations, backups and ownership | Implemented: schema 3 / backup 4; compatible backups and CHG-020 separate recognition/session clearing |
| [Settings](settings.md) | Browser-backed audio preferences, themes, CHG-030 white Dark primary text and supported vibration | Implemented; physical iPhone capability checks remain separate |
| [About](about.md) | Dedicated informational screen, local-data/recognition explanation and shared informational navigation | CHG-029 implemented and browser validated; publication/promotion in the delivery tracker |
| [Contact](contact.md) | Separate email-support screen and confirmed mailto address | CHG-029 implemented and browser validated; publication/promotion in the delivery tracker |
| [Build editions](build-editions.md) | CHG-032/034 two-gun public restrictions and CHG-035 private Free/Full simulation, retained full preview, CHG-036 branch profiles, CHG-038 private Full default, CHG-040 Preview-only publishing/target validation and old-data compatibility | Explicitly authorized; implementation/testing/publication in the delivery tracker |
| [Web commercial preparation](web-commercial.md) | Contact/SEO, review, simple Free/Pro, account/cloud recovery, billing, dev/production QA and later paid candidates | Planning/analysis requested; price/allocation/providers/data policies proposed; product features not implemented; native releases deferred |

CHG-020 is implemented locally with 270 Jest / 23 suites, 16 smoke/build/assets and 16 focused browser checks passing. Updated My Guns/History designs and the architecture cover the single-gun Delete and separate clear actions; source published in [`7240e2c`](https://github.com/matosaru/dryfire/commit/7240e2c); [GitHub Actions run 38144631311](https://github.com/matosaru/dryfire/actions/runs/38144631311) completed successfully; deployment/device evidence is tracked separately. Prior corrections are published in [`aacdb18`](https://github.com/matosaru/dryfire/commit/aacdb18), with 261 Jest / 22 suites, 16 smoke/build/assets and 11 focused browser checks passing locally. Prior source baseline: [`b29837a`](https://github.com/matosaru/dryfire/commit/b29837a). Its 257 Jest tests / 21 suites, 16 smoke checks, seven browser suites / 46 checks and GitHub CI passed. Local screenshots and CI do not establish Cloudflare deployment or physical microphone accuracy.

## Interpretation and maintenance

CHG-042/043 prepares [practice-guide requirements](practice-guides.md) and [mode-specific page/animation examples](../design/proposals/practice-guides/README.md), revised with realistic timing, microphone states and a separate early-trigger failure. This is a design proposal, **not implemented**. Existing practice/sequence behavior and the twelve-screen registry remain unchanged until implementation.

- Keep stable requirement IDs; do not recycle them. A direct user instruction or explicit approval authorizes its documented scope. [Approval evidence](../project/approval-log.md) is append-only.
- Use [the change process](../project/change-process.md). Proposed assistant additions need approval before product implementation; existing approvals do not need to be requested again.
- Older delivered behavior remains in dated historical sections or [historical plans](history/chg-014-approved-plan.md), with explicit current overrides. It does not supersede current bounds or automatic Single behavior.
- [Site architecture](../architecture/site-tree.md) maps every functional screen/state to its specification and design. Update all affected documents together and run the documentation checks.
- Approval labels: **approved**, **requested**, **proposed**, **deferred**. Delivery labels: **not implemented**, **partial**, **implemented**. Report tests, push, deployment and device verification separately.

## Deferred scope

CHG-026 moves one-gun commercial limits, accounts/cloud recovery and later synchronization into the requested planning/analysis roadmap; the final rules and backend implementation remain proposed/unimplemented. Sharing, new gun-type sounds and camera/sensor movement analysis are later paid candidates. Raw-audio/video upload is not authorized. Native iPhone/Android release is explicitly deferred. CHG-019/020 resets/deletion remain implemented. CHG-027/029 start separate About and Contact screens inside the app; public Contact/SEO routes and production metadata remain unimplemented. CHG-032/034 explicitly starts the temporary two-gun public edition and retained full preview; other commercial implementations remain paused.
