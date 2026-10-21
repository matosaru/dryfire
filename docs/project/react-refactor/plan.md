# Remaining React refactor plan

Updated 2026-10-20 (Europe/Vilnius). Approved for autonomous implementation by CHG-049; CHG-050 defers intermediate optimization until structural refactoring is finished. [spec.md](spec.md) is the contract; [context.md](context.md) is the compact resume handoff. This is the single active execution plan; completed increment evidence belongs in [implementation history](../implementation-history.md).

## Current status

Work goes to **b only**. Dev synchronization is paused to save credits; main remains PR-only and owner-released. No repeated implementation approvals are needed for this unchanged scope.

| Stage | Status |
| --- | --- |
| P0 — Baselines and safety net | Complete |
| P1 — Typed route/context/service boundaries | Complete |
| P2 — Shared shell and reusable controls | Structural scope verified |
| P3 — Home and gun management | Presentation/handoff scope verified; startup-fallback retirement stays in P7 |
| P4 — Settings, Learn and Live Listen | Presentation/handoff scope verified for Settings, Learn and Live Listen; native fallback retirement stays in P7 |
| P5 — Drills and History | Presentation/runtime handoffs verified; startup cleanup stays P7 |
| P6 — Practice, Sequence and guides | Presentation/runtime handoffs locally verified; native startup cleanup remains P7 |
| P7 — Cleanup, optimization and final acceptance | Active:12 templates, unused compiler work and25 CSS wrappers retired; native startup/package/optimization remain |

Latest P6 live run/review increment passes **895 tests /131 suites**, coverage/type/lint/architecture/docs/smoke, both-edition Chromium workflows, both minified artifacts and original CSS/media/frame equivalence checks. Shared structural packages, controller safety net and pure result/run/review models are verified. Stateful component composition and live Practice/Sequence Run/Review handoffs are verified. Shared read-only guide runtime is verified too; parent sources and runtime handoffs are verified with retained configuration/service islands. Canonical P5 `d4d5aa9` validation and both screenshot editions pass; original performance budgets and public deliberate-slowdown proof remain failing. Native startup cleanup and final performance acceptance remain P7.

## Completion checklist

- [x] Read the requested structure article and first-party guidance; prepare approved spec/plan.
- [x] P0: broaden test discovery/coverage, deterministic fixtures, visual and performance gates.
- [x] P1: typed route/context boundaries and prerendered six-mode catalog.
- [x] About/Contact, PageHeading and InformationCard already released.
- [x] P2: AppShell, BrandHeader, InfoFooter, BottomNavigation and explicit deferred chrome ownership.
- [x] P2: NumberInput, CalibrationCatalog, GunSwitcher, SafetyDisclosure and SafetyDialog source/CSS/test packages; ordered CSS parity.
- [x] P3: typed HomePage, GunsPage and GunSetupPage; guarded runtime handoffs, draft/async ownership and both-edition visual verification.
- [x] P4: Settings typed source/runtime with stable file-picker/private-preview lifetimes.
- [x] P4: Learn typed source/runtime and shared SoundCard; limits, optional/calibration/reset/safety and both-theme parity.
- [x] P4: Live Listen presentation/handoff, repeated-recognition/unknown/verification/cleanup and both-edition verification.
- [x] P5: DrillsPage, reusable DrillCard/PracticeCatalog, retained draft boundary and shared numbered headings.
- [x] P5: CustomDrillEditor shared prerender/live fields with native form host, capability/save ownership and draft/reset/failed-commit protection.
- [x] P5 History foundation: native saved-session characterization and isolated typed SavedSessionList with exact DOM parity. History runtime handoff is verified below.
- [x] P5: History page/result/evaluation/session runtime handoff, native numeric/private filter lifetimes and both-theme parity.
- [x] P5: Optional private graph-content renderer, preserving Free/Full boundaries; [ownership notes](history-ownership-notes.md).
- [x] P6: shared PracticeRun/Review and SequenceRun/Review structural packages; native/typed DOM,1,333 full guide frames and both-theme browser pixel parity.
- [x] P6 prerequisite: actual Sequence controller regression suite before runtime migration (8 cases); Practice controller suite retained.
- [x] P6: shared repetition-result model reused by native detail factories and prepared typed RepetitionResult; frozen DOM and all guide frames unchanged.
- [x] P6: pure run/review view models reused by native adapters;38 frozen-renderer contracts, complete guide frames and real-controller regressions preserved.
- [x] P6: stateful shared run/review composition and guarded live Practice/Sequence inner handoffs; native/React controller equivalence, meter identity, draft/focus/disclosure and rollback/retry coverage.
- [x] P6: guide runtime uses the same live/example components;12 native/React scenarios, silent semantics, playback/return, atomic four-host rollback and offline loading verified.
- [x] P6: typed PracticePage/SequencePage/PracticeGuidePage source/CSS/test packages and prerender; complete frozen parent DOM and byte-identical compiled CSS verified.
- [x] P6: parent runtime handoffs preserve exact native Configure nodes, live child roots and guide figure; exclusive parent/context/manual ports, direct guarded actions, drafts/focus/rollback and both-edition checks verified.
- [x] P7: retire12 unused layout/chrome/page templates and unused run-fragment compilation; readiness tests use actual compiled UI and complete app HTML remains byte-identical.
- [x] P7: flatten25 import-only CSS wrappers into the single ordered entry, preserving leaf owners and exact expanded/minified CSS.
- [ ] P7: retire native startup fallbacks/adapters, finish remaining package boundaries and optimize against the original baseline.
- [ ] Final acceptance: resolve all original payload/timing failures; complete both-edition unit/integration/visual/offline checks.
- [ ] Owner release: checked b→main PR, owner-managed deployment and physical iPhone acceptance.

