# Requirements approval log

Recorded: 2026-10-10. This initial ledger records available conversation evidence and deliberately separates feature requests, design approval and implementation.

## CHG-001 — Reference design and existing behavior

- Scope: CORE-01 through CORE-13; existing behavior and requested reference-design update.
- Evidence: user requested **“update program with new design”** and supplied the logo/navigation/animations/reset/data-preservation change list.
- Implementation: reference-design update and Cloudflare preview configuration are on `main`; see [DESIGN_CHANGES.md](../development/DESIGN_CHANGES.md) for observed validation. Native/device microphone verification is not established.

## CHG-002 — Dedicated drill sessions

- Scope: DRILL-01 through DRILL-06.
- Evidence: user requested select/create, editable configuration, Start, fixed/random timing, completed/left counts and stored information after each completed drill. The user later said **“I love the designs”** before requesting the gun-profile additions.
- State: feature scope requested; the visual direction received positive feedback. Finer behaviors in the proposed-interaction section of [drill-sessions.md](drill-sessions.md) remain open rather than being inferred as approved.
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
- Implementation: [originality and provenance record](../originality-and-provenance.md) documents known sources, asset groups, uncertainty and limits. The user-reported reference source is recorded without publishing the private conversation URL.

## CHG-011 — Dry Fire With Ease display branding

- Date: 2026-10-10.
- Affected requirements: BRAND-01 through BRAND-05 in [branding.md](branding.md) revision 1.0; CORE-02 in [core.md](core.md) revision 1.1.
- Previous behavior: Dry Fire / DRYFIRE header and lockup, with Sound Trainer as a descriptor.
- Approved behavior: canonical name **Dry Fire With Ease**; retain the existing orange/white DF monogram and include **WITH EASE** in the logo lockup. Use the full display name in app branding, About, accessible labels, installation metadata and native appName. Preserve storage, backup and deployment identifiers and the reviewed historical designs.
- Evidence: the user explicitly instructed **“no, lets leave dry fire with ease, just update logo to have this with ease, and all other places , where dry fire as a brand is used in an app”**.
- State: **Approved** by direct instruction. No repeated approval is required for this scope. The earlier proposed coined names are not adopted; no legal-clearance claim follows from retaining or extending the existing name.
- Design record: [canonical DF monogram](../../../public/logo.svg) and [branding specification](branding.md). The request authorizes the specific wording extension; historical mockup monogram variants remain illustrative.
- Acceptance criteria: complete brand in visible/accessibility/installation/native labels, readable narrow-screen header, and unchanged persisted data and application identity; see BRAND-01 through BRAND-05.
- Implementation: pending. Record completed changes and observed validation separately after implementation.

### CHG-011 implementation update — 2026-10-10

- State: **Implemented and locally validated**; the approval and exact evidence above remain unchanged.
- Final design: [actual production header](../brand-lockup.png), including Settings, and [Home screenshot](../branding-preview.png). The full lockup combines the existing SVG monogram with the accessible HTML wordmark in `index.html` and `src/styles.css`; the SVG alone remains the monogram.
- Updated app/header/accessible/About/installation/native display branding and backup filename, preserving the existing database, backup format, app/package and deployment identities.
- Observed validation: 16 smoke checks, 48 Jest tests, build and `verify:dist` passed. Chromium checked branding/metadata and header layout at 320, 375, 390, 430, 768 and 1280 px. Existing-format backup import/export passed; seeded learned profiles, history and settings remained exactly unchanged after an explicitly registered local service-worker v9-to-v10 cache update and reload.
- Limits: Cloudflare deployment, browser/OS installation on real devices and signed native release are not verified. See [branding.md](branding.md) for build-size evidence and refresh guidance.

## CHG-012 — Implement approved multi-gun flow and gun-owned presets

- Date: 2026-10-10.
- Affected requirements: GUN-01 through GUN-09, DATA-01 through DATA-03 and DRILL-06; gun profiles revision 1.1, persistence revision 1.1 and drill sessions revision 1.2.
- Previous behavior: published multi-gun mockups/specifications only; the application still has one shared learned model/history and no custom preset editor. Branding implementation did not implement gun profiles.
- Approved implementation scope: first-use name/type entry, five-gun library, selected-gun Home/switcher, independently owned learned sounds/custom presets/recognition history, remembered selection and compatible same-origin persistence. Implement the previously requested custom action-sequence editor with saved presets for the selected gun. Preserve built-in drills and the explicit safety-gated recognition flow.
- Approval evidence: reuse the explicit **“approve, but now review”** multi-gun approval recorded in CHG-003 and the earlier instruction **“Custom drills need a sequence editor and saved presets.”** The latest user reported **“i do not see any changes, with multiple guns support”**, then explicitly instructed **“proceed with implementation.”** These are evidence to deliver existing scope, not approval of unrelated proposals.
- Engineering record: database version 2 retains the existing database name; transactionally migrate legacy records into a gun needing user-supplied details; preserve record IDs/features/timestamps; capture gun ownership when recording/listening starts and require stopping before switching; version-2 whole-library backups retain compatible version-1 import support. See [persistence.md](persistence.md) for the concrete plan and validation expectations.
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
- State: **Approved** by direct instruction. Create and maintain [implementation-history.md](../implementation-history.md) as the authoritative delivery tracker, linked from repository/documentation entry points.
- Acceptance: show concise per-request history, current completed/in-progress/pending scope and an ordered remaining plan; distinguish requirement approval, code completion, tests, GitHub publication and deployment. Record observed evidence and limitations without presenting mockups as working features.
- Implementation: documentation tracker and ongoing agent maintenance rule added; current multi-gun work remains in progress until observed validation and publication are recorded.

### CHG-012 implementation update — 2026-10-10

- State: **Implemented and locally validated**. The existing approvals above are unchanged; GitHub publication and Cloudflare deployment remain separate.
- Delivered: first-use name/type, five-gun library/switcher, independently owned learned models/recognition history/settings, remembered selection, saved custom sequence editor, non-destructive schema-2 migration and validated version-2 whole-library backups with version-1 restore. The package remains version 0.8.0; service-worker cache is v11.
- Final source verification: 16 smoke checks, 100 Jest tests across 8 suites, production build and `verify:dist` passed. Build-size evidence is in [implementation history](../implementation-history.md).
- Final browser verification: previous cached schema-1 app upgraded to schema 2/cache v11 without losing exact IDs, timestamps, compatible features, verification labels or drill metadata for 12 examples and 2 events; retention 42 remained intact. First-gun validation, exact types, five-profile cap, cancel/reload/selection, gun-owned model/history/preset/settings isolation, ordered/repeated-action custom editing and clearing stale drafts on switch/import passed.
- Actual UI backup download/version-2 exact library restoration, version-1 compatible restoration/details prompt and malformed-owner import rejection without partial data replacement passed. Selected-sound/full-selected-gun resets preserve other guns/history/presets; history trimming/clearing affects only its owning gun.
- No page errors or horizontal overflow were observed at 320, 390 and 768 px. Synthetic Chromium microphone checks confirmed pending/active switch blocking, released tracks after Stop and released late-arriving permission streams after leaving the view. This does not verify a physical microphone, iPhone/Android recognition accuracy or a signed native build.
- Actual production-build captures: [first gun](../multigun-implementation-onboarding.png), [library](../multigun-implementation-library.png), [Home](../multigun-implementation-home.png), [custom editor](../multigun-implementation-custom-drill.png). These supplement the immutable approved mockups; they are local captures, not deployment proof.
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
