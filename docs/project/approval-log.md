# Requirements approval log

Recorded: 2026-10-10. This initial ledger records available conversation evidence and deliberately separates feature requests, design approval and implementation.

## CHG-001 — Reference design and existing behavior

- Scope: CORE-01 through CORE-13; existing behavior and requested reference-design update.
- Evidence: user requested **“update program with new design”** and supplied the logo/navigation/animations/reset/data-preservation change list.
- Implementation: reference-design update and Cloudflare preview configuration are on `main`; see [DESIGN_CHANGES.md](../development/DESIGN_CHANGES.md) for observed validation. Native/device microphone verification is not established.

## CHG-002 — Dedicated drill sessions

- Scope: DRILL-01 through DRILL-06.
- Evidence: user requested select/create, editable configuration, Start, fixed/random timing, completed/left counts and stored information after each completed drill. The user later said **“I love the designs”** before requesting the gun-profile additions.
- State: feature scope requested; the visual direction received positive feedback. Finer behaviors in the proposed-interaction section of [drill-sessions.md](../requirements/drill-sessions.md) remain open rather than being inferred as approved.
- Implementation: partial existing built-in recognition; custom editor and dedicated session runner not implemented.

## CHG-003 — Multi-gun flow

- Scope: GUN-01 through GUN-09 and requested same-device persistence.
- Evidence: user requested gun names, **Handguns**, **Rifles and Carbines**, **Shotguns**, up to five guns, separate sounds/drills and retained data; then explicitly said **“approve, but now review”** after receiving the multi-gun mockups.
- State: multi-gun flow approved; implementation pending. Extra engineering proposals and cloud services are not automatically approved product scope.
- Reviewed snapshots: [first visit/library/Home](https://github.com/matosaru/dryfire/blob/953319d/docs/design/multiple-guns-front-door.png), [sounds/editor/history](https://github.com/matosaru/dryfire/blob/953319d/docs/design/multiple-guns-sounds-drills-history.png).

## CHG-004 — Show the sequence once

- Scope: DRILL-07, design revision at commit `3f90e38`.
- Evidence: user said the sequence was repeated in the title and buttons and instructed **“Leave only one”**.
- State: requested revision authorized by direct instruction; reflected in the published mockup. Title is Drill Session and the full sequence appears once in its strip.
- Snapshot: [revised drill mockup](https://github.com/matosaru/dryfire/blob/3f90e38/docs/design/drill-session-mockup.png).

## CHG-005 — Optional start sound clarification

- Scope: proposed Sound at start toggle semantics in DRILL specification revision 1.0.
- Evidence: user asked the purpose of the unclear Start cue toggle. The assistant proposed a beep-only toggle, renamed Sound at start, while visual countdown/GO remain present. The user authorized uploading the design and documenting requirements.
- State: revised mockup publication authorized; beep semantics remain **Proposed / awaiting explicit confirmation**. Do not claim that uploading the image approved every proposed interaction.
- Snapshot: [published clarification](https://github.com/matosaru/dryfire/blob/3f90e38/docs/design/drill-session-mockup.png).

## CHG-006 — Additional settings and deferred scope

- Scope: SET-01 through SET-05, custom presets; future free-plan restriction.
- Evidence: user requested working Noise Filter, Auto Gain, Appearance and Vibration Feedback **“after a publish”**. The user explicitly deferred the free-version one-gun restriction to later iterations.
- State: settings requested; detailed defaults, theme options and feedback triggers remain proposed. Publication sequencing and implementation have not been established by the current documentation task.
- Accounts, cloud synchronization, D1 and raw-audio retention remain unapproved options, not requirements.

## CHG-007 — Permanent specifications and approval workflow

- Scope: requirements index, design catalog, Markdown specifications and future change process.
- Evidence: user instructed **“specify all the requirements in .md files”**, keep designs/specifications **“sticky”**, and ensure changed requirements are **“approved and specified in md. files”**.
- State: directly authorized documentation/workflow change. Established at specification revision 1.0; future approvals must append a change record rather than being fabricated or backdated.
- Implementation: repository documentation and agent instructions updated; no application functionality is introduced by this change.

## CHG-008 — Start sound approved

- Date: 2026-10-10.
- Scope: DRILL-09 and drill specification revision 1.1; confirms the clarification originally proposed in CHG-005.
- Evidence: the user explicitly said **“Sound at start is ok.”**
- State: **Approved**. On plays a short beep when GO appears; off is silent. Visual countdown and GO remain visible in both modes.
- Implementation: specification and existing mockup agree; application functionality is not implemented by this documentation change. Other proposed session details retain their existing approval states.

## CHG-009 — Consolidated documentation location

- Date: 2026-10-10.
- Evidence: the user instructed that all documentation be in **docs/design**.
- State: directly authorized organization change. Full documentation and specifications are consolidated under `docs/design/`, including `requirements/` and `development/`. Root README, AGENTS and REQUIREMENTS are short discovery links.
- Implementation: links and agent instructions updated. Historical approval evidence is retained; moving files does not imply new approval of their proposals.

## CHG-010 — Design provenance and originality review

- Date: 2026-10-10.
- Evidence: the user requested confidence that the design was not taken from another app and was unique, then reported the original reference was generated by ChatGPT in another project conversation; its earlier sources are unknown.
- State: provenance investigation and documentation requested. No claim of exclusive originality or legal clearance is established, and no replacement branding or visual redesign has been approved.
- Implementation: [originality and provenance record](../design/originality-and-provenance.md) documents known sources, asset groups, uncertainty and limits. The user-reported reference source is recorded without publishing the private conversation URL.

## CHG-011 — Dry Fire With Ease display branding

- Date: 2026-10-10.
- Affected requirements: BRAND-01 through BRAND-05 in [branding.md](../requirements/branding.md) revision 1.0; CORE-02 in [core.md](../requirements/core.md) revision 1.1.
- Previous behavior: Dry Fire / DRYFIRE header and lockup, with Sound Trainer as a descriptor.
- Approved behavior: canonical name **Dry Fire With Ease**; retain the existing orange/white DF monogram and include **WITH EASE** in the logo lockup. Use the full display name in app branding, About, accessible labels, installation metadata and native appName. Preserve storage, backup and deployment identifiers and the reviewed historical designs.
- Evidence: the user explicitly instructed **“no, lets leave dry fire with ease, just update logo to have this with ease, and all other places , where dry fire as a brand is used in an app”**.
- State: **Approved** by direct instruction. No repeated approval is required for this scope. The earlier proposed coined names are not adopted; no legal-clearance claim follows from retaining or extending the existing name.
- Design record: [canonical DF monogram](../../public/logo.svg) and [branding specification](../requirements/branding.md). The request authorizes the specific wording extension; historical mockup monogram variants remain illustrative.
- Acceptance criteria: complete brand in visible/accessibility/installation/native labels, readable narrow-screen header, and unchanged persisted data and application identity; see BRAND-01 through BRAND-05.
- Implementation: pending. Record completed changes and observed validation separately after implementation.

### CHG-011 implementation update — 2026-10-10

- State: **Implemented and locally validated**; the approval and exact evidence above remain unchanged.
- Final design: [actual production header](../design/archive/chg-011/brand/lockup.png), including Settings, and [Home screenshot](../design/archive/chg-011/home/overview.png). The full lockup combines the existing SVG monogram with the accessible HTML wordmark in `index.html` and `src/styles.css`; the SVG alone remains the monogram.
- Updated app/header/accessible/About/installation/native display branding and backup filename, preserving the existing database, backup format, app/package and deployment identities.
- Observed validation: 16 smoke checks, 48 Jest tests, build and `verify:dist` passed. Chromium checked branding/metadata and header layout at 320, 375, 390, 430, 768 and 1280 px. Existing-format backup import/export passed; seeded learned profiles, history and settings remained exactly unchanged after an explicitly registered local service-worker v9-to-v10 cache update and reload.
- Limits: Cloudflare deployment, browser/OS installation on real devices and signed native release are not verified. See [branding.md](../requirements/branding.md) for build-size evidence and refresh guidance.

## CHG-012 — Implement approved multi-gun flow and gun-owned presets

- Date: 2026-10-10.
- Affected requirements: GUN-01 through GUN-09, DATA-01 through DATA-03 and DRILL-06; gun profiles revision 1.1, persistence revision 1.1 and drill sessions revision 1.2.
- Previous behavior: published multi-gun mockups/specifications only; the application still has one shared learned model/history and no custom preset editor. Branding implementation did not implement gun profiles.
- Approved implementation scope: first-use name/type entry, five-gun library, selected-gun Home/switcher, independently owned learned sounds/custom presets/recognition history, remembered selection and compatible same-origin persistence. Implement the previously requested custom action-sequence editor with saved presets for the selected gun. Preserve built-in drills and the explicit safety-gated recognition flow.
- Approval evidence: reuse the explicit **“approve, but now review”** multi-gun approval recorded in CHG-003 and the earlier instruction **“Custom drills need a sequence editor and saved presets.”** The latest user reported **“i do not see any changes, with multiple guns support”**, then explicitly instructed **“proceed with implementation.”** These are evidence to deliver existing scope, not approval of unrelated proposals.
- Engineering record: database version 2 retains the existing database name; transactionally migrate legacy records into a gun needing user-supplied details; preserve record IDs/features/timestamps; capture gun ownership when recording/listening starts and require stopping before switching; version-2 whole-library backups retain compatible version-1 import support. See [persistence.md](../requirements/persistence.md) for the concrete plan and validation expectations.
- Reviewed design snapshots: [first visit/library/Home](https://github.com/matosaru/dryfire/blob/953319d/docs/design/multiple-guns-front-door.png) and [sounds/editor/history](https://github.com/matosaru/dryfire/blob/953319d/docs/design/multiple-guns-sounds-drills-history.png). No visual redraw is needed because this work implements the already approved flow with the separately approved current branding. Mockup session screens do not imply that the pending session runner is included.
- Excluded scope: profile deletion, free-plan one-gun cap, cloud synchronization, additional sound types, dedicated session countdown/fixed/random timing/repetition summaries and advanced browser settings. Finer session defaults/interruption rules retain their proposed status.
- Implementation state: **In progress**. Baseline, regression checks, final implementation, GitHub push and Cloudflare deployment must be recorded as they are observed; approval does not establish completion.

### CHG-012 baseline — 2026-10-10

- Observed before application changes: 16 smoke checks, 48 Jest tests, production build and `verify:dist` passed.
- Baseline main bundle sizes (raw): HTML 18.29 kB, CSS 24.25 kB, JavaScript 37.88 kB. Final sizes and checks remain to be recorded.
- Routine validation for the implementation: trimmed gun/preset names 1–80 characters; custom sequences 1–32 known actions, repeated actions allowed; no silently selected gun type. These limits validate forms and imports rather than changing the deferred product-plan restrictions.

### CHG-012 source-validation update — 2026-10-10

- The source suite now passes 16 smoke checks, 100 Jest tests across 8 suites, production build and `verify:dist` after regression/edge-case checks.
- Main output sizes before → after (raw / gzip kB): HTML 18.29 / 5.21 → 23.48 / 6.36; CSS 24.25 / 6.21 → 31.42 / 7.65; JavaScript 37.88 / 12.70 → 55.48 / 17.66. Worklet 0.53 kB, service worker 1.34 kB and detector chunk 1.59 kB remain unchanged in size.
- Browser verification in progress has observed exact migration preservation of 12 compatible examples, 2 verified events, IDs/features/timestamps/drill metadata and retention setting 42, plus local service-worker v10-to-v11 update. Final browser acceptance, GitHub publication and Cloudflare deployment remain to be recorded separately.

## CHG-013 — Implementation history and remaining plan

- Date: 2026-10-10.
- Evidence: the user explicitly requested **“create implementation history plan, in which i will see what is done, what is not yet done”** and **“clear understanding on what was done and what is remaining after my each request.”**
- State: **Approved** by direct instruction. Create and maintain [implementation-history.md](implementation-history.md) as the authoritative delivery tracker, linked from repository/documentation entry points.
- Acceptance: show concise per-request history, current completed/in-progress/pending scope and an ordered remaining plan; distinguish requirement approval, code completion, tests, GitHub publication and deployment. Record observed evidence and limitations without presenting mockups as working features.
- Implementation: documentation tracker and ongoing agent maintenance rule added; current multi-gun work remains in progress until observed validation and publication are recorded.

### CHG-012 implementation update — 2026-10-10

- State: **Implemented and locally validated**. The existing approvals above are unchanged; GitHub publication and Cloudflare deployment remain separate.
- Delivered: first-use name/type, five-gun library/switcher, independently owned learned models/recognition history/settings, remembered selection, saved custom sequence editor, non-destructive schema-2 migration and validated version-2 whole-library backups with version-1 restore. The package remains version 0.8.0; service-worker cache is v11.
- Final source verification: 16 smoke checks, 100 Jest tests across 8 suites, production build and `verify:dist` passed. Build-size evidence is in [implementation history](implementation-history.md).
- Final browser verification: previous cached schema-1 app upgraded to schema 2/cache v11 without losing exact IDs, timestamps, compatible features, verification labels or drill metadata for 12 examples and 2 events; retention 42 remained intact. First-gun validation, exact types, five-profile cap, cancel/reload/selection, gun-owned model/history/preset/settings isolation, ordered/repeated-action custom editing and clearing stale drafts on switch/import passed.
- Actual UI backup download/version-2 exact library restoration, version-1 compatible restoration/details prompt and malformed-owner import rejection without partial data replacement passed. Selected-sound/full-selected-gun resets preserve other guns/history/presets; history trimming/clearing affects only its owning gun.
- No page errors or horizontal overflow were observed at 320, 390 and 768 px. Synthetic Chromium microphone checks confirmed pending/active switch blocking, released tracks after Stop and released late-arriving permission streams after leaving the view. This does not verify a physical microphone, iPhone/Android recognition accuracy or a signed native build.
- Actual production-build captures: [first gun](../design/archive/chg-012/gun-setup/create.png), [library](../design/archive/chg-012/guns/library.png), [Home](../design/archive/chg-012/home/overview.png), [custom editor](../design/archive/chg-012/drills/custom-editor.png). These supplement the immutable approved mockups; they are local captures, not deployment proof.
- Remaining: dedicated timed sessions/countdown/GO/beep/repetition progress/results, advanced browser settings and their unresolved defaults, deferred free-plan cap and unapproved cloud recovery/profile deletion/new sound taxonomies. No additional proposal is marked approved by completing this implementation.

### CHG-013 implementation update — 2026-10-10

- State: **Documentation implemented**. The tracker includes per-request history, current done/pending feature table, source/browser evidence and an ordered remaining plan. Entry points and repository agent rules link it and require future request outcomes to be maintained.
- Publication is pending until an observed push is appended. Deployment remains unverified; this ledger does not infer it from code completion or tests.

### CHG-012/013 publication update — 2026-10-10

- State: **Published to GitHub `main`** in [`b19aa4d`](https://github.com/matosaru/dryfire/commit/b19aa4d). The push completed successfully and a subsequent remote-head check returned `b19aa4d132ba1bebd8daa69a095fedfdb7da13dc` for `refs/heads/main`.
- Includes the multi-gun implementation, custom editor, migration/backups, tests, actual local screenshots, specifications and implementation-history tracker. This publication update records observed delivery; it introduces no product-scope change.
- Cloudflare deployment remains unverified and is checked separately using the public URL supplied by the user: `https://dryfire.matosaru.workers.dev`.

### CHG-012 deployment-verification attempt — 2026-10-10

- Read-only HTTPS and fresh Chromium access to the supplied public URL were blocked by the execution network gateway before app content arrived (HTTP 403 / `ERR_TUNNEL_CONNECTION_FAILED`). GitHub Actions API access was also blocked. This does not establish a Cloudflare or site failure.
- State remains **Deployment unverified**. Check a successful Cloudflare production deployment containing `b19aa4d`. Expected assets are `index-CKkKtMnK.js`, `index-BLoJorSS.css`, and service-worker cache `dryfire-sound-trainer-v11`; no real user site data was cleared.

## CHG-014 — Timed sessions and working settings

- Date: 2026-10-10. Affected requirements: DRILL-01–05, DRILL-07–09, DATA-01–04 and SET-01–05.
- Evidence: after confirmation that multi-gun implementation was delivered and timed sessions/settings remained pending, the user instructed **“proceed with next steps”**.
- Requested implementation scope: the existing timed-session/results/start-beep and working-settings requirements. Existing approvals, including CHG-008 beep semantics, remain valid.
- Concrete proposal: [next-implementation.md](../requirements/history/chg-014-approved-plan.md), revision 1.0, resolves the explicitly open defaults, automatic progression, interruption/resume policy, saved review, settings ownership/options/triggers and cue guard. It retains the reviewed three-state visual direction.
- State: requested scope authorized; **assistant-proposed detailed choices awaiting confirmation** under the user's approved change process. Do not infer approval of this revision from the general request to proceed.
- Baseline: dependency installation, 16 smoke checks, 100 Jest tests, production build and `verify:dist` passed before code changes. Baseline main sizes (raw / gzip kB): HTML 23.48 / 6.36, CSS 31.42 / 7.65, JavaScript 55.48 / 17.66.
- Implementation: not started for the proposed choices; read-only integration/storage reviews complete. GitHub publication and deployment are separate observed states.

### CHG-014 proposal-publication update — 2026-10-10

- Proposal revision 1.0 is published in [`ebac22b`](https://github.com/matosaru/dryfire/blob/ebac22b/docs/design/requirements/next-implementation.md). Push success and the remote `main` head were observed. All 174 local links across 26 Markdown documents resolved.
- A single bundled confirmation was requested for the still-proposed detailed choices; no answer has been received. Existing feature/beep approvals are retained and not requested again.
- Read-only session-logic, data migration/backups, UI and browser-capability reviews were prepared. No application code was changed pending the required confirmation of new proposed behavior.
- A fresh Chromium visit to the supplied live URL was again blocked before app content arrived (`ERR_TUNNEL_CONNECTION_FAILED`). Deployment remains unverified; no real user site data was touched.

### CHG-014 approval confirmation and implementation start — 2026-10-10

- Approval evidence: after the assistant published [revision 1.0 in `ebac22b`](https://github.com/matosaru/dryfire/blob/ebac22b/docs/design/requirements/next-implementation.md) and requested confirmation of its detailed choices, the user explicitly replied **“proceed”**. This approves that exact proposal; earlier pending entries remain historical evidence and are not rewritten.
- State: **Approved; implementation in progress**. Drill specification revision 1.3, settings revision 1.1 and persistence revision 1.2 incorporate the concrete choices. No new confirmation is needed for unchanged approved scope.
- Approved session behavior: Configure/Run/Review, one sequence strip, default 10 repetitions/fixed 3 seconds/random 2–5 seconds, validated 1–100 repetitions and 0–30-second delays in tenths, microphone-before-countdown, fresh delay per repetition, one-second result display, pause/abort partial attempt/release mic/fresh-countdown resume, accurate interruption recovery/review, durable owned snapshots and approved Off-by-default start beep with a disclosed 300 ms cue guard.
- Approved settings: per-gun Off-by-default Noise Filter/Auto Gain applied on next capture with supported/track-confirmed reporting and echo cancellation off; device-wide Dark/Light/System appearance, Dark initially; device-wide Off-by-default vibration requested at GO/completion only when supported. Samples are preserved when settings change.
- Engineering record: same database identity, schema 3 adds an owned sessions store, revisioned serialized durable snapshots and owning-gun read guards; backup version 3 includes sessions/preferences and accepts versions 1/2. Replacement confirmation discloses that older backups have no sessions. Validate the whole payload before atomic replacement; no automatic session trimming.
- Design: preserve the reviewed [Configure/Run/Review mockup](https://github.com/matosaru/dryfire/blob/3f90e38/docs/design/drill-session-mockup.png) and current brand. The approved published plan contains the clarified text/control layout; no unrelated visual redraw or monogram change is introduced.
- Baseline repeated after confirmation: dependency installation, 16 smoke checks, 100 Jest tests, production build and `verify:dist` passed. Main raw/gzip kB unchanged: HTML 23.48/6.36, CSS 31.42/7.65, JavaScript 55.48/17.66.
- Excluded scope remains free-plan cap, gun deletion, new sound taxonomy, cloud/accounts/raw audio and signed native releases. Final code, tests, GitHub publication, production deployment and physical-device verification remain separately recorded outcomes.

### CHG-014 resumed implementation/status update — 2026-10-11

- The user requested status and instructed continuation after work was interrupted by the session usage limit. This resumes the already approved revision 1.0; it does not change defaults/scope or require approval again.
- State: **Approved; implementation in progress**. Local session/settings/storage/audio/UI components and regression checks are partially written, but end-to-end integration/final acceptance/publication are incomplete. The earlier passing baseline is not reported as final validation of these changes.
- Remaining delivery work: finish integration, verify durable sessions and compatible migrations/backups, run final source/build/browser capability/layout checks, then record observed GitHub publication separately. Cloudflare and real-device verification remain unverified until evidence is available.

### CHG-014 storage-component update — 2026-10-11

- Schema 3 adds the separate owned sessions store and stable read/write/recovery APIs, strict snapshot/revision validation, immutable configuration/completed-attempt history and durable interrupted-session recovery. No session trimming or deletion is added; sound/history resets preserve results.
- Version-3 backups include sessions/global/per-gun preferences; versions 1/2 remain accepted with no sessions and validated atomic replacement. Version-1 restore preserves unrelated current global preferences; versions 2/3 restore the backed-up globals.
- 59 targeted storage checks pass, including snapshots from the actual session engine for GO/completion/pause/resume/out-of-order/unknown/microphone failure/recovery/import. This is component validation; final application integration, browser acceptance and publication remain pending.

### CHG-014 storage regression extension — 2026-10-11

- Two further malformed-completion/detection/split-proof regressions were added and passed. The final targeted storage count is **61**, including actual session-engine interoperability. The earlier 59-check record remains the observed intermediate result; broad-suite/browser delivery is still tracked separately.

### CHG-014 integrated-candidate source validation — 2026-10-11

- The approved session/settings/storage/audio/UI components are integrated in the local candidate. It passes **16 smoke checks, 186 Jest tests across 13 suites, production build and `verify:dist`**; diff whitespace checks pass.
- Five new expected-failing ownership regressions preceded the fix and now pass, preventing delayed owned writes from creating records for a gun removed by whole-library replacement. This does not add profile deletion as a product feature.
- Candidate schema/backup/cache versions are 3/3/v12; package remains 0.8.0. Current sizes/assets and actual local screenshots are recorded in [implementation history](implementation-history.md) and the [catalog](../design/README.md).
- Initial browser session/settings/cue checks pass, but final preservation/race/current-production-bundle acceptance remains in progress. No final acceptance, GitHub implementation publication, physical-device or Cloudflare deployment claim is established by this source-validation update.

### CHG-014 final implementation/local acceptance — 2026-10-11

- State: **Implemented and locally validated**. Existing approval evidence and earlier partial/pending records remain unchanged; no CHG-014 feature is intentionally left unimplemented.
- Delivered the exact approved session/settings plan: Configure/Run/Review, fixed/random per-repetition timing, readiness/Start/countdown/GO, completed/left progress, guarded optional beep, pause/reacquire/resume/interruption, durable gun-owned repetition review and compatible version-3 backups, per-gun next-capture Noise Filter/Auto Gain, device-wide Dark/Light/System and optional supported GO/completion vibration.
- Final source/build verification: **16 smoke checks and 186 Jest tests across 13 suites**, production build, `verify:dist` and diff checks pass. The total is 202 source checks; [implementation history](implementation-history.md) records exact final sizes/assets. Schema 3, backup 3 and cache v12 retain package version 0.8.0 and the existing database/deployment identities.
- **Six final-browser acceptance suites pass with zero page errors** against `index-7Rq6OCKv.js`: sessions; settings/cue/capability fallbacks; preservation/backups; interruption/storage-failure races; database/cache migration; random timing/readiness/microphone failures. Synthetic PCM traverses actual segmentation/classification rather than bypassing the recognizer.
- Observed ordered completions, unknown/out-of-order handling, pause/resume partials, refresh recovery, fresh bounded random countdowns, captured-time beep guard, microphone disconnect/denial and untrained-gun own-Learn routing pass. Slow/pending capture cancellation and forced storage failure/Retry pass; saved configuration/history/results stay owned by the selected gun.
- Actual IndexedDB schema-2-to-3 upgrade preserves existing IDs/values; controlled cache-v11-to-v12 refresh preserves local data. Version-1/2/3 restoration, atomic invalid import rejection, immutable preset snapshots and session preservation through sound/history resets pass. Browser preference/theme/capability states and vibration success/false/absent-API paths pass.
- Final screenshots are real local production-build captures: [Configure](../design/archive/chg-014/session/configure.png), [Run](../design/archive/chg-014/session/active.png), [Review](../design/archive/chg-014/session/review.png), [Dark settings](../design/archive/chg-014/settings/overview.dark.png), [Light settings](../design/archive/chg-014/settings/overview.light.png). They were visually checked and retain the approved layout/brand; no new external artwork was added.
- GitHub implementation push is pending; append its observed commit/publication afterward. Cloudflare verification remains blocked by the execution gateway: a new 2026-10-11 request returned HTTP 403 before production app content arrived. This is an access limit, not a site-failure conclusion.
- Physical microphone/recognition accuracy, audible beep, physical vibration and signed native release remain unverified. Next steps are observed publication/production-commit verification and real-device validation; free-plan cap/cloud/profile deletion/new taxonomies remain deferred or unapproved separate scope.

### CHG-014 publication update — 2026-10-11

- State: **Published to GitHub `main`** in [`6119b8f`](https://github.com/matosaru/dryfire/commit/6119b8f). `git push origin HEAD:main` completed successfully, and the subsequent remote-head check returned `6119b8fd86c6538f85d2a89d6a16df5f370ab8ba` for `refs/heads/main`.
- Includes the approved timed sessions, durable repetition review, schema/backup compatibility, working settings, regression checks, final implementation screenshots and synchronized requirements/history. The user previously instructed direct merging without a PR; that existing authorization was retained.
- This records observed publication and introduces no product-scope change. Cloudflare production deployment and physical-device verification remain unverified; no user site data was cleared.

### CHG-014 production/device verification follow-up — 2026-10-11

- Evidence: after implementation/publication was confirmed and production/device checks identified as remaining, the user instructed **“proceed”** and selected **“iPhone — Safari / Home Screen app”** for device validation. This continues existing approved scope; it authorizes no deferred free-plan/cloud feature or product-default change.
- Read-only HTTPS checks for production and GitHub build status failed with workspace CONNECT gateway 403 before destination content arrived. Existing Git authentication works; remote `main` was observed at `41a3b2b62561fadaa57d3b134c7925cd5505df6c`. No credential values were printed and no real app storage was changed.
- Added the [iPhone release checklist](../development/IPHONE_RELEASE_CHECKS.md), linked it from deployment/installation/accuracy/documentation entry points and updated the delivery tracker. Existing source/browser acceptance remains completed; these documentation changes do not supply production or physical-device evidence.
- Cloudflare production status/commit was requested. iPhone microphone, audible cue and physical feedback checks remain Not run until actual observations arrive. Network allowlist contents are unavailable, so they were not replaced; required additive destinations are recorded in the checklist.

## CHG-015 — Optional non-trigger sounds and six practice modes

- Date: 2026-10-11. Affected IDs: CORE-03/04/07/09/10/12, DRILL-01/03/05/08/09, DATA-01–04, PRACTICE-01–13. Specification: [practice-modes.md](../requirements/practice-modes.md), consolidated revision 1.1.
- Evidence: the user requested **“other sounds then trigger pull recognition to be optional”** and **“all the practice modes”** based on the supplied analysis. Initially described as later work, it is now authorized for execution by **“adjust the final plan, try to optimise the steps”** and **“after plan is adjusted, proceed with next steps… stop confirming each step, do all steps automatically, i will verify final changes in an app and give a feedback.”**
- State: **Authorized for automatic implementation**. Record concrete engineering choices/defaults/design in revision 1.1 before source edits; the user's explicit instruction supersedes per-step confirmation for this plan. Do not infer authorization for excluded cloud/free-cap/camera/gun-deletion scope.
- Before/after: current app needs all four positives and a competing-class model. The target supports trigger-only readiness with distance/rejection evidence, optional other classes, all six measured modes and optional calibrated external cues, while retaining existing sequences/data/history and acoustic limitations.
- Optimized plan: shared recognition/readiness/calibration, then one practice engine/UI/portable-record/backups integration for all modes, then regression/browser/mobile-layout validation and direct-main publication. Production and physical-device evidence remain separately pending.
- Implementation state: in progress; repeated baseline dependency/smoke/Jest/build/asset verification is required before source edits. No implementation/publication/device success is inferred from approval.

### CHG-015 completed implementation and local acceptance — 2026-10-11

- State: **Implemented and locally validated** under the recorded revision 1.1 automatic-work authorization. No further step approval is pending; the user will review the final app. Earlier approval/in-progress records remain historical evidence.
- Delivered trigger-only readiness, optional other action classes and gun-owned recognition controls; distance-based single-class rejection plus optional reset/noise/cue features; all six modes using one engine/controller and shared audio/cue/preferences; selected-event reload and optional calibrated external-beep start. Trigger control measures detected intervals, with no movement/aim grading.
- Preserved legacy positive identifiers, models, built-in/custom sequences, old session records and schema 3/feature version 2. Backup format 4 contains old/new results/calibration/preferences and accepts compatible formats 1–3; invalid imports are rejected atomically. Full sound reset clears only the selected gun's positive/rejection/cue samples and preserves results/other guns.
- Recorded fixes for rapid double Next, overlapping capture cancellation, portable outcome/timestamp validation, accessible unsaved Review/Retry and audio cue gating that preserves later event feature frames. Regression tests failed before the corresponding fixes.
- Baseline dependency/16-smoke/186-Jest/build/asset checks passed before product source changes. Final **16 smoke checks / 218 Jest tests across 16 suites**, production build and `verify:dist` pass. Eight browser suites pass with zero page errors; [validation](../development/PRACTICE_VALIDATION.md) records mode/learning/lifecycle/legacy/settings/migration/layout evidence and before/final output sizes.
- Actual local UI captures are linked from [the catalog](../design/README.md), retaining the prior approved mockups. Final build assets `index-DSqYWGEI.js` / `index-Hc2oJHTM.css`, cache v13; package remains 0.8.0. Captures contain synthetic test values, with no external artwork added.
- GitHub publication is pending observed push/remote-head evidence, which will be appended separately. Cloudflare production access/build-status requests remain blocked by the workspace gateway; no deployment failure/success is inferred. Physical iPhone recognition, audible cues and vibration remain Not run; no perfect discrimination or field accuracy is claimed.

### CHG-015 recording-to-live compatibility and publication request — 2026-10-11

- The user asked for status, then explicitly instructed **“push changes, and check for test failures.”** Automatic-work and direct-main authorization remain in effect; this is delivery of existing scope, not a request for more step approvals.
- A final synthetic Learn-to-live check found that two-second Learn recordings and short streaming segments could produce incompatible window statistics for the same click. Added shared recognition using the existing short-window and matching 0.8-second Learn framing, retaining feature version 2 and all saved vectors. A plausible calibrated negative in either framing keeps the event unknown. This fixes authorized recognition behavior without adding a new product mode/taxonomy.
- Four new regressions cover actual two-second-to-short-event matching, existing short-window profiles, distinct reset/noise rejection and conservative unknown for near-identical reset/press evidence. The previous test assuming clean discrimination of a 1.5%-amplitude-only difference was corrected to separate distinguishable and ambiguous cases; the classifier's rejection threshold was not loosened to force that result.
- Current source acceptance: **222 Jest tests / 17 suites**, **16 smoke checks**, production build/`verify:dist` and diff checks pass. Earlier 218-check and asset records remain the observed previous candidate; current assets are `index-Dzm7VxiF.js` / `index-Hc2oJHTM.css`, cache v13, main JS 122.67/36.27 kB raw/gzip. Final browser outcomes/publication are appended only after observation.

### CHG-015 final browser acceptance — 2026-10-11

- Nine browser suites / 40 checks pass with zero page errors. The final production bundle's affected mode, visual/cue, legacy and settings checks were rerun after the recording-window fix. Existing lifecycle/ownership/migration acceptance remains recorded separately.
- Actual synthetic ScriptProcessor input through three two-second Train captures now produces a trigger profile that recognizes a later short streaming click without retraining. Trained external cue starts timing with zero shots; a distinct trained reset remains zero shots; the intended trigger counts once and capture tracks are released. This exercises the real Learn-to-live path rather than directly seeding short-window positives.
- Final source results remain 222 Jest / 17 suites, 16 smoke checks, production build and asset/diff verification passed. See [validation](../development/PRACTICE_VALIDATION.md). Synthetic success establishes functional compatibility, not physical iPhone accuracy. Publication is recorded after observing Git push and remote head.

### CHG-015 GitHub publication and external-check observation — 2026-10-11

- State: **Published to GitHub `main`** in [`8b8aec9`](https://github.com/matosaru/dryfire/commit/8b8aec9). `git push origin HEAD:main` succeeded; `git ls-remote origin refs/heads/main` returned `8b8aec987bacc6be3f9cb76f883d8432ecabdbfb`, matching local HEAD. User direct-main/no-PR and automatic-work instructions remain the authorization.
- All final local checks pass: 222 Jest tests / 17 suites, 16 smoke checks, production build/asset verification, nine browser suites / 40 checks and local documentation links/diff validation. Earlier candidate records remain unchanged.
- Post-push GitHub Actions query returned Forbidden; production app HTTPS returned workspace CONNECT gateway 403 before destination content. External GitHub check status, Cloudflare deployment and physical iPhone results remain unverified. These access failures are not reported as failed app tests or a failed deployment.
- Requirements/history/device checklist now record the observed implementation publication. This follow-up changes delivery documentation only; no new product scope or source change is introduced.

### CHG-015 CI regression follow-up — 2026-10-11

- Evidence: the user requested **“check test build failure”** with [GitHub job 114441525944](https://github.com/matosaru/dryfire/actions/runs/38129781080/job/114441525944), then supplied the precise failing log. This is a routine test correction within approved scope and needs no additional product approval.
- Before the fix, the full Node 22.23.3 suite reproduced the reported `resolvePermission is not a function` failure (221 pass / 1 fail). Local Node 24 had passed the same test. Fixed microtask polling was replaced with explicit signals from permission/worklet mocks in three lifecycle tests; all original behavioral assertions remain.
- After the fix, Node 22 dependency installation, 16 smoke checks, 222 Jest tests / 17 suites, production build and asset verification pass. No application source, requirements/defaults, persisted data or build artifacts changed. No visual revision is needed.
- GitHub API is still Forbidden; public GitHub HTML is accessible and confirms the reported failure. New-run/publication success is recorded only after observation. Prior local-browser and production/device evidence remain distinct.

### CHG-015 CI fix publication and successful GitHub run — 2026-10-11

- Test fix [`be50b99`](https://github.com/matosaru/dryfire/commit/be50b99) was pushed directly to `main`; the subsequent remote-head check returned `be50b99f7c8534636924091f327602567222a88d`.
- Public GitHub Actions HTML reports [GitHub Actions run 38130523348](https://github.com/matosaru/dryfire/actions/runs/38130523348) **completed successfully** for that fix. This supersedes the earlier pending/unverified CI status for this revision; the failed older runs remain historical evidence. The API is still Forbidden, but public HTML provided direct status evidence.
- Updated the delivery tracker, validation record and iPhone checklist with observed successful publication/CI. Cloudflare deployment and physical iPhone accuracy/output remain unverified. This documentation follow-up introduces no application behavior change.

## CHG-016 — Practice trigger recognition and microphone display

- Date: 2026-10-11. Affected IDs: PRACTICE-02/03/11/14, CORE-07/09; specification [practice-modes.md](../requirements/practice-modes.md), revision 1.2.
- Evidence: user reported **“i tested the app, trigger pulls are not recognised”**, identified **“During a practice mode”**, and explicitly requested **“add indicator”** and replacement of the persistent GO display with a visible microphone-level indicator after start. Existing automatic-work authorization remains in force.
- State: **Approved by direct instruction**. The concrete Run design and acceptance are documented before UI source edits. Recognition corrections restore existing approved behavior; a new confirmation is not required.
- Before source fixes, regressions reproduced missed early Learn clicks, modest gain changes, a quiet Learn-accepted click not being segmented, and a room-background mismatch. Earlier 222-test/CI success did not establish field accuracy. The user reports a device recognition failure; its precise deployed revision/context is not inferred.
- No deletion/retraining of saved profiles, automatic removal of rejection calibration, raw-audio storage, cloud account or changes to practice counts/timing are authorized by this correction. Physical-device and deployment acceptance remain separate. Final implementation/browser/publication evidence will be appended after observation.

### CHG-016 corrected layout and design publication request — 2026-10-11

- Evidence: the user corrected the initial layout with **“nom replace GO with STOP, after it started, and add microphone indicator bellow”**, then instructed **“prepare a design, add designs to github.”**
- State: **Approved by direct instruction**. Revision 1.3 of [practice-modes.md](../requirements/practice-modes.md) and [the concrete Run design](../design/archive/chg-016/practice-input.md) document STOP above the real microphone meter before the corrected source edits. The prior entry remains the history of the superseded initial request.
- STOP uses existing End Practice capture-release and durable partial-result behavior. It is shown during active practice/external-cue waiting; the duplicate bottom End Practice action is hidden then. Countdown, pause/resume/next, timing, sound-at-start settings and gun-owned storage retain their approved semantics.
- Design publication and automatic implementation are explicitly authorized; no new confirmation is pending. Browser captures and test/publication evidence will be appended only after observation. Physical iPhone recognition remains a reported issue awaiting verification of the corrected build.

### CHG-016 design publication and final local acceptance — 2026-10-11

- Design/specification commit [`9b24b7d`](https://github.com/matosaru/dryfire/commit/9b24b7d) pushed directly to `main`; remote hash `9b24b7d9097b60dfecaedfaab90f0a8c8629bfd4` observed. Actual dark/light Run captures preserve older approved designs. The user's request explicitly authorizes this publication.
- Matching implementation and recognition corrections pass **227 Node 22 Jest tests / 17 suites**, **16 smoke checks**, production build/asset checks and **seven browser suites / 35 checks**, zero page errors. Existing stored profiles, negatives, timing, counts, ownership and compatible backups are retained. [Validation](../development/PRACTICE_VALIDATION.md) records reproduced failures and exact build output.
- Source publication/new CI and Cloudflare/physical iPhone results remain pending observation. Synthetic Learn/input success is not proof of field accuracy; the user's reported misses remain recorded. No new approval is needed for the directly instructed implementation/push.

### CHG-016 source publication and successful GitHub checks — 2026-10-11

- Matching implementation [`34d3136`](https://github.com/matosaru/dryfire/commit/34d3136) pushed successfully to `main`; full matching remote hash `34d3136f9a5e4366924802b729adfbfcb6c3284a` observed. Direct-main/no-PR and automatic-work instructions authorize the push.
- Public GitHub HTML reports [Test and build run 38132660138](https://github.com/matosaru/dryfire/actions/runs/38132660138) **completed successfully** for that source revision. The preceding design/documentation [run 38132328710](https://github.com/matosaru/dryfire/actions/runs/38132328710) also passed. Local acceptance remains 227 Jest/17 suites, 16 smoke/build/asset and seven browser suites/35 checks.
- Design catalog/specification, history and iPhone checklist now identify published STOP/input behavior, source commit/cache v14 and observed CI success. No new product scope or source changes are introduced by this delivery-record follow-up.
- Fresh production HTTPS access again returned workspace CONNECT gateway 403 before app content. Cloudflare deployment and corrected physical iPhone accuracy remain unverified; no deployment or hardware success is inferred.

## CHG-017 — Automatic Single, progress history, unknown filtering, navigation and proposed limits

- Date: 2026-10-11. Specification: [practice-improvements.md](../requirements/practice-improvements.md), revision 1.0; affected PRACTICE-03/04/10/14, DRILL-05, CORE history/navigation and new UPDATE-01–05/LIMIT-01–03.
- User feedback: **“i did tested, now looks better.”** This is a qualitative app observation, not an instrumented device/deployment certificate.
- Direct instructions: automatic single-trigger countdown/beep/first-click cycles until the repetition count; statistical/graphical progress history; **“Do not record unknown sounds”**; historical/logical navigation; **“Plan all this work. Update a plan. And lets start implementing.”** UPDATE-01–05 are approved for implementation under existing automatic-work authorization.
- Explicit gate: **“before adding limitations and pushing a code, give me suggested limitations on each inputs for approval.”** The audited 11-control numeric table and proposed 10-per-type/per-category recording policy are documented, **pending approval**. Do not implement limits or push application code until the user approves the concrete table; independent authorized work may proceed locally. This gate comes from the user's instruction, not an inferred skill rule.
- Existing compatible data/history is retained; no automatic deletion of over-cap examples, old unknown detections or calibration is approved. No new cloud account, free-plan cap, raw-audio storage or camera/sensor scope is introduced.

### CHG-017 numeric/recording limits explicitly approved — 2026-10-11

- User reply: **“Approve all proposed limits”** to the full recording/category/numeric table, including all 11 numeric controls, the 10-per-type/per-category caps, same-origin ownership and preservation of existing over-cap examples/backups.
- [practice-improvements.md](../requirements/practice-improvements.md), revision 1.1, records the exact approved bounds. The previously requested limit/code-push gate is resolved before limit implementation; no further step confirmation is needed.
- UPDATE-01–05 and LIMIT-01–03 are now approved for automatic implementation, final validation and direct-main publication. Existing data is retained and no unrelated deferred scope is added.

### CHG-017 visible safety modal added by direct instruction — 2026-10-11

- User explicitly requested **“adding modal window to confirm safety once, if it was not confirmed, and after a confirmation, proceed with drills and other actions.”** UPDATE-06 is approved for automatic implementation alongside UPDATE-01–05 and approved LIMIT-01–03.
- Revision 1.2 addition to [practice-improvements.md](../requirements/practice-improvements.md) defines the accessible modal, once-per-page-session acknowledgement, cancellation, automatic continuation of the original action and stale-owner guard before source edits. Existing checklist and no persistent waiver/no microphone safety verification behavior remain.
- No additional approval is requested. Implementation/acceptance/publication will be recorded after observation.

### CHG-017 — release preparation requested, 2026-10-11

The user explicitly instructed **“proceed with push, update documentation and screen images.”** Revision 1.2, the separately approved complete limit table and directly requested safety modal are implemented. Final local evidence: 257 Node 22 Jest tests / 21 suites, 16 smoke checks, build/asset verification and seven browser suites / 46 checks pass with zero page errors. Five actual production-build captures are linked in the [design catalog](../design/README.md); older reviewed images remain preserved. This records implementation/validation and authorization to publish, not user testing of the new release or observed production deployment. Publication/CI results are appended separately after observation.

### CHG-017 — publication observed, 2026-10-11

The authorized code, revised specifications and five actual screenshots were pushed directly to `main` in [`b29837a`](https://github.com/matosaru/dryfire/commit/b29837a). Push success and the matching full remote hash `b29837a000a875b571218d5911717d83a34bd2ed` were observed. This is publication evidence, not a new approval or proof of Cloudflare/device acceptance. New CI is being checked; a fresh production request remains blocked by gateway CONNECT 403.

### CHG-017 — source CI observed, 2026-10-11

[GitHub Actions run 38138057437](https://github.com/matosaru/dryfire/actions/runs/38138057437) **completed successfully** for published source `b29837a`, observed via public GitHub HTML. The workflow runs Node 22 smoke/Jest/build/minified-asset verification. This is CI evidence, not Cloudflare deployment or physical-device/user acceptance. No further source changes were made after the validated publication; this follow-up records outcomes in documentation.

## CHG-018 — Documentation packages, screen architecture and prepared SEO

- Date: 2026-10-11. Direct authorization: **“Add separate package for functional requirements”**, organize designs by path, remove duplicates, match Markdown/designs for all functional screens, add a maintainable site architecture tree, **“Suggest and prepare a good SEO information for indexing”**, and update the plan.
- Approved scope: separate documentation directories under `docs/` for requirements, designs, architecture, development, project history/change control and prepared SEO. This explicit later request supersedes CHG-009's earlier instruction to keep all full documentation under `docs/design/`; root navigation files remain short entry points.
- Preserve append-only approval evidence, stable requirement IDs and approved design history. Move older visual revisions into an archive and correct their local references; immutable GitHub links retain their original commit paths. Consolidate duplicated current indexes and correct superseded prose without changing approved application behavior.
- Add actual current screen/state captures, a source-checked screen registry/tree and a documentation validation command in CI. Keep design examples illustrative and distinguish browser captures from physical-device validation.
- SEO scope is a concrete audit, recommended copy, metadata/crawl templates and implementation sequence. New public content, routes and production metadata remain **proposed**, rather than being silently implemented by a documentation request. No ranking, trademark clearance or rich-result guarantee is implied.
- Approval evidence is the user's direct request above; no repeated step confirmation is needed. Implementation, checks, publication and deployment remain separate outcomes to record.

## CHG-019 — Edit gun profiles, illustrated selection and explicit resets

- Date: 2026-10-11. User reports **“there is no way to modify existing guns”**, **“guns selectors do not match design, there are no images of gun type”**, and **“reset all sounds and guns do not work from the settings section.”** These steer the current documentation task to include the working corrections before publication.
- Approved by direct instruction: a reachable Edit action for each saved gun, prefilled name/type form, type-specific illustrations in the setup/library/active selector, and functioning Settings resets. Retain the existing three type labels, five-profile maximum, stable gun identity and all owned samples/presets/results when editing.
- Reset scope: retain a confirmed **Reset this gun's sounds** action that removes only its positive/calibration examples and keeps profiles/presets/results. Add a separate explicitly confirmed **Delete all guns & app data** action, with backup guidance and full deletion scope stated before confirmation. Only the user choosing and confirming that action may clear the local library; implementation/testing does not authorize clearing any user's production storage.
- Full reset is an atomic clear of all application IndexedDB stores followed by an in-memory/navigation restart. It does not call origin-wide browser-storage/cache deletion. Cancel changes nothing, active capture locks destructive controls, and compatible exported backups remain restorable.
- New IDs: GUN-10 (edit), GUN-11 (type illustrations), SET-06 (explicit whole-library reset). This supersedes the prior deferral of all-gun reset for this specific requested action; individual gun deletion and unrelated deferred scope remain excluded.
- Requirements, current screen designs, registry/tree, provenance and implementation plan must be updated together. Baseline Node 22 dependency install, 257 Jest / 21 suites, 16 smoke checks, build and asset verification passed before application edits. Reproduce regressions before fixes and record final validation/publication separately.

### CHG-018/019 — final local validation and additional guides, 2026-10-11

Current requirements/layouts are organized and reconciled, 38 current actual captures cover all ten views and the shared modal, and 27 distinct historical PNGs are retained. Editing/type-image/reset changes are implemented under the direct user requests above. Final Node 22 evidence: 261 Jest / 22 suites, 16 smoke checks, build/minified-asset verification, documentation checks and two browser suites / 11 checks pass with zero page errors. Four negative documentation fixtures correctly fail, and restored files pass. This is local validation, not publication or production-device evidence.

The user additionally requested browser support information, how to ensure exact screenshot matching, **“a guide… on how to monetize the project”**, and **“how to deploy as iphone or android app (can be webview inside app)”**. Linked capability, visual-regression, monetization and Capacitor release guides address that scope. Native builds/signing/store submission, payment/tier enforcement, SEO deployment and visual pixel CI remain prepared/proposed steps rather than falsely recorded implementations. No production data was cleared. Publication/CI will be appended after observation.