## Stages and exit gates

| Stage | Work | Required evidence |
| --- | --- | --- |
| P0 — Strengthen the baseline | Expanded runtime coverage/discovery, screen/component/test mapping, deterministic fixtures, audit triage, payload/startup/input/cleanup benchmarks. | New characterization passes against legacy behavior; canonical both-edition images/performance and enforceable gates. Completed runs: b 39024546616, dev 39024848087. |
| P1 — Define boundaries | Typed route/context/edition/service ports; preserve router/storage/audio engines. Prerender static practice choices. | Actual compiled-HTML integration, import/ownership checks and unchanged CSS/images. Completed runs: b 39054025991, dev 39054259871. |
| P2 — Shared shell | One header/main/footer/nav; shared components with CSS/tests; explicit one-time native→React ownership; gun/safety context and numeric/calibration sources. | All 13 states, BETA, active tabs, focus/drafts, locks, keyboard, safe area and 320/390/1024 layouts preserved. Canonical validation/images pass; known performance debt remains for P7. |
| P3 — Home and guns | HomePage, GunsPage, GunSetupPage, shared lazy entry and feature-owned form presentation using existing storage APIs. | First/add/edit/delete/final-delete, selected/nonselected ownership, stale reads, invalid drafts, type images, two/five-gun limits, old backup restore/export, offline loading and rollback/focus pass. Canonical validation/images pass for 9829212. |
| P4 — Settings, Learn, Live Listen | Transfer one page at a time; reuse existing service lifecycles and browser capability reporting. | Preference scopes/theme/system mode, reset scopes, unsupported Safari controls, file-picker/private-preview ownership, ten-sample limits, optional sounds, safety, delayed permission, repeated recognition and teardown preserved. |
| P5 — Drills and History | DrillsPage, HistoryPage and existing optional custom editor/graphs. | Built-ins, saved/custom create/edit guards, independent history/session clearing, filters/comparison, save/review navigation, Free text and Full graphs; same images. |
| P6 — Practice, Sequence, guides | Characterize controllers first; migrate pages and shared PracticeRun/Review and SequenceRun/Review. Live and synthetic examples use the same presentation; engines stay unchanged. | Microphone readiness, early/fast click, beep exclusion, fixed/random/zero delay, automatic Single repetitions, all modes/endpoints, pause/background/stop, durable retry and ownership; review all 12 GIF exports for scenario/pixel equivalence. |
| P7 — Cleanup and final acceptance | Remove dead templates, legacy DOM writers/CSS owners and adapters only after their final consumer migrates. Retire immediate native startup fallbacks using a measured loading strategy. Update architecture/tree/docs and finish optimization. | No duplicate owner, circular import, source leak, data/offline incompatibility or visual change; clean install and complete both-edition CI. Original-baseline payload/startup/input/cleanup performance passes. Hardware verification remains explicitly separate. |

Structural work continues under CHG-050 while known performance debt is recorded. Keep every performance limit and failure visible; do not lower thresholds, replace the original baseline or call a red run green. Behavior/image/data/security failures still block the affected slice.

