# React structure and reusable-component refactor plan — CHG-046

2026-10-16 · **Plan only. No React migration, component rewrite, new framework dependency or CSS redesign has started.** Execute only after the design release is accepted and the owner starts this plan. Preserve existing appearance, behavior, user data and required tests throughout.

## Research status and recommendation

This app is currently **Vite + vanilla JavaScript**, not React: package.json contains no React dependency. It already has reusable page/shell fragments, pure timing/recognition engines, durable storage and shared live/help presentation. A folder refactor and a React migration are separate changes. Keep Vite and migrate incrementally; do not combine the migration with a redesign, new state framework, test-runner replacement, billing work or native apps.

The requested [DEV.to folder-structure article](https://dev.to/pramod_boda/recommended-folder-structure-for-react-2025-48mc) returned **HTTP 403 from the environment's restricted network**. Its content has **not been read**, so exact agreement with its examples is not yet established. The environment draft adds dev.to/react.dev/testing-library.com (and api.github.com for release operations), preserving existing domains; saving does not apply those permissions. **R0 remains pending:** once access is enabled, read the article, record its actual tree and compare each recommendation with the target below before implementation. Do not pretend the proposed tree is copied from an unread article.

Authoritative first-party material was read through the permitted GitHub source repositories:

- React, [Thinking in React](https://github.com/reactjs/react.dev/blob/main/src/content/learn/thinking-in-react.md): derive a component hierarchy from the existing mockup, build static parity first, then add minimal state/data flow.
- React, [You Might Not Need an Effect](https://github.com/reactjs/react.dev/blob/main/src/content/learn/you-might-not-need-an-effect.md): derive display values during render; user events stay in handlers; Effects synchronize with external systems.
- [React Testing Library](https://github.com/testing-library/react-testing-library/blob/main/README.md): exercise accessible user behavior rather than implementation details.

These sources support the architecture principles below; they do not prescribe one mandatory folder tree or a separate published npm package for every UI element.

## Current code findings

| Area | Current state | Refactor objective |
| --- | --- | --- |
| Application orchestration | src/main.js is about 1,218 lines and owns DOM wiring, gun context, routing and many actions | Thin app composition plus feature controllers/hooks and explicit service ports |
| Styling | One approximately 711-line styles.css contains shared tokens, theme and page/control rules | Keep shared tokens/reset/layout; colocate component and page CSS without changing computed styles |
| Pages | 13 shared-wrapper page states; maintained screen-map and captured states | Typed page composition with the same header/footer/BETA/sticky navigation and stable state ownership |
| Practice/sequence | Pure engines plus lifecycle controllers and shared sessionPresentation.js | Keep pure engines; React views render their snapshots through one shared live/help view |
| Persistence | IndexedDB schema 3 and backup format 4 with compatibility tests | Wrap existing repository operations; no schema/key/ownership migration for this refactor |
| Audio | Worklet, detection, input readiness, cue exclusion and cancellation already covered | Keep the audio boundary; test teardown/double-start/background behavior before adding React hooks |
| Editions | Public b/main; private Full dev with signed asset gate and Free/Full simulation | Keep compile-time filtering, two-gun public creation rule, old-data access and destination branch profiles |
| Tests | Jest pure/storage tests, smoke/installability checks, Playwright Chromium/WebKit workflows and reviewed images | Retain all existing checks; add meaningful colocated component/hook/contract tests |

## Preliminary static audit

The frontend-design premium audit was run in report and strict modes against the current vanilla application. It reports 74 findings (6 undocumented native-select ownership decisions, 64 statically actionless buttons and 4 forms without novalidate); strict is **not green**. The button check cannot establish the effect of this application's central addEventListener bindings, which the browser workflows exercise. Do not interpret the raw count as 74 confirmed broken controls or silence it by replacing functioning interactions. R1 must map canonical native/form/event ownership to existing requirements/tests, verify each finding and retain real accessibility gaps for scoped correction. The audit does not replace the passing product regression checks or authorize a redesign.

## Proposed structure

Use feature-based page ownership and a small shared layer. Every component is a self-contained source package/folder with a public entry, its own CSS file and tests. Buildable npm workspaces are appropriate for larger independently reusable boundaries, not every span or icon. No package needs to be published to npm.

```text
dryfire/
├── apps/
│   └── web/
│       ├── index.html
│       ├── public/                  # PWA/brand assets, unchanged URLs
│       └── src/
│           ├── app/                 # bootstrap, providers, navigation composition
│           ├── pages/               # thin route/screen compositions
│           │   ├── GunSetupPage/
│           │   ├── HomePage/
│           │   ├── DrillsPage/
│           │   ├── PracticePage/
│           │   ├── SequencePage/
│           │   ├── PracticeGuidePage/
│           │   ├── GunsPage/        # library + existing add/edit states
│           │   ├── LearnPage/
│           │   ├── LiveListenPage/
│           │   ├── HistoryPage/
│           │   ├── SettingsPage/
│           │   ├── AboutPage/
│           │   └── ContactPage/
│           ├── features/            # gun, learning, practice, history, preferences
│           │   └── practice/
│           │       ├── hooks/       # lifecycle adapters, not a second timing engine
│           │       ├── services/    # ports to existing audio/storage services
│           │       ├── components/
│           │       └── types.ts
│           └── styles/              # reset, tokens, themes, global layout only
├── packages/
│   ├── ui/                          # shared component source packages
│   │   └── src/
│   │       ├── Button/
│   │       ├── AppShell/
│   │       ├── BrandHeader/
│   │       ├── BottomNavigation/
│   │       ├── InfoFooter/
│   │       ├── SafetyDialog/
│   │       ├── GunSwitcher/
│   │       ├── MicrophoneMeter/
│   │       ├── PracticeCounters/
│   │       └── ResultCard/
│   ├── practice-ui/                 # shared live/demo run and review views
│   ├── domain/                      # existing pure engines, recognition, limits
│   ├── storage/                     # existing IndexedDB/backup implementation
│   ├── audio/                       # microphone/worklet/cue adapters
│   └── testing/                     # deterministic fixtures and render helpers
├── workers/                         # public/private serving and service/worklet entry points
├── tools/                           # builds, export, doc/visual verification
├── visual-tests/                    # user workflows + exact reviewed browser references
├── tests/                           # retained cross-package contracts during migration
└── docs/                            # requirements/design/architecture/history ownership unchanged
```

The exact split and naming are proposed until R0 compares the requested article. Map all existing registry states, including gunSetup, guns, recognize and practiceGuide, explicitly; folder names must not silently change persisted route keys or invent new public routes.

A component package contract:

```text
MicrophoneMeter/
├── index.ts                  # explicit public exports
├── MicrophoneMeter.tsx       # rendering/accessible props only
├── MicrophoneMeter.css       # scoped class rules; optional CSS Module after parity
├── MicrophoneMeter.test.tsx  # behavior/a11y/error/quiet/disabled states
└── README.md                 # props, states and real/demo usage when useful
```

Pages use the same pattern (Page.tsx, Page.css, Page.test.tsx); hooks/services have colocated tests as well. If the owner means a literal package.json/npm workspace **for each component**, that can be specified, but it adds per-package tooling/peer-dependency maintenance without improving visual parity. The recommended initial interpretation is isolated source packages with explicit exports inside a few npm workspaces. Keep one root lockfile and familiar root build/test commands.

## Page ownership map

Map the current internal state IDs explicitly; keep those IDs and browser-history semantics during migration.

| Current state | Proposed page owner |
| --- | --- |
| gunSetup | GunSetupPage (first/add/edit with the existing gun-owned draft) |
| home | HomePage |
| guns | GunsPage |
| learn | LearnPage |
| drills | DrillsPage (catalog and existing custom editor) |
| practice | PracticePage (Configure/Run/Review) |
| session | SequencePage (Configure/Run/Review) |
| practiceGuide | PracticeGuidePage (shared live/demo view) |
| recognize | LiveListenPage |
| history | HistoryPage |
| settings | SettingsPage |
| about | AboutPage |
| contact | ContactPage |

Each page gets its own component, CSS and tests. Keep all existing screen/draft owners mounted initially, or introduce equivalent persistent draft state before unmounting; changing a route must not discard invalid/unsaved setup values. No React Router or new URL scheme is needed merely to replace the rendering layer. Only one shell owns the header/footer/navigation while vanilla and React pages coexist; start with isolated content mounts and replace the shell once, rather than rendering duplicate shells.

## Reuse and dependency rules

- Page → feature → shared UI/domain/service ports. Shared UI cannot import pages, storage or microphone acquisition. Pure domain code cannot import React or browser DOM. Avoid circular feature imports and a growing miscellaneous utils folder.
- AppShell owns header/BETA, context slots, content, About/Contact/footer and bottom navigation exactly once. Pages provide content and declared context policy; the guide still omits setup controls while retaining navigation/footer.
- PracticeRunView and SequenceRunView render real and simulated props through the **same** component. Examples inject deterministic snapshots/synthetic levels; live capture/persistence stay outside presentation. Do not recreate a separate help animation skin.
- MicrophoneMeter, counters, delay fields, result rows and safety dialog expose explicit props/events. Share actual domain behavior; do not create abstractions merely for matching filenames.
- Keep state near its owner. Gun context/edition/device preferences are app-level only when shared. Use controlled inputs or a persistent draft owner so Back/Forward retains invalid/unsaved forms. Do not mirror derived completed/left/countdown state in Effects.
- Browser/microphone integrations have stable adapters and cleanup. React Strict Mode remounts, rejected permission, cancellations and visibility changes must release tracks/contexts/listeners/timers; mounting a help page must never acquire audio. Preserve synchronous user-gesture requirements for Safari start audio.
- Keep identifiers and semantic DOM/layout stable initially. TypeScript can wrap existing JavaScript with gradual type checking; do not rewrite tested pure algorithms just to change file extensions.
- Start with current class names, selector order and CSS specificity. Split CSS in reviewed slices while preserving the existing cascade. CSS Modules or renamed classes follow only when browser references still match. No replacement component/theme library during parity work.

## Test coverage contract

Every functional component/page/template package needs meaningful tests. Coverage is a map of behaviors/states, not just a percentage or a smoke render for every file.

| Layer | Required coverage |
| --- | --- |
| Shared template/layout | One header/footer/nav, correct BETA/active tab, contextual gun/safety policy, landmarks/focus, safe areas/sticky bottom and reachable final controls |
| Inputs/UI components | Accessible names, keyboard/pointer use, disabled/pending/errors, boundaries, invalid drafts and theme states; meter clamping and quiet/no-input text |
| Page/feature integration | Add/edit/delete/last-gun deletion; sound limits/optional calibration; selecting/configuring/running/reviewing modes; history deletion; restore/export; navigation guards; About/Contact/footer links |
| Hooks/services | Readiness before countdown, first fast click, early miss, cue suppression, zero-delay repeat, teardown/cancellation, rejected permissions, background/return, failed save/retry and gun ownership |
| Pure domain/storage | Retain existing engine/classifier/recognition, backup compatibility, transactional creation limits and data deletion tests unchanged |
| Editions/security | Public bundle/creation restrictions and legacy-data use; private signed Access boundary; Full default/Free simulation only in dev; no public override |
| Visual contracts | Existing pinned Chromium/WebKit, both editions, Dark/Light, 320/390 px references; 1024 px shell/layout checks; animation posters and critical timeline states; downloadable differences and deliberate-defect probes |
| Manual device acceptance | iPhone Safari/Home Screen microphone readiness, cue loudness/latency, permissions and interruption behavior; synthetic tests cannot prove hardware results |

Keep Jest initially and add React Testing Library, DOM/user-event matchers and a DOM environment for components. Keep Playwright for browser layout/capture/audio lifecycle integration. Do not replace existing assertions or weaken comparisons to accommodate the migration. Add React Hooks lint rules, TypeScript checks and package-export/dependency checks; require components to have matching CSS/test files, while reviewing the quality of those tests. Establish measured coverage before proposing numerical thresholds; do not claim every branch is currently covered.

## Implementation sequence and exit gates

| Step | Work | Exit gate | Status |
| --- | --- | --- | --- |
| R0 | Read the requested article once allowed; record actual tree, adopt/reject comparison and confirm package meaning | Plan source comparison complete; no unsupported article claims | **Blocked on website access** |
| R1 | Inventory all components, states, selectors, side effects and package dependencies; freeze the just-released design evidence | All 13 registry states mapped to owner/tests; accepted 390 browser images, 83 captures and 12 guide exports frozen; existing full CI green | Planned |
| R2 | Introduce root npm workspaces and import/export boundaries without changing rendering; move pure code only as needed | Old root commands, both editions, docs/artifact checks and every old test still pass | Planned |
| R3 | Separate tokens/global CSS and extract lowest-risk shared components without changing DOM/cascade | Component interaction tests plus unchanged existing browser references | Planned |
| R4 | Add React/TypeScript harness behind an isolated migration boundary; migrate AppShell and About/Contact first | Static pixels match before interactions; history/footer/BETA/keyboard tests pass | Planned |
| R5 | Migrate gun management, settings, Learn and History one feature at a time | All data/ownership/restore/navigation/edition cases pass; no schema change or lost draft | Planned |
| R6 | Migrate Practice/Sequence/Guide last, preserving pure engines and one shared real/demo view | Full audio/cue/repetition/save/cleanup tests, screenshots and refreshed matching GIF exports; iPhone acceptance | Planned |
| R7 | Remove obsolete DOM controller/template code only after all 13 states use the approved architecture; update architecture/tree and maintenance commands | No duplicate view layer, dead selectors or stale media; complete clean CI/build/profile/security checks | Planned |

Do not move folders, rename IDs, split CSS and change framework in one unreviewable change. Small steps go to b under the current workflow; sync each verified shared increment to dev preserving Full code/profile, and release through a checked b → main PR. Full-only adaptations stay in dev. Keep a rollback point for every accepted increment. Native apps and paused commercial features remain outside this plan.

## Unchanged-visual and no-regression release rules

1. Use the existing pinned renderer, fixtures and image fingerprints as the contract. A refactor is expected to compare against them successfully; a failure triggers investigation, not automatic baseline acceptance.
2. Retain zero allowed above-threshold pixels, the existing documented color threshold, no masks/retries and both-edition visible-defect probes. Do not replace app-rendered pages with test-only mock markup.
3. Test original session engines and storage formats before and after each move. Data continuity, Free/Full boundaries, safety confirmation and navigation are release blockers.
4. Maintain a component → requirements → screen states → behavior tests → visual references map. A new component is complete only when its meaningful functional/template states and CSS are reviewed.
5. Update actual help pages, screenshots, current GIFs/source manifests, registry/site tree and implementation history after a relevant approved visual change. A pure refactor should preserve visuals and does not authorize redesign.
6. Compare bundle sizes/startup and meter/timer rendering cost. Start with the current optimized artifacts; agree a measured budget before migration, lazy-load optional/history features and avoid rendering the entire app on every audio sample. No arbitrary performance claim from file organization alone.
7. Keep main PR protection and branch-specific build configuration. Production promotion requires passing source, smoke, domain, component, integration, both-browser visual, artifact and routing checks.

This document proposes a maintainable architecture and a controlled migration; it does not certify the unread article, promise zero regressions or authorize implementation. Update the delivery tracker as each approved stage is completed.
