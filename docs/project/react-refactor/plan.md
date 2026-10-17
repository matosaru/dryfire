# Remaining React refactor plan

CHG-048 · revision 1 · 2026-10-17 (Europe/Vilnius) · **Approved by CHG-049; P0 complete; P1 validation in progress.**

[spec.md](spec.md) is the refactor contract, source analysis and test baseline. This is the single active execution plan, superseding the earlier CHG-046/047 roadmap for remaining work. The owner has reviewed this plan and approved **“full autonomy for implementation”** with initial changes on b/dev (CHG-049). The planning pause is satisfied; continue through the gates without repeated approval. Existing CHG-047 code remains released.

## Current status

| Item | Status |
| --- | --- |
| Requested article and first-party guidance | Read; recommendations mapped in spec.md; earlier article-access blocker resolved |
| Workspace/TypeScript/React test foundation | Already implemented |
| About/Contact, PageHeading, InformationCard | Already implemented and released by owner PR #24 |
| Current structure and expanded coverage inventory | Complete for this planning pass; meaningful coverage gaps identified |
| Additional characterization/coverage gates | P0 complete on b/dev; canonical both-edition screenshot/performance jobs green |
| AppShell and eleven remaining screens | Not migrated |
| Current increment | P1: typed route-owner resolver and pre-shell selection characterization; rendering unchanged |

The goal is structural improvement with equivalent design and behavior and no performance downgrade. Keep JavaScript/CSS minification, tree shaking and lazy loading; demonstrate improvements with measurements rather than assuming React or a folder change is faster. Build the safety net first; then work from lower-risk shared/persistent views toward audio/session lifecycles. Do not combine a framework transfer, algorithm rewrite, CSS redesign and storage migration in one step.

## Stages and exit gates

| Stage | Approved work | Required evidence before advancing | Status |
| --- | --- | --- | --- |
| P0 — Strengthen the baseline | Expand coverage to actual runtime modules; discover .test.ts and .test.tsx; map screen/component → requirements → unit/integration/visual tests. Add missing characterization for the first shell boundary and classify the strict audit's 72 findings. Measure exact payload/critical requests, repeated cold/warm startup, interaction, audio/timer rendering and cleanup/memory. | Legacy code passes new tests before any app refactor; reproducible coverage/performance reports and enforceable budgets, explicit outstanding gaps; full source/visual baseline green in both editions | Complete; b 39024546616 and dev 39024848087 green |
| P1 — Define tested boundaries | Add small navigation/context/edition/service interfaces and reusable fixtures. Add tests before extracting responsibilities from main.js. Keep existing controllers/engines as the implementation. | Import/ownership checks, real compiled-HTML integration tests, unchanged emitted CSS and all reference comparisons | In progress; pushed b 54a3c32 / dev 783d452; pinned images pass, performance matrix failure under investigation |
| P2 — Migrate the shared shell | Extract BrandHeader, InfoFooter and BottomNavigation, then AppShell. Prove a loading/ownership strategy that does not move the lazy React cost onto the critical startup path without mitigation. Transfer chrome events/state once through explicit callbacks/adapters. Keep legacy page interiors and drafts intact during coexistence. Migrate gun/safety context only after its own guard/focus tests pass. | One header/main/footer/nav across all 13 states; BETA/context/focus/scroll/safe-area/keyboard parity; no duplicate handlers or lost drafts; 320/390/1024 checks, unchanged screenshots and passing critical-payload/startup budgets | Not started |
| P3 — Home and gun management | Migrate HomePage, GunsPage and GunSetupPage with feature-owned form state and existing storage APIs; retain About/Contact. | First/add/edit/delete/last-delete, async profile loading, invalid drafts, type images, atomic two/five-gun limits and old-library restore/export tested in both editions | Not started |
| P4 — Settings, Learn and Live Listen | Migrate each page separately; adapter hooks reuse existing service lifecycles. Preserve native inputs and browser capability reporting. | Preference ownership/theme/system mode, reset scopes, unsupported Safari controls, 10-sample limits, optional labels, safety/cancel/late-permission/continuous-recognition cleanup pass before and after each page | Not started |
| P5 — Drills catalog and History | Migrate DrillsPage and HistoryPage; keep optional custom editor/graphs behind existing edition boundaries. | Built-ins/custom legacy edit/create guards, separate history/session deletion, filter/comparison semantics, save/review navigation, text-only Free and Full graphs; same screenshot references | Not started |
| P6 — Practice, Sequence and guides | Characterize controllers/presentation first, then move the three pages and shared PracticeRun/Review and SequenceRun/Review components. Live and synthetic examples render the same components; engines stay unchanged. | Readiness, early miss, fast first click, cue exclusion, zero/random/fixed delay, automatic Single repeats, all modes/endpoints, pause/background/stop, save/retry and ownership pass; all 12 GIF exports regenerate and remain scenario/pixel equivalent | Not started |
| P7 — Retire temporary code and verify release | Remove unused templates, DOM writes, legacy CSS owners and migration adapters only when their last consumer is gone. Update maps/tree/docs; compare packages/bundles/loading and security boundaries. | No parallel renderer, circular imports or source leaks; clean install and complete CI, both editions, unchanged visuals, compatible backups/offline behavior; final repeated performance comparison shows no regression, and hardware verification status is explicit | Not started |