## Completed P4 sequence (historical execution detail)

1. **Settings preference boundary — implemented.** Characterize the existing native presentation first, then extract a pure feature model reusable by native fallback and React. Preserve gun-owned audio preferences, device appearance/vibration, actual-track reports, Safari unsupported states and lock scopes.
2. **Settings source/runtime — implemented and locally verified.** Typed SettingsPage, CSS, callback and frozen DOM-parity tests now supply the build; runtime transfers on a later explicit unlocked entry while preserving native file/preview nodes. Protect backup/import, single-gun sound reset, complete-library deletion, system theme, file-picker lifetime and private Free/Full simulation. Never replace an active file input or detach the preview controller without an explicit handoff. Preview-control rebinding is now implemented and regression-tested: rendering onto replacement controls preserves simulation state, removes the stale listener and retains locks. The guarded runtime root and file-picker lifetime transfer are implemented and covered by unit and real-browser workflow tests; initial fallback retirement remains P7.
3. **Learn — implemented and locally verified.** Preserve required trigger/optional categories, recording/calibration limits, cancellation/late permission, per-sound reset, previews and details state.
4. **Live Listen — implemented and locally verified.** Preserve continuous detections, ignored unknowns, sensitivity/sequence state, safety, stop/background/pagehide and microphone cleanup. Reuse the existing audio/session engines.
5. Verify each slice, update source ownership/architecture/history and push to b. Then proceed to P5 without another approval request.

## Page migration and test ownership

| State | Target | Current state / next verification |
| --- | --- | --- |
| gunSetup | GunSetupPage | Typed page and handoff verified; invalid drafts/native validation, cancel/reset, restore and capacity protected; initial fallback remains P7. |
| home | HomePage | Typed page and handoff verified; current gun summaries, stale reads, readiness, focus and navigation protected; initial fallback remains P7. |
| guns | GunsPage | React library owner verified; edit/delete/selection locks, owned-data isolation and final-gun fallback protected. |
| settings | SettingsPage | Lazy runtime/root handoff implemented; stable file/preview islands, exclusive update port, preference/reset/backup behavior verified. Initial fallback remains P7. |
| learn | LearnPage | Typed lazy page/card/calibration runtime verified; disclosures/focus, late module arrival, per-type limits, optional/reset/safety and Dark/Light parity covered. Initial native fallback remains P7. |
| recognize | LiveListenPage | Typed lazy runtime and pure feedback models verified; values/focus/results/sequence/timeline preserved. Dedicated meter port, synthetic repeated/unknown detection, verification and Stop/navigation/background cleanup covered; initial fallback remains P7. |
| drills | DrillsPage | P5 page/editor handoffs verified; native startup cleanup remains P7. |
| history | HistoryPage | P5 results/session/evaluation and optional graph handoffs verified; native startup cleanup remains P7. |
| practice | PracticePage | Parent and shared Run/Review handoffs verified through native/React controller paths; exact Configure island retained; startup cleanup remains P7. |
| session | SequencePage | Parent and shared Run/Review handoffs verified, including save retry and native Configure island; startup cleanup remains P7. |
| practiceGuide | PracticeGuidePage | Parent/manual and shared example runtime handoffs verified; guide figure/clock retained; startup cleanup remains P7. Gun/source ownership, no capture/storage effects, exact setup return and all12 scenarios protected. |
| about | AboutPage | Already React; retain lazy/offline loading, copy/edition, Back/focus and no-capture/data tests. |
| contact | ContactPage | Already React; retain mailto, independent history, footer and no-capture/data tests. |

Use the existing component map as the ownership registry. Each page/component package has its own source, CSS, tests and public entry. Hooks/services have meaningful colocated tests and integration coverage. Do not add a store/router/component library or an abstraction solely for folder symmetry.

## Test execution and protection against regressions

Before a production slice, record its checked revision and DOM/event/draft/effect owners. Add characterization against existing behavior before moving implementation. Install from the lockfile when dependencies/setup change; avoid redundant reinstalls and full reruns without a relevant change. Preserve rollback commits.

Run applicable existing gates and affected tests, then complete canonical both-edition CI for the published slice:

```bash
npm run verify:profile
npm run typecheck
npm run lint:components
npm run verify:architecture
npm run docs:check
npm run test:smoke
npm run test:coverage
npm run coverage:check
npm run build
npm run verify:dist
npm run deploy:check
npm run visual:review
```

