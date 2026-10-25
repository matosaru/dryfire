# Follow-up modularization plan

Prepared 2026-10-24 against `b` revision `2cf044c` / application `5b8aeed`. **Proposed; implementation has not started.** The owner requested review of Copilot's analyses, reusable pages and then this consolidated plan. This is separate from the [completed P0–P8 React refactor](plan.md); it does not reopen that migration or authorize a new framework rewrite.

Review and implementation scope: **b only**. The owner handles b → main merges for the Free product; do not perform or assume those merges. Dev is outside the active workflow. No branch synchronization, other-branch inspection or deployment reconfiguration under this plan. Finish the Free product before reopening monetization planning.

## Result to achieve

Keep all13 complete screen owners under `apps/web/src/pages`. Each page composes the existing common shell and focused components. Share markup where workflows actually match, keep feature-specific blocks with their feature, and reduce bootstrap/persistence coupling without changing appearance, behavior, data, editions or performance.

One `AppShell` continues to own the branded header, footer and fixed navigation. `PageHeading` continues to own page headings. `packages/ui` remains the single shared UI home. Do not add a second UI library or a universal page with a large collection of unrelated flags.

## Preceding SEO work

The owner subsequently requested indexable public URLs with correct metadata before this structural plan. Execute the separately specified [SEO/routing phase S1–S4](../../seo/indexable-routes-plan.md) first, using confirmed .com canonical/.app redirects after content/migration contracts are defined. It adds intentional public functionality; F1–F7 remains a behavior-preserving structural follow-up. Keep the two scopes and their visual acceptance separate.

## Execution order and completion criteria

| Step | Work | Completion criteria | Status |
| --- | --- | --- | --- |
| F1 | Freeze current contracts and map extraction boundaries | Current baseline checked; dependency/ownership map covers proposed components/services; missing characterization added before moving behavior; architecture checks cover new feature-component folders and permitted import directions | Review complete; implementation baseline refresh pending |
| H1 | Shared header icon navigation (separate approved visual change) | About, Contact, Settings icons at top right; accessible controls, consistent routes/guards and reviewed screenshots across pages | Planned; destination/order confirmed |
| F2 | Shared page context and repeated Settings components | GunContext replaces identical context composition; SettingsSection, PreferenceToggle and SettingsAction replace repeated Settings markup with preserved DOM, IDs, statuses, input ownership and callbacks | Planned |
| F3 | Complete drill setup reuse and audit run/guide duplication | Existing DrillSetup owns repeated delay/sound/readiness composition where compatible; Practice/Sequence retain mode-specific options; existing common guide remains one page; run/live-example components share only truly repeated presentation | Planned |
| F4 | Decompose Live Listen and retain History composition | Focused mode/controls/result/timeline sections; shared microphone-meter presentation only if both variants preserve existing rendering/update behavior; History continues to compose its existing lists/evaluation/progress with only demonstrated duplicate cleanup | Planned |
| F5 | Extract persistence validation behind the existing facade | Pure backup/session validation isolated and directly tested; storage.js public API, schema4, formats, migration policy, atomic multi-store operations and startup snapshot semantics unchanged | Planned |
| F6 | Extract cohesive orchestration from main/controllers | Preferences and gun-library coordination isolated first; main is a composition root with smaller startup adapters; controllers retain one owner for capture, timing, queueing and durable saves; no new competing store/engine | Planned |
| F7 | Remove obsolete code/CSS and finalize architecture handoff | Removed old consumers/styles proven unused; all complete acceptance gates pass; component map, entry points, sitemap, docs and concise context match final code | Planned |

Each row consists of small, independently verified slices. The complete acceptance gate below applies before each application publication to b, not only at F7. Fix a failing slice before continuing; keep commits reversible and do not accumulate several unverified extractions.

## F1 — Contracts and test protection

- Record current source and exact initial payload/timing/visual/frame references. Latest existing full acceptance is40075428666/40076234770 with1017tests/147suites and all8jobs green; this is prior evidence, not a newly run baseline for this plan.
- Refresh the required install/smoke/unit/build/artifact baseline before application refactoring. Identify any preexisting failure separately.
- Characterize planned seams: component markup/semantics, controlled/uncontrolled values, callbacks and errors, focus, retained native elements, capture/save cancellation and storage ownership.
- Extend existing architecture verification to the actual feature-component folders introduced below: source, CSS, tests, export and clear dependencies. Add targeted layer/cycle checks based on inspected imports, not a blanket prohibition on currently intentional adapters.
- Pure models/engines do not import React/DOM/persistence. Shared UI does not acquire capture/storage. Feature controllers coordinate effects; rendering ports remain exclusive. Define these rules before extracting modules.

## H1 — Shared header icon navigation

Added 2026-10-25 by direct owner request, after F1 characterization and before F2. This is an intentional navigation/design change, separate from the appearance-preserving F1–F7 extractions; establish and accept its new visual references independently.

