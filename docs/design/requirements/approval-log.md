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