Build/verify public and Full preview separately; each build replaces dist. Run browser tests against the matching edition. The pinned rendering image owns canonical Chromium/WebKit comparison; local system Chromium is diagnostic only. Current scheduled inventory: **612 browser/edition executions** (300 public +312 preview, including conditional skips, from Playwright --list on 2026-10-21), including **390 image comparisons**. Preserve **83 current captures** and **12 guide exports**. A source fingerprint update alone is not visual review.

Required integration areas:

- Shared shell/navigation: all screens/themes, disabled first-gun tabs, locks, Back/Forward, focus, long content and sticky navigation.
- Drafts/lazy/offline: invalid/unsaved inputs survive routes; delayed/failed chunks retain working fallback; public offline reload includes lazy bundles; private cache retirement preserves data.
- Guns/data: old/new libraries, add/edit/delete/final gun, independent deletion, atomic restore/export, failure/retry and no refactor-driven deletion.
- Audio/safety: no capture before confirmation, delayed/denied permission, cancellation, Strict Mode, ready countdown, early/fast clicks, stop/pause/background cleanup.
- Sessions: every mode/sequence, fixed/random/zero delay, automatic targets, partial save/failure/retry and correct owning gun.
- Editions/security: direct-submit/revealed-control guards, public bundle omissions, Full/Free simulation, old-data preservation and signed private asset protection.
- Guides/media: shared live/example components, selected endpoints, controlled playback/pause, exact setup return and no microphone/storage side effects.

Tests must exercise actual composition/controller/service boundaries. Mock permissions, streams, clocks and deliberate storage failures; keep the engines and formatting under test real. Inspect mismatches rather than accepting new references or weakening assertions. Preserve expanded and optimized CSS order/computed appearance. Update requirements only for an explicitly approved product change; this refactor changes no design/functionality.

## Performance contract and optimization ledger

Final acceptance compares against the original released source, never a slower intermediate increment:

- Public baseline: `6c38bff81662d30279d94d41ca5c949bdbbe1c6e`.
- Full baseline: `a5b76e8d524c311bcbde1dc5740b2f5d0fa8e8bd`.
- Original initial JS gzip: public **50,807 bytes**, preview **51,146 bytes**. Original CSS **61,451 raw / 13,011 gzip bytes**.
- Latest published P3 initial JS: public **50,869 gzip (+62)**, preview **51,200 (+54)**. Gates remain failing and unchanged. P4 first-boundary measurements: public **51,092 gzip (+285 vs original)**, preview **51,412 (+266)**; CSS remains byte-identical. Settings runtime measurements: public **51,357 gzip (+550 vs original)**, preview **51,690 (+544)**; CSS still **61,451 raw / 13,011 gzip**. Learn runtime measurements: public **51,709 gzip (+902 vs original)**, preview **52,053 (+907)**. P4 Live Listen measurements: public **171,670 raw / 52,133 gzip** (+753 raw / +1326 gzip); preview **172,865 / 52,474** (+782 raw / +1328 gzip). P5 Drills composition measurements: public **172,841 raw / 52,448 gzip** (+1924 / +1641); preview **174,082 / 52,790** (+1999 / +1644). Custom-editor measurements: public **173,511 raw / 52,662 gzip** (+2594 / +1855); preview **174,752 / 53,007** (+2669 / +1861). History runtime: public **174375 raw /52969 gzip** (+3458/+2162), preview **175600 /53320** (+3517/+2174). Private graph transfer: public **174408/52975 raw/gzip** (+3491/+2168), preview **175703/53347** (+3620/+2201). P6 shared structural extraction leaves those critical JS/CSS bytes unchanged and reduces HTML by718 raw bytes in each edition (public54 gzip, preview50 gzip). Shared result model: public **174412/53057 raw/gzip** (+3495/+2250), preview **175707/53419** (+3624/+2273). Phase models: public **175719/53503 raw/gzip** (+4802/+2696), preview **177011/53864** (+4928/+2718). Live Run/Review handoff: public **176869/53952 raw/gzip** (+5952/+3145), preview **178164/54300** (+6081/+3154); CSS unchanged. Shared guide runtime: public **177388/54215 raw/gzip** (+6471/+3408), preview **178683/54568** (+6600/+3422). Typed parent sources leave critical JS raw bytes unchanged (gzip54217 public /54570 preview, +3410/+3424 vs original); initial HTML falls505 raw bytes per edition to55757/12459 public and56396/12628 preview raw/gzip. Parent runtime handoffs: public **178746/54619 raw/gzip** (+7829/+3812), preview **180041/54985** (+7958/+3839), CSS unchanged. These failures remain explicit optimization debt, not passing acceptance.
- Last completed public WebKit comparison before these size failures: warm startup **37→45 ms**, with the extra phase delay before interactive. No new passing timing result is inferred after a payload gate stops measurement.
- Keep JS/CSS minification, tree shaking, lazy loading and full chunk/source-leak verification. Include HTML and actual critical requests in evidence; a smaller JS entry alone is not a faster app.
- Diagnose the failed deliberate-slowdown proof in public run `39268272972`; its comparison summary confirms payload failures, but the probe-specific reason is not yet available. Keep it distinct from application validation/screenshot results.
- At P7 rerun repeated paired cold/warm/returning startup, input/navigation/recognition feedback and cleanup/memory checks. Identical-build controls do not override a candidate failure. Resolve all reproducible regressions before final release.