P0 is not permission to refactor the entire orchestration layer. It must first make the next slice safe. Later controllers receive their characterization tests before their own stage; this avoids waiting for a blanket coverage percentage while still leaving a documented whole-app gap ledger.

### Smallest first implementation after approval

1. Test-only/tooling change: broaden coverage and typed-test discovery; record the measured denominator and per-package gates. Establish performance benchmarks/budgets against the unchanged app before selecting the shell-loading strategy.
2. Test-only change: characterize shell navigation/context, active tabs, initial no-gun state, safety confirmation, pending capture, retained drafts and informational lazy loading against the existing shell.
3. Only once those pass, extract the static BrandHeader/InfoFooter/BottomNavigation source packages with their own CSS/tests, retaining selector order and DOM structure.
4. Transfer shell rendering/events and integrate AppShell as a separate reviewed change. Keep page sections/drafts stable and avoid mounting a second shell or letting React recreate controller-owned form nodes.

No new store/router/component library is required. Native controls, service APIs, stable IDs and build/public asset paths remain. A proposed abstraction must solve an actual shared responsibility; folder symmetry alone is insufficient.

## Page migration and test ownership

| Current state | Target page | Characterization priorities |
| --- | --- | --- |
| gunSetup | GunSetupPage | First/add/edit validation, cancel/back, invalid drafts, restore and transaction limits |
| home | HomePage | Gun-owned summaries, readiness/loading and context navigation |
| guns | GunsPage | Selection locks, edit/delete, final-gun fallback and every owned-data deletion scope |
| learn | LearnPage | Required trigger/optional sounds, recording/calibration limits and asynchronous cancellation |
| drills | DrillsPage | Mode/preset selection, retained editor draft and public/Full creation boundaries |
| practice | PracticePage | Six-mode configure/run/review, first/early click, automatic Single and durable retry |
| session | SequencePage | Actual ordered steps, configuration/drafts, partial results and save/recovery |
| practiceGuide | PracticeGuidePage | Correct source/gun/mode, no audio/storage side effects, exact draft return and matching examples |
| recognize | LiveListenPage | Repeated detections, ignored unknowns, safety and capture teardown |
| history | HistoryPage | Selected-gun results, independent clear actions, comparable Full graphs and old records |
| settings | SettingsPage | Device vs gun preferences, capability reports, backups and explicit reset scopes |
| about | AboutPage — already React | Retain existing lazy loading, keyboard Back, copy/edition and no-capture tests |
| contact | ContactPage — already React | Retain mailto, independent navigation, footer and no-capture/data tests |

Update the existing component map rather than adding a second runtime screen registry. Every new page/component source package has its own CSS and tests. Hook/service tests are colocated and must actually be discovered by Jest.

## Test execution and protection against regressions

### Before each production-code slice

- Start from a checked, recorded branch revision and clean lockfile installation. Preserve a rollback commit.
- Run the existing baseline commands below, then add focused characterization and integration tests that pass before moving the implementation.
- List the slice's DOM/event/draft/effect owners and asynchronous boundaries. Resolve ownership before editing; a legacy writer and React cannot share control of the same region.
- Record coverage for affected modules, not only the existing narrow configured total. Enforce the spec's approved package floors and higher-baseline ratchets.
- Freeze the current 390 browser references, 83 captures and 12 guide exports. Use existing deterministic libraries, clock, media fakes and selected sequence endpoints.
- Record initial critical request bytes and repeated cold/warm timings. Preserve minification and verify the entire lazy chunk graph. Do not begin a shell transfer without an acceptable startup strategy.

```bash
npm ci --no-audit --no-fund
npm run verify:profile
npm run typecheck
npm run lint:components
npm run verify:architecture
npm run docs:check
npm run test:smoke
npm test
npm run test:coverage
npm run build
npm run verify:dist
npm run deploy:check
npm run visual:review
```