- Move informational navigation from bottom text links into the shared header, top right beside Settings, consistently across app pages. Requested left-to-right order: **About, Contact, Settings**.
- Suggested icons: outlined information circle for About, envelope for Contact, existing gear for Settings. Use the existing icon system, matching stroke, size, theme contrast and spacing; retain the logo/Beta badge and avoid narrow-screen collisions.
- Icon-only visible controls need accessible names, keyboard focus, sufficiently large touch targets and discoverable labels/tooltips. Use real route links for informational pages and preserve existing history, capture/safety and unsaved-work guards. No duplicate shell or page-specific header copies.
- **Confirmed destinations (2026-10-25):** owner clarifies “About, Contact, Settings, we do not have help”. Relocate both About and Contact footer links to the header; retain their existing routes and Contact email. Do not add a Help icon or new Help page.
- Update shared layout and affected About/Contact requirements, shared design, screen/component map and navigation documentation for the confirmed destinations. Preserve footer disclosure/copyright and fixed bottom navigation; remove only links actually relocated.
- Characterize and test header markup, accessible names/routes, keyboard/touch behavior, narrow layouts, active navigation and guarded transitions. Update reviewed screenshots for every affected page/state in both themes/editions and pinned Chromium/WebKit; review help/animation exports if the shared header is present. Run the complete unit/coverage/integration/build/artifact/performance acceptance before publishing application code to b.

Planning only in this update: no application, CSS, route or screenshot changes yet. Main/dev unchanged by this planned work.

## F2 — Cross-page context and Settings

- Add a shared GunContext presentation component for repeated gun-context text/hidden behavior. Preserve screen-specific wording and escaped names; it does not fetch or change the selected gun.
- Extract Settings feature components for repeated section headings/descriptions, preference switches/status and icon/action rows. Keep them feature-owned unless a real second consumer establishes a shared UI contract.
- Keep native file input and private preview nodes retained; do not recreate them on ordinary updates.
- Preserve browser-support explanations, gun-versus-device preferences, disabled/saving states, destructive-action consequences and existing confirmation behavior. Components emit callbacks; services keep persistence/permission responsibilities.

## F3 — Drill pages and guides

- Extend `packages/ui/src/DrillSetup` rather than introduce an equivalent second DrillSetupPage implementation.
- Extract compatible fixed/random delay fields, start-sound control and readiness/start composition from PracticePage/SequencePage. Keep stable IDs, fields/defaults/limits, app/external signal behavior and invalid/unsaved native drafts. Different input structures can remain slots where forcing one shape would change behavior.
- Keep PracticePage and SequencePage as complete page owners. Their engines, counters and session semantics remain separate.
- Keep PracticeGuidePage as the shared guide for every mode and selected sequence. Do not create another DrillAboutPage duplicating it.
- Audit PracticeRun/SequenceRun and review components for repeated presentation; share small meaningful pieces only. The existing live/example reuse already works. Separate attempt/shot counters, sequence progression and capture controls remain intentional variants.
- If a reusable layout emerges, give it a clear Layout/Panel name and composition slots. A new directory or rename alone is not a deliverable.

## F4 — Live Listen and History

- Split LiveListenPage's substantial sections into feature components: mode/sequence panel, listening controls/readiness/sensitivity, session action timeline and recognition result/verification.
- Consider a shared MicrophoneMeter with explicit live-listen/practice presentation variants. Keep existing DOM/labels and high-frequency update ports; do not force sample-frequency updates through a broad React provider or rerender the full page for every sample. If the variants cannot share meaningful structure without changes, retain them and document why.
- History already uses SavedSessionList, RecognitionList, EvaluationPanel and optional progress content. Preserve these; do not add wrappers merely to increase component count.
- Preserve transient versus durable record semantics, draft verification selections, selected-gun ownership, recognition/session clear scopes, optional progress guards and retained numeric-limit input.

## F5 — Persistence

- Begin with pure record/backup normalization and validation. Introduce internal storage modules with direct behavior tests while `src/storage.js` remains the public facade.
- Keep a single database/transaction implementation. Do not scatter persistence into app shared folders plus an unrelated core store.
- Keep deleteGun/selection changes atomic, exportBackup a consistent snapshot, and restoreBackup full validation before one atomic replacement.
- Preserve owner checks inside writes, stale revision/save protection, interrupted recovery, migration behavior and compatible backup formats. No schema/version bump is required just to extract code.
- Preserve `getLibraryOverview` batching; do not replace it with several provider/feature reads that reopen the database.
- Further storage extraction follows real dependencies; moving every domain CRUD function into a new file is not required for completion.

## F6 — Composition and controllers