## Publication, rollback and approval

Continue on **b**. Dev stays frozen at `741f46e` under the owner's cost-saving pause; do not synchronize or validate dev until requested. Main is PR-only; no direct/force push, dev→main release or Cloudflare deployment. Owner-managed deployment and physical iPhone Safari/Home Screen acceptance remain separate from automated synthetic checks.

When dev synchronization resumes, preserve its Full configuration/simulation; shared accepted b changes merge into dev, never the reverse into production. Full-only work stays on dev. The owner later promotes checked b through a main PR.

If behavior, image, data or security verification fails, stop the affected slice and fix/revert only the responsible changes. Preserve history and user data. Performance debt is deferred under CHG-050, not erased. No further approval is needed for this unchanged approved scope; product design/functionality changes require their own explicit approval.

Native packaging, SEO implementation, accounts, billing, monetization and cloud storage remain outside this refactor. Their earlier requirements/plans are not silently included in P0–P7.

## P8 — Post-acceptance architecture review and handoff

Requested by the owner on 2026-10-20. Start only after P7 final acceptance; this task does not replace or weaken any functional, visual, data, edition or performance gate.

- [ ] Review the final page architecture against the approved specification and reusable-template boundaries; identify any remaining adapters or intentional native islands.
- [ ] Publish the final component structure/tree with pages, shared shell/templates, UI packages, feature services and their source/CSS/test/public-entry locations. Update the existing [component map](../../architecture/component-map.json) and [page-template documentation](../../architecture/page-templates.md), keeping one maintained ownership registry rather than a duplicate map.
- [ ] Explain the application entry points with exact file links: HTML/build entry, browser bootstrap, React root/mount boundaries, lazy page loading, shared layout and edition selection. Include a short startup-flow diagram and distinguish build-time rendering from browser runtime.
- [ ] Verify every screen maps to its final template/components and tests; document any remaining limitations explicitly. Run architecture and documentation checks against the accepted revision.

Deliver the reviewed final structure and entry-point explanation to the owner. Documentation only unless the review discovers a separately tracked defect; do not silently reopen product scope or change main/dev.

### P7 test-only renderer boundary — 2026-10-20

Completed the remaining test-only fragment adapter move into `@dryfire/testing/session-fragments`. Its only consumers are the template containment and frozen guide-frame tests; production uses typed parent composition. Removed the obsolete application source from current component/media registries, preserving historical evidence and every PNG/GIF/frame baseline.32 affected tests pass before/after; typecheck, component lint, architecture/docs,16 smoke checks and both minified editions pass. Critical JS/CSS hashes remain unchanged. This is source ownership cleanup, not a performance improvement or startup fallback retirement. The first-entry fallback still supplies behavior while lazy React modules prepare; removing it requires an equivalent guarded first-entry owner without remounting inputs or delaying readiness. P7 performance/acceptance debt and P8 remain pending.

### P7 deliberate-slowdown control repair — 2026-10-20

The probe's old error predicate rejects its own warm-phase diagnostic even alongside a confirmed warm slowdown; a failing characterization test reproduced this. A dedicated fail-closed policy now accepts that diagnostic only alongside its matching confirmed warm regression, requires an actual confirmed startup error/comparison and nonzero process exit, and rejects unrelated errors. Original timing statistics, bootstrap confidence, payload thresholds and application readiness predicate are unchanged.

