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
| P6 — Practice, Sequence and guides | Active: live Practice/Sequence run/review handoffs verified; guide runtime and typed parent sources verified; parent runtime handoffs pending |
| P7 — Cleanup, optimization and final acceptance | Not started |

Latest P6 live run/review increment passes **884 tests /128 suites**, coverage/type/lint/architecture/docs/smoke, both-edition Chromium workflows, both minified artifacts and original CSS/media/frame equivalence checks. Shared structural packages, controller safety net and pure result/run/review models are verified. Stateful component composition and live Practice/Sequence Run/Review handoffs are verified. Shared read-only guide runtime is verified too; parent source/prerender packages are verified; parent runtime/configuration handoffs remain P6. Canonical P5 `d4d5aa9` validation and both screenshot editions pass; original performance budgets and public deliberate-slowdown proof remain failing. Native startup cleanup and final performance acceptance remain P7.

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
- [ ] P6: complete parent runtime/configuration handoffs, preserving exact numeric forms, live child roots and guide/manual behavior.
- [ ] P7: retire superseded templates/native fallbacks/adapters, finish package boundaries and optimize against the original baseline.
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

## P4 next steps

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
| practice | PracticePage | Shared Run/Review runtime verified through native/React controller paths; typed parent source/prerender verified; parent runtime/configuration handoff remains P6. |
| session | SequencePage | Shared Run/Review runtime verified, including save retry; typed parent source/prerender verified; parent runtime/configuration handoff remains P6. |
| practiceGuide | PracticeGuidePage | Shared example runtime verified; typed parent source/prerender verified; parent/manual runtime handoff remains P6. Gun/source ownership, no capture/storage effects, exact setup return and all12 scenarios protected. |
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

Build/verify public and Full preview separately; each build replaces dist. Run browser tests against the matching edition. The pinned rendering image owns canonical Chromium/WebKit comparison; local system Chromium is diagnostic only. Current target: **520 browser/edition executions**, including **390 image comparisons**. Preserve **83 current captures** and **12 guide exports**. A source fingerprint update alone is not visual review.

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
- Latest published P3 initial JS: public **50,869 gzip (+62)**, preview **51,200 (+54)**. Gates remain failing and unchanged. P4 first-boundary measurements: public **51,092 gzip (+285 vs original)**, preview **51,412 (+266)**; CSS remains byte-identical. Settings runtime measurements: public **51,357 gzip (+550 vs original)**, preview **51,690 (+544)**; CSS still **61,451 raw / 13,011 gzip**. Learn runtime measurements: public **51,709 gzip (+902 vs original)**, preview **52,053 (+907)**. P4 Live Listen measurements: public **171,670 raw / 52,133 gzip** (+753 raw / +1326 gzip); preview **172,865 / 52,474** (+782 raw / +1328 gzip). P5 Drills composition measurements: public **172,841 raw / 52,448 gzip** (+1924 / +1641); preview **174,082 / 52,790** (+1999 / +1644). Custom-editor measurements: public **173,511 raw / 52,662 gzip** (+2594 / +1855); preview **174,752 / 53,007** (+2669 / +1861). History runtime: public **174375 raw /52969 gzip** (+3458/+2162), preview **175600 /53320** (+3517/+2174). Private graph transfer: public **174408/52975 raw/gzip** (+3491/+2168), preview **175703/53347** (+3620/+2201). P6 shared structural extraction leaves those critical JS/CSS bytes unchanged and reduces HTML by718 raw bytes in each edition (public54 gzip, preview50 gzip). Shared result model: public **174412/53057 raw/gzip** (+3495/+2250), preview **175707/53419** (+3624/+2273). Phase models: public **175719/53503 raw/gzip** (+4802/+2696), preview **177011/53864** (+4928/+2718). Live Run/Review handoff: public **176869/53952 raw/gzip** (+5952/+3145), preview **178164/54300** (+6081/+3154); CSS unchanged. Shared guide runtime: public **177388/54215 raw/gzip** (+6471/+3408), preview **178683/54568** (+6600/+3422). Typed parent sources leave critical JS raw bytes unchanged (gzip54217 public /54570 preview, +3410/+3424 vs original); initial HTML falls505 raw bytes per edition to55757/12459 public and56396/12628 preview raw/gzip. These failures remain explicit optimization debt, not passing acceptance.
- Last completed public WebKit comparison before these size failures: warm startup **37→45 ms**, with the extra phase delay before interactive. No new passing timing result is inferred after a payload gate stops measurement.
- Keep JS/CSS minification, tree shaking, lazy loading and full chunk/source-leak verification. Include HTML and actual critical requests in evidence; a smaller JS entry alone is not a faster app.
- Diagnose the failed deliberate-slowdown proof in public run `39268272972`; its comparison summary confirms payload failures, but the probe-specific reason is not yet available. Keep it distinct from application validation/screenshot results.
- At P7 rerun repeated paired cold/warm/returning startup, input/navigation/recognition feedback and cleanup/memory checks. Identical-build controls do not override a candidate failure. Resolve all reproducible regressions before final release.

## Publication, rollback and approval

Continue on **b**. Dev stays frozen at `741f46e` under the owner's cost-saving pause; do not synchronize or validate dev until requested. Main is PR-only; no direct/force push, dev→main release or Cloudflare deployment. Owner-managed deployment and physical iPhone Safari/Home Screen acceptance remain separate from automated synthetic checks.

When dev synchronization resumes, preserve its Full configuration/simulation; shared accepted b changes merge into dev, never the reverse into production. Full-only work stays on dev. The owner later promotes checked b through a main PR.

If behavior, image, data or security verification fails, stop the affected slice and fix/revert only the responsible changes. Preserve history and user data. Performance debt is deferred under CHG-050, not erased. No further approval is needed for this unchanged approved scope; product design/functionality changes require their own explicit approval.

Native packaging, SEO implementation, accounts, billing, monetization and cloud storage remain outside this refactor. Their earlier requirements/plans are not silently included in P0–P7.