P0 must update coverage collection/discovery before the ordinary coverage command can represent the wider runtime. The planning measurement used CLI overrides, without modifying Jest configuration:

```bash
npm test -- --coverage \
  --collectCoverageFrom='src/**/*.js' \
  --collectCoverageFrom='apps/web/src/**/*.{ts,tsx}' \
  --collectCoverageFrom='packages/ui/src/**/*.{ts,tsx}' \
  --collectCoverageFrom='!**/*.test.*' \
  --collectCoverageFrom='!**/index.ts' \
  --coverageReporters=json-summary --coverageReporters=text-summary
```

Run public and preview builds/artifact validation separately, since one build replaces dist. Execute browser tests only against the matching built edition. In the existing pinned CI image run the normal test:visual and visual:probe commands for each edition; outside that image use the repository's Docker helper and environment contract in [the visual guide](../../development/VISUAL_TESTS.md). Do not substitute a system-browser image run as canonical evidence. Target currently includes **246 public + 258 preview** checks across Chromium/WebKit, including 390 image comparisons and functional/layout workflows; do not treat all 504 checks as screenshots.

### Required integration scenarios

| Area | Test cases that block a migration when affected |
| --- | --- |
| Shell/navigation | Every screen in both themes; first-gun disabled tabs; context hidden/shown correctly; capture/profile-loading locks; Back/Forward, keyboard/focus, long content and fixed navigation |
| Drafts/lazy/offline | Invalid/unsaved forms survive guides/history; delayed or failed information chunk remains navigable; public offline reload includes lazy code; private cache retirement preserves data |
| Guns/data | New/old libraries, add/edit/delete/last gun, independent owned deletion, import/export formats and failure/retry; no record removed by a refactor |
| Audio/safety | No capture before confirmation; denied/delayed permission; cancellation before resolution; Strict Mode remount; microphone-ready countdown; early/fast clicks; stop/pause/background teardown |
| Sessions | Six modes and ordered sequences; fixed/random/zero delay; automatic repeat targets; pending/failed save; retry without duplicate records; correct owning gun |
| Editions/security | Public direct-submit/revealed-control guards and bundle omissions; Full default and explicit Free simulation; no data loss when switching; signed private asset checks |
| Guide/media | Live/demo shared components, selected endpoints, initial pause/play/replay/background pause, unchanged source draft and no microphone/storage API calls |

Component tests should use accessible user interactions. Integration tests must execute actual application composition/controller/service boundaries, not duplicate implementation in the test. Test doubles replace permissions, input streams, clocks and storage failure conditions deliberately; engines and formatting under test remain real.

### After a slice

Run the same baseline plus affected characterization/component tests and full both-edition browser CI. Inspect expected/actual/difference artifacts on any mismatch; investigate rather than weaken thresholds or accept a new baseline. Ensure tests fail when the intended behavior is broken, including the existing visible-defect probes.

Extract CSS by preserving selector order and computed styles first. Compare the optimized CSS with the baseline index-DnLrZEQ0.css and inspect any differences; unchanged appearance is mandatory even if bundling changes its bytes. Do not add wrappers that alter sizing, focus, scroll, semantic landmarks or screenshots.

Apply [the performance contract](spec.md#performance-contract) after every relevant slice: critical raw/gzip JS/CSS cannot silently grow; cold/warm median/p95 startup and input response, practice frame/timing behavior and repeated cleanup must not reproducibly worsen. Run the complete comparison again at P7 against the original released baseline, not just the immediately previous increment. A fast desktop screenshot run does not establish Safari performance. If a result falls within the proposed 5% noise band, repeat it; if a regression persists, fix or revise the strategy before release.

Update component ownership, architecture/tree, linked docs and help/media source manifests in the same reviewed slice. Re-export GIFs after relevant presentation/source changes and review frame timing/content and palette differences; do not claim GIF byte identity if it is not measured. A source fingerprint update alone is not visual review.

## Publication, rollback and approval

Each accepted shared slice goes directly to b, then into dev with its Full config/initial simulation retained. Full-only adaptations remain on dev. Promote tested b to main only through the normal release PR; no direct main push, force push or dev → main release. Cloudflare remains owner-managed.

If a behavior/image/data/security gate fails, stop that slice, retain logs and revert only the responsible new changes. Do not reset browser storage or update expected references to make a structural refactor pass. Resume from the last verified increment after addressing the cause. Keep branch ancestry and published history intact.

CHG-049 approves this specification, order and gates. Begin with P0, then advance through verified exit gates without repeatedly requesting permission for unchanged scope. Any actual change to product design/functionality is a separate requirement revision and approval. Publish shared work to b/dev; main remains a later checked production PR.