A local Chromium control against identical Full-preview artifacts also showed the pre-network init stall could overlap loading: no startup regression was confirmed and the wrapper correctly failed. The controlled 250 ms CPU stall now runs at the usable-screen boundary before readiness is recorded/next paint, only for the deliberately slowed candidate. Ordinary measurements use zero delay and retain the same observer, long-task and frame-gap behavior.39 affected tooling tests pass, including the original statistical/readiness/artifact/report policies and the new fail-closed cases. Local browser confirmation and canonical CI are recorded separately; this repairs validation tooling, not application performance.

Local diagnostic confirmation: identical Full-preview artifacts, system Chromium, two requested pairs plus two confirmation pairs. Cold medians778.9→1070.4ms, warm699.8→951.5ms and returning787.4→1038ms all confirm the deliberate regression (4/4 slower pairs). The CLI now correctly exits successfully for this expected rejection, including its warm diagnostic. [Retained samples and source fingerprints](p7-probe-evidence.json). These are controlled probe timings, not candidate application acceptance; canonical pinned-image CI remains pending.

### Final unused/duplicate-code audit — owner clarification, 2026-10-20

Before declaring P7 complete, perform a final consumer-based audit across application bootstrap, page/template composition, shared UI, feature adapters/services, styles and build helpers. Remove unreferenced implementation and consolidate duplicate code with equivalent behavior/ownership. Record intentional retained boundaries (native inputs, first-entry fallback until replaced, independent test oracles and distinct Practice/Sequence timing policies) with their consumers; do not delete them solely because they look similar. Verify no application import reaches test support, and rerun relevant behavior/visual/data/edition checks plus original performance acceptance. P8 architecture handoff describes the resulting accepted structure. This clarification adds no product behavior or branch changes.

### P7 unused initializer/wrapper cleanup — 2026-10-20

Consumer audit removed the unused `createScenarios` application wrapper (active `createScenario` unchanged). The old numeric initializer had no production consumer after typed input prerendering; moved its exact implementation and original rules to a frozen parity fixture, removed the production function/declaration and kept all validation/parser behavior. The full-suite check exposed a computed-path test dependency missed by the earlier template cleanup: routeSelection now renders the real compiled shell instead of deleted raw fragments, with every original routing/class/ARIA assertion retained.

63 affected tests passed before cleanup;64 pass after the navigation-test repair. Type/lint/architecture/docs,16 smoke checks and both minified builds pass. Full compiled HTML and critical JS/CSS names/hashes remain identical; original guide frame/media references are unchanged. No runtime speedup claimed. [Consumer/output evidence](p7-dead-code-evidence.json). Full coverage/ratchet results are recorded separately after completion. Native fallback retirement, original performance gates and final duplicate-code audit remain open.

The first full run found the obsolete-template test consumer; after repair all917 tests passed. The unchanged coverage ratchet then exposed the unknown-field parser guard previously masked by covered initializer statements. Added its fail-closed boundary test; no coverage baseline was changed. Final coverage is rerun after this addition.

Additional audit evidence: TypeScript `--noUnusedLocals --noUnusedParameters` reports no findings, and an exact nonempty JS/TS/TSX/CSS file-content scan finds no duplicate files across src/apps/shared UI/tools. These narrow checks do not establish that all semantic duplication is removed. A diagnostic JavaScript unused-variable scan identifies import/helper/selection candidates in main/controllers/uiComponents for the next slice. Destructured session persistence omissions are intentional schema boundaries and must not be removed as dead variables. Removing the unused selected-drill startup read requires preserving asynchronous/error behavior and measuring timing, not merely deleting its variable.

Final cleanup verification: **918 tests /133 suites** and the unchanged full coverage ratchet pass. The cleanup is ready for b publication; no main/dev/deployment or acceptance-baseline changes.

### P7 unused runtime declarations and prevention — 2026-10-20

Removed unused audio/classifier/statistics imports, an unconsumed seconds formatter, a discarded catch binding, the unused drill-card index binding and write-only selectedTimedDrillId state. Saved-preset read/validation order, selectedDrill persistence writes and session-owned selection remain unchanged. The former profile-loading assertion inspected the discarded private variable; it now verifies the actual read/validation and adds independent rejection/order tests for failed reads and invalid presets. Persistence destructuring omissions remain deliberate schema boundaries.

