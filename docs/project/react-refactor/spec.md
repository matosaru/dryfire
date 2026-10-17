# React refactor specification

CHG-048 · revision 1 · 2026-10-17 (Europe/Vilnius) · **Proposed; awaiting owner review.**

This document specifies the remaining refactor; [plan.md](plan.md) defines its execution order. The latest request explicitly requires seeing the plan before proceeding. It pauses further CHG-047 application migration until the owner approves this revision. Preparing, checking and publishing these documents does not approve or start the refactor.

## Goal and boundaries

Make the existing application easier to maintain through reusable, typed React page/component packages with separate CSS and meaningful tests. Preserve its design, functionality, performance and saved data. Continue the released incremental migration rather than starting another application or replacing tested engines. The owner's latest clarification explicitly requires retaining JavaScript/CSS compression and avoiding a slower final application; improvements are desirable only when measured without changing behavior.

Functional behavior remains authoritative in [requirements](../../requirements/README.md); appearance in [current designs](../../design/README.md); route/state ownership in [the screen registry](../../architecture/screen-map.json). This specification does not change those product contracts. Native apps, SEO implementation, accounts, billing, cloud synchronization and new product features remain outside this refactor.

## Existing structure, inspected baseline

Inspected Free source: main/b `6c38bff`, owner release [PR #24](https://github.com/matosaru/dryfire/pull/24). Full source: dev `a5b76e8`, containing that release plus its Full configuration and existing additions. Documentation publication will create later commits; these identifiers describe the measured application baseline.

| Boundary | Existing implementation | Implication |
| --- | --- | --- |
| Toolchain | Vite 8, React 19, TypeScript, Jest/Testing Library, Playwright; one lockfile and three workspaces | Reuse the installed stack and root commands |
| Entry/orchestration | src/main.js, 1,221 lines: routing, gun context, actions, preferences, audio wiring and async guards | Extract by feature after testing existing effects and ownership |
| Shell | src/templates/layout.html plus shared header/context/footer/navigation/safety fragments | One current shell; React must replace its ownership once, without duplicating it |
| Pages | 13 stable states; About/Contact interiors are already React, eleven remain HTML/controller-owned | Retain the completed pages and migrate one remaining boundary at a time |
| Shared React UI | PageHeading and InformationCard have exports, CSS and colocated tests | Extend existing packages rather than introduce equivalent controls |
| CSS | Ordered src/styles.css imports; three temporary legacy files contain 64 / 52 / 578 lines | Preserve selector order, specificity, tokens and theme/media overrides during extraction |
| Domain logic | Separate practice/sequence engines, classifier, detector, calibration and limits | Keep algorithms unchanged; move only behind tested exports when needed |
| Browser services | audio.js, 413 lines; practiceController.js, 322; sessionController.js, 410; guide controller and service/worklet entries | Lifecycle adapters need tests before React ownership changes |
| Persistence | storage.js, 868 lines; IndexedDB schema 3; backup format 4 | No schema, key, ownership, retention or backup-format change |
| Live/help presentation | sessionPresentation.js and four shared run/review fragments | Live sessions and guide examples must continue using the same presentation |
| Evidence | 390 browser PNG references, 83 current screen captures, 12 guide GIFs | Freeze them as the visual contract; folder changes do not authorize new pixels |

The [component map](../../architecture/component-map.json) lists all 13 states and current test entry points. It is an ownership inventory, not proof that every state or branch is covered.

## Website analysis and adopted practices

The requested [Pramod Boda article](https://dev.to/pramod_boda/recommended-folder-structure-for-react-2025-48mc) was retrieved successfully with HTTP 200 and read on 2026-10-17. The earlier HTTP 403 limitation is resolved. Its main example separates components/common, components/layout, features, pages, routes, hooks, context, store, services, utilities, types, styles, assets and config; Button demonstrates colocated component, CSS Module, test and index files. Its later examples also use a layouts directory. These are adaptable examples, not a requirement to create every folder or dependency.

| Article recommendation | Application here |
| --- | --- |
| Feature/domain organization | apps/web/src/features/{guns,learning,practice,sequences,guides,history,preferences}; feature-local hooks, services and components |
| Reusable common/layout components | Existing packages/ui owns shared components and AppShell/header/footer/navigation; app-specific feature components stay with their feature |
| Thin pages | apps/web/src/pages/<Page>/ composes feature and shared components; does not implement detection or database algorithms |
| Component/CSS/test/index together | Keep a named source package per reusable component and page, following the existing AboutPage pattern |
| Routes and context separate from rendering | Put composition/adapters under app/routes and app/providers; retain existing state IDs, browser history and guards |
| Services separate from views | Explicit adapters to the existing audio/storage/domain APIs; no microphone or database acquisition in shared UI |
| Global styles separate from component styles | Keep reset/tokens/theme/layout global; extract component CSS without reordering the existing cascade |
| Shared hooks/types/config | Create only for actual shared behavior; feature-only code stays local; preserve build-profile/Worker configuration at its established root location |
| Optional state library | Do not add Redux, Zustand, Recoil or another store just to match an example folder |
| CSS Modules in example | Defer class renaming/CSS Modules until parity; existing global selectors and computed styles are the contract |
| public/index.html in its example | Keep Vite's current root index.html and public asset URLs; the example mixes Vite/CRA conventions |

First-party checks: React [Thinking in React](https://github.com/reactjs/react.dev/blob/main/src/content/learn/thinking-in-react.md) supports component hierarchy, static parity and minimal state; [You Might Not Need an Effect](https://github.com/reactjs/react.dev/blob/main/src/content/learn/you-might-not-need-an-effect.md) supports derived rendering and event-driven actions; [React Testing Library](https://github.com/testing-library/react-testing-library/blob/main/README.md) supports tests based on observable user behavior. None prescribes one npm workspace for every small component.

## Required architecture

Each reusable visual component and page is an isolated **source package** with Component.tsx, Component.css, Component.test.tsx and index.ts; add a short contract README where lifecycle/variants need explanation. Shared pure hooks/services use colocated .test.ts tests and do not need artificial CSS files. Retain the three workspaces initially; do not create/publish an npm package for every element. Separately buildable domain/audio/storage packages are deferred until a measured reuse/build need justifies them.

```text
dryfire/
├── index.html, public/               # Existing entry and stable asset URLs
├── apps/web/src/
│   ├── app/                         # Bootstrap/composition, providers, route adapters
│   ├── pages/<Page>/                # Thirteen thin screen compositions
│   ├── features/
│   │   └── <feature>/
│   │       ├── components/<Name>/   # TSX + CSS + test + public export
│   │       ├── hooks/               # Lifecycle adapters + tests
│   │       ├── services/            # Ports to existing services + tests
│   │       └── types.ts
│   └── styles/                     # Shared tokens/reset/theme/layout, ordered entry
├── packages/
│   ├── ui/src/<Component>/         # Shared common/layout source packages
│   └── testing/src/                # Render helpers, deterministic fixtures/service fakes
├── src/                            # Existing tested engines/services during migration
├── workers/                        # Existing worklet/service/private gate entries
├── tests/                          # Retained cross-boundary/legacy contracts
├── visual-tests/                   # Built-app integration and image tests
├── tools/                          # Build/docs/package/visual verifiers
└── docs/                           # Existing requirement/design/architecture ownership
```

Dependencies flow from composition/pages to features, then shared UI and service/domain ports. Shared UI cannot import application pages, storage or capture APIs; pure engines cannot import React or the DOM. Use public exports, prevent circular imports and avoid catch-all utilities. Do not move root/public/worker/tool files merely to make the tree resemble a tutorial.

## Invariants and acceptance requirements

| ID | Must remain true |
| --- | --- |
| RF-01 | Same layouts, text, colors, typography, spacing, icons, BETA badge, native controls, themes, focus styles and sticky safe-area navigation. Reuse existing tokens; no redesign or replacement component library. |
| RF-02 | Exactly one shared header/main/footer/navigation. All 13 stable screen states retain their current IDs, Back/Forward behavior, context visibility, setup/capture guards and reachable final controls. No new URL scheme/router is introduced. |
| RF-03 | Unsaved and invalid forms retain their values through navigation/guides. Existing section owners stay mounted until an equivalent persistent draft owner is tested. Focus, scroll and delayed-loading behavior remain equivalent. |
| RF-04 | One writer owns each DOM region. Legacy code must stop writing a region before React takes it over; temporary adapters cannot create duplicate handlers, roots, timers or sources of state. |
| RF-05 | Gun ownership, limits, names/types, example identifiers, optional sounds, reset/delete scopes, backups, old libraries and recognition/session history remain unchanged. No destructive migration or implicit data clearing. |
| RF-06 | Preserve all six practice modes and ordered built-in/custom sequences. Keep readiness before countdown, early-Single failure, first fast click, cue suppression, automatic Single repeats, counters, STOP/meter, interruption and save/retry semantics. |
| RF-07 | Audio acquisition remains tied to the existing explicit user action and safety gate. Strict Mode, double-start, slow/denied permission, cancellation, backgrounding and late async completion cannot leak or restart capture. Tests cannot establish physical microphone accuracy or beep loudness. |
| RF-08 | Practice/Sequence live views and synthetic guide examples share one read-only presentation, with injected snapshots. Guides never acquire microphone resources or save detections; existing initial pause, scenarios, endpoints and return drafts remain. |
| RF-09 | Public b/main retains two-gun new creation, no new custom creation/advanced graphs and old-data use/edit/restore. Full dev retains five-gun creation, custom creation, graphs, Full initial simulation and explicit remembered choices. Keep signed Access gating, compile-time exclusions and destination branch configs. |
| RF-10 | Public offline refresh includes lazy assets and preserves IndexedDB. Private preview remains no-store and retires app-shell caches without deleting user data. No new persistence or upload policy. |
| RF-11 | Preserve native semantics, accessible names, keyboard operation and safety-dialog behavior. A genuine pre-existing UX defect must be reported as a separate fix; a static-audit default does not authorize a visible behavior change. |
| RF-12 | Preserve Vite minification, source-map exclusion, edition/source metadata, worklet/service-worker packaging and root commands. Compare lazy/initial bytes and loading behavior; do not claim that moving files improves speed. |
| RF-13 | Every migrated page/component/hook has meaningful tests and explicit ownership. Keep docs/tree/component maps, current help examples and media provenance synchronized; source-manifest updates follow actual review. |
| RF-14 | Performance must not regress. Establish reproducible startup, interaction, audio/timer, memory and payload baselines before implementation; compare every relevant slice and the final app against them. Keep React/optional code out of the initial critical path where possible. If a shell strategy makes the app slower or materially increases critical transfer, change the strategy before advancing. |

## Performance contract

The unchanged public build currently emits approximately **170.91 KB initial app JavaScript / 51.19 KB gzip**, **61.45 KB CSS / 13.08 KB gzip**, and a separately lazy **222.62 KB informational/React chunk / 69.72 KB gzip**. These are rounded build output sizes, not measured startup or frame rates. The worklet and service worker remain separately bundled/minified. Preserve identifier shortening where safe, tree shaking, CSS whitespace removal, no source maps and no raw source modules in dist. Keep source code readable; do not compress editable source files by hand. HTTP compression at Cloudflare is a separate owner-managed serving concern.

Moving the existing lazy React runtime onto the shared-shell startup path could add roughly its current 69.7 KB gzip to the critical download, before accounting for changed chunk composition. That would be a real regression risk. P0 must measure this boundary; P2 must retain prerendered usable content, isolate noncritical hydration/loading or choose another ownership strategy if a straightforward shell migration exceeds the measured budget. Do not approve the tradeoff merely because a build passes or React is considered a best practice.

The proposed performance gates are:

- Record exact raw/gzip asset bytes, initial request graph, cold/warm load-to-usable-app, navigation/input response, long tasks, frame behavior during practice/meter updates, capture/cue timestamp latency and resource cleanup. Record source, edition, browser, device/CPU/network profile and cache state.
- Use the same pinned renderer and CI runner class, deterministic fixtures and 10 cold plus 10 warm runs for the baseline and candidate. Chromium can use fixed CPU/network throttling; WebKit comparisons use a consistent unthrottled setup. Real iPhone Safari/Home Screen acceptance remains a separate final check.
- Initial critical JS/CSS raw and gzip totals must not grow above the accepted baseline without an explicitly reviewed strategy revision. Compare the complete chunk graph so moving bytes into a second mandatory request cannot evade the gate. Optional chunks and total installed/offline bytes must also be reported; existing public offline coverage must remain complete.
- No reproducible regression in median or p95 startup, navigation/input response, timing/detection behavior or practice rendering. Treat differences within a proposed 5% laboratory noise band as inconclusive: repeat the controlled comparison before drawing a conclusion, rather than declaring the app improved or accepting a known slowdown.
- Keep high-frequency microphone samples and timing engines outside whole-app React state. Update isolated meter/timer views with stable subscriptions; do not add render/effect cascades, duplicate timers or synchronous storage work on the audio path. Preserve existing detection/cue timing semantics.
- Compare live contexts/tracks/listeners/timers and retained memory after repeated start/stop/navigation. There must be no new resource leak or growth across repeated cycles. Inspect any added long task during recognition; do not claim hardware timing from synthetic tests.

P0 produces actual latency/memory budgets from measurements; these timings have not yet been measured in this planning-only pass. Route/code splitting, derived state, shared services, fewer duplicate listeners and removing dead code are candidate improvements, not promised speedups. A stage is blocked by a demonstrated regression even when its numerical test coverage is high.

## Measured tests and gaps before approval

Fresh Free baseline on 2026-10-17: **352 Jest tests / 37 suites passed**. Both Node smoke entry files pass (the current runner reports two test files). Optimized public build, artifact/minification check and visual fingerprint check pass. The released source's [main CI 39020607342](https://github.com/matosaru/dryfire/actions/runs/39020607342) is confirmed successful, including existing built-app integration and pinned both-edition browser comparisons. Those browser results are observed CI evidence, not a fresh local renderer run in this planning pass. The first sandboxed build failed with spawnSync git EPERM; the unchanged build succeeds with the permitted runner, so this is recorded as an environment restriction, not a source fix.

| Measurement | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| Existing configured coverage scope | 90.54% | 84.37% | 94.13% | 94.35% |
| Expanded inventory: all src JavaScript, web TS/TSX and shared UI | 43.38% | 50.66% | 50.67% | 47.86% |

The configured legacy scope includes only audio, classifier, storage, detector and evaluation, alongside the typed web/UI code. It omits important controllers, engines and orchestration. In the expanded **Jest** report, main, practiceController, sessionController, practiceGuideController, sessionPresentation and the custom editor each report 0% lines. Existing Playwright workflows exercise several of these paths; 0% Jest coverage does not mean they have never been tested, and browser coverage is not included in these percentages. Workers/build tooling are not part of this expanded denominator either.

Other gaps: no numerical coverage thresholds currently enforced; Jest discovers typed .test.tsx files but not future colocated .test.ts hooks/service files; screen ownership entries often point to template/storage tests rather than complete page interaction tests. P0 must include separately packaged runtime workers in the coverage inventory and report them distinctly from tooling/test helpers. Therefore the baseline is **not yet sufficient to migrate every area safely**. The first approved work must strengthen measurement and characterization, before changing production ownership.

The generic strict UI audit reports **72 findings**: six native-select owner declarations, 62 statically actionless buttons and four native-validation forms. It is not green. Central event bindings make many button findings inconclusive; existing native-control choices are documented in [current React architecture](../../architecture/react-migration.md). Triage against browser tests; do not replace functioning controls or native validation just to silence this checker. Planning does not claim full accessibility/audit compliance.

### Test contract for each migration slice

- **Before code movement:** characterize the current component/feature and all affected success, error, empty, pending, cancellation and recovery paths. Tests must pass on the legacy implementation; if intended approved behavior is broken, isolate and document the defect rather than silently changing the baseline.
- **Unit/component:** engines/limits remain tested; add accessible behavior, props, keyboard, disabled/error states, stale async cancellation, Strict Mode cleanup and single-callback tests. Match .test.ts and .test.tsx discovery before adding such files. Do not test private implementation details or use snapshots as the only evidence.
- **Integration:** exercise the real compiled app/HTML and controllers against deterministic audio/storage boundaries: guards, safety, gun ownership, invalid drafts, Back/Forward, failed saves/retry, delayed chunks, offline refresh and both editions. Keep domain engines real where they are under test.
- **Visual:** compare the existing 390 references in pinned Chromium/WebKit with both editions/themes, 320/390 px captures and 1024 px layout checks; retain zero pixels above threshold 0.005, no masks, retries, automatic baseline acceptance or weakened assertions. Preserve 83 current captures and 12 actual-guide exports.
- **Coverage proposal for approval:** after broadening measurement, ratchet the expanded per-metric baseline upward, never lower it through exclusions. Every newly extracted runtime UI/adapter package targets at least 90% statements/lines/functions and 80% branches, or its higher measured pre-move value. Cover every listed critical transition irrespective of percentages. If a gate is infeasible, report it and revise the plan before migration; do not add trivial tests or ignore branches to reach a number.
- **Evidence:** retain named test runs, source/edition metadata, coverage reports, expected/actual/difference images and visible-defect probes. Hardware Safari/Home Screen acceptance remains separate from deterministic browser tests.

## Completion and release

All 13 screen interiors and the single shell must have tested owners; no obsolete parallel HTML/DOM renderer or duplicate styling remains. Pure/audio/storage implementations may keep their existing file locations when moving them has no value. Update ownership maps and remove obsolete code only after consumers and reference checks pass.

Shared increments enter b, then synchronize into dev preserving Full configuration. Only a checked b → main PR promotes production. The owner manages Cloudflare. A merged PR, test success or prepared artifact is not evidence of live deployment. [plan.md](plan.md) specifies gates, rollback and status; further implementation awaits the owner's approval.