- Make an explicit map of closure state/callbacks before moving main.js functions. Extract preferences and gun-library coordination with narrow injected dependencies; keep main responsible for wiring startup/services/navigation.
- Do not create another monolithic view-state.js or handlers.js. Extract by capability and ownership, not by collecting every render function or event listener together.
- Keep route serialization and context resolution in their existing tested owners. No new routing library or eager client App.tsx is required.
- Existing pure practice/sequence engines and record serializers remain authoritative. No duplicate reducer/state machine or central Context store is introduced without a demonstrated new requirement.
- Retain operation/capture tokens, queued state transitions, cancel/cleanup/save failure handling and independent microphone/timer lifetimes. React enhancement/StrictMode cannot duplicate effects.
- Separate controller presentation where this removes verified duplication, while retaining lightweight tested native startup adapters and guarded ownership transfer under ADR001.

## Target ownership

```text
apps/web/src/
  pages/<Page>/                         Existing complete screen owners
  features/
    settings/components/<Component>/   Settings-only reusable rows/sections
    live-listen/components/<Component>/ Listening-only controls/results/timeline
    sessions/                          Existing shared session presentation/models
  app/                                 Existing lazy mount/ownership adapters
packages/ui/src/<Component>/            One shared UI home; extend current owners
src/
  main.js                              Startup composition and wiring
  storage.js                           Stable public persistence facade
  storage/                             Extracted validation/shared internals as needed
  application/                         Cohesive orchestration modules as needed
  practiceSession.js / drillSession.js  Existing pure engines
```

New component folders contain `<Name>.tsx`, `<Name>.css`, `<Name>.test.tsx` and `index.ts`. These remain source packages inside existing workspaces, not separate published npm packages. The illustrated internal storage/application folders are introduced only for an actual extraction; no blanket file relocation or JavaScript-to-TypeScript conversion is required. Preserve existing public imports through facades during extraction and remove a compatibility wrapper only after all consumers are deliberately migrated.

## Acceptance before each application publication

- Typecheck, lint, architecture/dependency rules, documentation checks and smoke tests.
- Unit/component tests and the existing coverage ratchet, including meaningful states, callbacks, escaping, validation, errors and ownership behavior.
- Integration tests for affected real workflows: gun/profile changes, invalid drafts and Back/Forward, delayed/failed renderer loading, safety/permission/cancel, Stop/Pause/Resume, recognition/saving/history, backup/restore and scoped deletion.
- Both public/preview minified builds, edition/security/artifact verification and original critical JS/CSS payload limits.
- Complete pinned Chromium/WebKit workflow/screenshot suites for both editions. No new screenshot baseline should be needed for a strictly structural slice; investigate differences rather than accepting them.
- Original performance comparisons and runner controls. Preserve startup budgets, input/feedback/capture cleanup behavior and audio readiness; do not weaken thresholds, timeouts, samples or controls to pass.
- Shared guide examples/frame signatures and GIF hashes remain unchanged when visuals do not change. No microphone-device accuracy claim from synthetic tests.

Where pinned browser tooling is unavailable locally, use the existing review-only candidate acceptance path before application publication. Record exact tested source and observed CI outcomes. A pending/cancelled/diagnostic run is not a pass.

## Documentation and final delivery

Update component/ownership maps and relevant documentation after every slice. Keep the generated application sitemap/tree synchronized; update entry-point documentation if responsibilities move. Preserve approved requirements/designs and mark scope changes as proposals until explicitly authorized. Keep implementation history append-only and context concise.

At F7: report final component map, entry point and service boundaries; list removed duplication/unused files, test/visual/performance evidence and any intentionally retained adapters. Keep main/dev unchanged. Accounts, monetization, native apps, new public pages and functional redesign are outside this follow-up.

## After the Free product is finished

Open a separate monetization discovery/planning iteration. Revisit prior proposals using the finished Free product and owner feedback; do not treat the previous paid-feature examples, providers or architecture as a final commitment. Review:

1. Product principles and desired paid functionality, retaining the earlier preference for simple basic Free practice and one affordable paid plan unless the owner changes it.
2. Updated competitors, pricing, running costs and sustainable business model.
3. Feature allocation and transition policy, preserving existing user data and defining downgraded/offline behavior.
4. Accounts, recovery/backups/synchronization, storage, data/privacy and entitlement requirements.
5. Technical structure, payments/subscriptions, provider eligibility, billing security and Lithuania/Europe legal/tax/consumer requirements.
6. Safe Free/Full test environments/accounts, rollout, support and operational costs.

Produce separate requirements, designs, technical options and an implementation plan for review before commercial implementation. Native app releases remain deferred. No work on a paid branch or monetization infrastructure starts during the current Free phase.

## Current status

Analysis and this structural plan are documented; F1–F7 implementation has not started. The separate CHG-060 SEO/routing work has been implemented and published on b after complete acceptance40098705431. Owner production promotion/live domain verification remain separate. Refresh the structural baseline before starting F1; retain the current Free-first and b-only workflow.

[Copilot review](copilot-review.md) · [Completed refactor](plan.md) · [Architecture decision](../../architecture/decisions/001-progressive-react-startup.md) · [Current application sitemap](../../architecture/application-sitemap.md)