Added `lint:runtime` to CI: no-unused-vars covers src/workers, with standard ignoreRestSiblings retaining deliberate omitted saved-record fields. An intentional unused-declaration probe fails as required. Component lint/type/architecture remain unchanged. Compiled HTML/CSS are unchanged; public JS178738/54609 raw/gzip is8/10 bytes below the preceding artifact, still7821/3802 above original acceptance. Cache v59 ensures the changed entry reaches installed public apps; private cache retirement is retained. Local browser/coverage evidence is recorded after completion; this cleanup does not complete P7 or performance acceptance.

Final runtime-cleanup verification: **920 tests /133 suites**, unchanged coverage ratchet,86 affected tests,16 smoke checks, type/component+runtime lint/architecture/docs, both minified builds and **13 public +12 preview Chromium workflows** pass. Complete compiled HTML/CSS and reviewed media remain unchanged. Preview JS180033/54987 raw/gzip is8 raw bytes smaller but2 gzip bytes larger than prior; original-baseline debt remains7950/3841 bytes. [Source/artifact/check evidence](p7-runtime-cleanup-evidence.json). Publication targets b only; no main/dev or deployment. Next: audit semantic duplication and retained first-entry owners, then resolve original payload/startup acceptance before P8.

### P7 duplicate module-preparation consolidation — 2026-10-20

Eight page adapter paths now use the same tested `createModulePreparation` cache instead of duplicate ready/pending variables and promise chains. It owns no DOM, navigation, capture or mount callbacks. Import completion only caches; a later explicit entry still performs the existing safety/lock/context/draft checks before handoff. Pending requests deduplicate; failures report and allow later retry. Home/profile and information/chrome loaders retain their distinct first-entry/disposal contracts rather than being forced into the helper. First-entry native fallbacks remain until separately replaced.

Verified923 tests /134 suites and the unchanged coverage ratchet; the helper has100% measured coverage. Cache v60 plus12 service-worker tests and16 smoke checks protect changed entry delivery. Type/component+runtime lint/architecture/docs pass.34 public Chromium workflows cover retained native fields, delayed handoffs, same-theme pixel equivalence, silent examples, microphone readiness/early clicks, owned data and offline. Full-preview completion is recorded separately. Compiled HTML/CSS and all screenshot/GIF baselines remain unchanged. Public JS178499/54491 raw/gzip (-239/-118 vs prior), preview179795/54854 (-238/-133). Original payload gate remains failing: public+7582/+3684, preview+7712/+3708. [Evidence](p7-module-preparation-evidence.json). No overall speedup or acceptance claimed.

Full-preview confirmation:33 system-Chromium workflows pass. Combined local browser coverage for this increment is34 public +33 preview; canonical pinned-image CI remains separate. No screenshot/GIF threshold or baseline updates.

### P7 shared native text-element primitive — 2026-10-20

Consolidated identical element creation in Practice/Sequence native presentation, guide rendering and private progress into src/textElement.js. It preserves literal textContent, explicit className (including empty class), call-time document acquisition and injected-document isolation. Deliberately different card-factory empty-class semantics and frozen test oracles remain independent. Export dependency fingerprints include the new helper; original guide-frame signatures, PNG/GIF bytes and compiled app HTML/CSS remain unchanged. Cache v61 covers changed optimized assets.

117 affected controller/guide/port/progress tests, type/component+runtime lint/architecture/docs,16 smoke checks and both minified builds pass.11 public browser workflows pass; full coverage and preview browser results are recorded on completion. Public JS178365/54458 raw/gzip (-134/-33 vs prior), preview179668/54822 (-127/-32), still above original budgets by7448/3651 and7585/3676. [Source/output evidence](p7-text-element-evidence.json). This is duplicate-code cleanup, not completion of P7 or startup/performance acceptance.

Final shared-primitive confirmation: **925 tests /135 suites**, unchanged coverage ratchet and primitive100% measured coverage pass; **11 public +13 preview** system-Chromium workflows pass, including both-theme progress/chart pixel and filter-identity checks. Main/dev and deployment remain untouched; b publication only.

### P7 deferred guide runtime and first-action work — 2026-10-21

Moved read-only guide-controller/manual/synthetic-example preparation out of application startup. Practice/Sequence setup prepares a module only; no controller or DOM owner is acquired until an explicit guide Open still owns the same route/type/gun after loading. Open reads fresh endpoints, and navigation or capture/modal locks cancel obsolete requests. Duplicate clicks share loading; failed downloads retain usable setup and give a clear reload message. Existing native/React guide content, silent examples and clock/draft behavior remain intact. Offline cache v62 includes all lazy assets. This defers startup ownership; it does not remove the first-entry native guide renderer.

Both original payload gates now pass without changing budgets: public165900/50409 raw/gzip vs170917/50807; preview167195/50783 vs172083/51146. CSS61451/13011 remains exact. Compiled HTML is unchanged; emitted hash-dependent HTML55757/12457 public and56396/12626 preview remain included in evidence. This resolves the previous byte-budget debt, not timing acceptance.

The first local paired timing comparison against a clean, separately installed/built original public worktree confirmed a first Settings-action regression (68.3→87ms median;4/4 slower pairs). That failure is retained. Optional Settings preparation now starts in a task after the native screen frame; native controls/listeners remain usable before any React handoff. A repeat unchanged-policy diagnostic is pending/result recorded separately. No measurement predicate, statistics, baseline or thresholds changed.

Verified942 tests /137 suites, unchanged coverage ratchet, type/component+runtime lint/architecture/docs,16 smoke checks, original public/preview payload gates and **24 public +24 preview local Chromium workflows**. New delayed/failed-download tests cover unchanged setup fields, fresh endpoints, stale navigation, retry after reload and zero microphone requests. Existing guide/playback/frame/pixel/offline tests remain green; no image/GIF references were regenerated. [Evidence and retained timing failure](p7-deferred-guide-evidence.json). Canonical pinned-image CI, remaining fallback retirement/final audit, hardware checks and P8 remain pending.

Final local confirmation:942-test full suite/137 suites and unchanged coverage ratchet pass; both new bridges have100% measured coverage.24 public +24 preview workflows pass. The repeated public runtime diagnostic passes unchanged policy on4 pairs: cold729.9→686.1ms, warm247.6→225.9, returning285.3→300.4, first action65.9→60.4, navigation72.5→73.6, click feedback122.8→130.6; no metric confirms regression. These small-sample results retain uncertainty and do not establish a general speedup or canonical acceptance. Earlier failed first-action trace is retained in the same evidence. All captured cleanup samples release capture. Candidate heap is higher (roughly3.37→4.59MB vs2.89→3.17MB), requiring steady-state memory inspection rather than an automatic leak/pass claim.

Also repaired CI's immutable baseline selection: the matrix preview job previously read the branch default and could choose public6c38bff instead of the intended original previewa5b76e8. Three new tests exercise the actual workflow command, reproduce the old failure and pass after effective-edition resolution.20 affected performance-tooling tests pass. Baseline revisions, budgets, readiness/statistical policy and thresholds are unchanged. Canonical both-edition CI remains pending after b push; main/dev and deployment remain untouched.

### P7 canonical performance follow-up — 2026-10-21

Canonical run39543701173 at539692c passed validation and both screenshot jobs but failed original performance acceptance. Public failures: WebKit warm37→44ms and Chromium navigation27.6→31.2ms. Preview failures: startup JS55502>55101 gzip, navigation21.8→25ms and returning674.7→682ms. These remain recorded failures; no baseline, predicate or threshold changed.

Optional Drills module preparation now follows the native first frame. Private chart implementation loads only on Full History entry, with saved text rendered independently. Late completion rechecks history generation/gun/route/entitlement; failure preserves saved text and reports recovery. New browser cases exercise startup request exclusion, delayed/failed downloads, navigation, filter identity, Free simulation and old-gun completion. Cache v63 covers changed assets.

Verified945 tests /138 suites, unchanged coverage ratchet, type/component+runtime lint/architecture/docs,16 smoke checks, both minified builds and original static payload limits;7 public +11 preview local Chromium workflows pass. Public JS165907/50417 raw/gzip; preview167480/50892; CSS61451/13011 unchanged. All390 screenshot references,83 captures and12 GIFs remain unchanged. Original-revision local4-pair Chromium diagnostic passes unchanged policy, but navigation median70.9→72.3ms and warm tail273.9→339.1ms retain uncertainty. This small local sample cannot supersede canonical failures, establish a speedup or resolve WebKit warm-start debt. [Retained failures and new evidence](p7-ci-performance-followup-evidence.json). P7 performance/fallback/memory audit and P8 remain unfinished. Publication targets b only; main/dev/deployment unchanged.
