# Component-library and CSS-ownership refactor plan

Status: implementation is complete at version 0.8.9; the exact versioned candidate still needs post-bump CI and push to `b`. CL0–CL9 are complete. CL10 local acceptance passed at 0.8.8 and is being repeated after the required one-time version bump. CL11 is pending branch CI. This refactor is one feature/versioning unit. Promotion to `main` requires the user's explicit approval. Product behavior, routes, storage formats and performance limits remain unchanged. See the detailed [component-library specification](component-library-refactor-spec.md).

## Goal

Turn the existing `@dryfire/ui` package into a clearly layered internal component library that is easy to reuse without relying on a global component stylesheet.

## Current progress

| Phase | Status | Evidence / next action |
| --- | --- | --- |
| CL0 Baseline | Complete | Inventory and canonical visual/performance references recorded. |
| CL1 Architecture | Complete | Approved component and CSS ownership specification. |
| CL2 Safety net | Complete | 182 Jest suites / 1,192 tests; public 105 and preview 82 Chromium tests pass (5 and 3 intentional skips); visual coverage records one canonical mobile Chromium capture per page type. |
| CL3 Proof slice | Complete | `ProgressContent` imports its owned CSS; lazy Settings fallback keeps exact handoff pixels. Both editions pass optimized builds, artifact verification, actual startup-payload checks, and ten-pair Chromium/WebKit comparisons. |
| CL4 Shared UI migration | Complete | All 30 shared UI package owners are accounted for. Direct imports and multi-file ownership are verified in the generated component map. |
| CL5 Shared product migration | Complete | Component stylesheet delivery is explicitly classified as `aggregate`, `lazy`, `external` or `none`; no duplicate component stylesheet is emitted. |
| CL6 Feature/page migration | Complete | All 14 page compositions, five feature components, and both public-site owners directly declare their CSS dependencies. |
| CL7 Startup styles | Complete | Kept the single ordered blocking CSS output as a compatibility entry for native first-paint templates. Components own/import their CSS in source; the resolver routes shared initial styles through that entry without duplicate rules or style flashes. |
| CL8 Cleanup | Complete | Audited all 51 component/page packages. 45 styles are in the ordered startup entry, two are lazy, two have separate/template delivery, and two CSS files are comment-only with no active selectors. Build checks reject duplicate lazy/public stylesheet output. |
| CL9 Review | Complete | Reviewed package isolation, CSS routes, cascade preservation, Vite/SSR loading, theme delivery, and generated ownership metadata. No behavior or design changes found. |
| CL10 Acceptance | Local candidate passed | 182 Jest suites / 1,195 tests, smoke, SEO, typecheck, lint, coverage, architecture/docs, pinned public/preview visuals, both optimized builds and all four pinned performance comparisons passed at 0.8.8. Post-bump exact checks are running. |
| CL11 Delivery | In progress | Version incremented once to 0.8.9. Push the exact candidate to `b`, wait for its GitHub checks, then stop before `main` promotion for the user's explicit approval. |

## Non-negotiable CSS contract

1. Every component owns and directly imports its own stylesheet.
2. Every page owns and directly imports only its page-composition stylesheet.
3. Component selectors are scoped below a stable component root. Components cannot depend on an unrelated page/global selector or import order.
4. Theme differences use semantic tokens first. A necessary component-specific theme selector stays in that component's CSS.
5. Global CSS is limited to reset/document defaults, semantic tokens and explicitly documented startup compatibility.
6. Native startup adapters that render before React consume the same component-owned style sources through a declared critical-style entry. They do not gain a second copy of component rules.
7. Stable native/React handoff selectors, approved pixels and critical-path loading remain unchanged.

## Target layers

```text
packages/ui/src/
  tokens.css
  primitives/        # behavior-light reusable controls
  shell/             # shared application chrome
  product/           # gun, safety, drill, session and history components

apps/web/src/features/
  <feature>/components/  # feature-local components

apps/web/src/pages/
  <Page>/                # composition, local CSS and tests
```

Physical directory moves are optional. Package exports and dependency rules define the layers; avoid a large rename-only change.

## Plan for the owner

| Phase | Visible outcome | Approval/review point |
| --- | --- | --- |
| CL0 Baseline | Inventory of current components, consumers, styles, screenshots, payload and timing | Confirm scope and unchanged-design rule |
| CL1 Architecture | Final primitive/shared/feature/page boundaries and CSS-loading design | Complete: accepted specification recorded; final visual system remains unchanged |
| CL2 Safety net | Missing component, theme, focus and handoff tests added without UI changes | Review coverage evidence |
| CL3 Proof slice | One low-risk lazy component imports its own CSS; Node renderers and public CSS selection are handled | Compare exact pixels and performance evidence |
| CL4–CL6 Migration | Primitives, shared components, then feature/pages migrate in small batches | Review after each batch; no bulk rewrite |
| CL7 Startup styles | Initial shell uses component-owned critical styles without flash or delay | Review startup/performance evidence |
| CL8 Cleanup | Aggregate imports, duplicate selectors and proven-unused compatibility code removed | Inspect final ownership/cleanup map |
| CL9–CL10 Review/acceptance | Independent review and complete exact-candidate test gate | Decide whether `b` is ready to publish |
| CL11 Delivery | Bump version once after full feature acceptance; push the release candidate to `b`, observe exact CI, then await explicit user approval before PR merge to `main` | Live deployment remains separately observed |

## Plan for agents

| Phase | Work and deliverable | Agent/model | Acceptance before next phase |
| --- | --- | --- | --- |
| CL0 Baseline | Freeze component/CSS dependency inventory, current DOM/pixels, coverage, payload and browser timing | Validation: `gpt-6-luna`, medium | Exact baseline and duplicate/consumer map recorded |
| CL1 Architecture spec | Define dependency rules, CSS contract and startup-style strategy | Planning: `gpt-6.1-sol`, high | No unresolved critical-style ownership |
| CL2 Characterization | Add missing behavior/focus/theme tests around selected components | Testing: Luna, medium | Tests detect a deliberate contract defect and pass unchanged app |
| CL3 CSS loading proof | Direct CSS import on one low-risk lazy component; measure chunking/offline/pixels/startup | Implementation: `gpt-6.1-terra`, high | No duplicate/missing CSS, FOUC, payload or timing regression |
| CL4 Primitive extraction | Extract only multiply-used Button/IconButton/Field/Card/Dialog/Status primitives; retain native Input/Select behavior | Implementation: Luna, medium for bounded slices; Sol/Terra for focus changes | Real consumers and component tests; no speculative primitive |
| CL5 Shared product migration | Move shell, context, catalog, session and history styles to direct owner imports in small groups | Implementation: Luna medium; Terra for shell/session ownership | DOM, pixels, drafts and lazy handoff preserved |
| CL6 Feature/page migration | Directly import composition CSS; promote a feature component only with a second consumer | Implementation: Luna, medium | No cross-page selector dependency |
| CL7 Startup compatibility | Replace aggregate component rules with the component-owned critical-style entry | Debug/coding: Terra or Sol, high | Immediate shell styled; original performance gates pass |
| CL8 Cleanup | Remove orphan/duplicate selectors, aggregate component imports and proven-unused adapters | Implementation: Luna mechanical; Sol high for ownership decisions | Static audit and full coverage pass |
| CL9 Independent review | Review layering, accessibility, theme coverage, isolation, bundle boundaries and tests | Review: `gpt-6-astra`, high | Findings fixed or explicitly accepted |
| CL10 Candidate acceptance | Run complete public/preview, visual, payload and pinned performance gates | Release: Luna, medium | Green exact `b` candidate and clean diff |
| CL11 Delivery/live check | Push `b`, observe CI, promote only when authorized and verify live assets separately | Release/deploy: Luna, low/medium | CI/deployment evidence recorded |
| Continuous SEO Analyst | Review every planned/implemented change for crawlability, URLs/canonicals, metadata, structured data, links, redirects, sitemap/robots and discovery/performance impacts; require focused tests for changed SEO contracts | SEO review: Luna routine screening; Astra/high for domain, indexing-policy or legal-claim changes | `npm run test:seo` and full CI pass; findings are fixed or explicitly recorded. GitHub CI runs deterministic tests; the coordinator assigns the AI review because Actions has no model service configured. |

## Slice order

1. Low-risk leaf components with no native startup rendering.
2. Feature-local components and page composition.
3. Shared product cards, lists and forms.
4. Session and History components with retained-node handoff.
5. Header, shell, navigation, safety and initial-screen components last.

## Required tests for every slice

- Component semantics, callbacks, disabled/loading/error and keyboard/focus behavior.
- Dark, Light and System token behavior where relevant.
- Native startup to React handoff parity when both render the contract.
- One retained mobile Chromium canonical image per affected page type.
- Semantic Chromium/WebKit integration for behavior and navigation.
- Public/preview optimized build and offline asset completeness.
- Critical payload and unchanged browser performance gates for critical-path slices.

## Auto-fix and escalation

Classify a failure before fixing it. Apply one minimal fix, run focused proof, then rerun the complete affected gate. After two failed attempts, or immediately for nondeterministic browser, startup, focus, storage or audio ownership failures, escalate from Luna to Sol/Terra high. Never increase visual tolerance, accept an unreviewed baseline, change a performance ceiling or duplicate CSS to make a check pass.

## Completion criteria

- Every shipping React component/page owns and imports its stylesheet.
- Global CSS contains only documented reset, tokens and startup compatibility.
- Theme variants are token-driven or locally owned.
- The architecture map identifies layer, CSS owner, tests and consumers.
- No duplicate component implementation or unused selector remains.
- Public/preview functionality, saved data, minification, offline behavior, canonical visuals and original performance limits pass on the exact `b` candidate.

## Latest accepted candidate evidence (2026-11-11, 0.8.8 baseline; one-time bump to 0.8.9 pending exact CI)

- Unit/runtime: 182 suites, 1,195 tests; TypeScript, component/runtime lint, coverage ratchet, docs, architecture and visual-coverage checks pass.
- Visual: complete public Chromium/WebKit suite: 175 passed / 38 intentionally skipped; complete preview suite: 157 passed / 6 intentionally skipped. Both Settings handoff captures pass after the appearance-control rerender fix.
- Payload: public 50,089 gzip JS / 12,587 gzip CSS; preview 50,465 gzip JS / 12,587 gzip CSS. Both remain below unchanged ceilings. `verify-dist` checks one lazy History stylesheet and one separate public SEO stylesheet.
- Performance: local pinned comparisons against immutable version 0.8.0 passed all six measured metrics in public/preview Chromium and WebKit; no confirmed slowdown. Reports are in ignored `performance-results/refactor-*.json` files.
- The first CL4 `InformationCard` slice is accepted; the rest of CL4 and CL5–CL11 remain. The overall component-library migration is not complete.
- Visual: `visual:review` retains 26 canonical mobile page cases. About captures and source fingerprints are refreshed for 0.8.8.

### PageHeading, PreferenceToggle and GunContext CSS-ownership candidate (0.8.4; local checks complete, branch CI pending)

- Each component imports its colocated CSS. The startup owner map resolves those imports to the existing aggregate source, preserving one emitted copy. `TriggerProfileStatus` remains excluded: its stylesheet is not in the aggregate and the component is unused; importing it would introduce styles that do not currently render.
- App version advanced to 0.8.4. About references, the canonical mobile About baseline, source fingerprints and pinned practice-guide example GIFs/manifests were refreshed from the current implementation.
- Local checks after a clean locked install: 182 Jest suites / 1,192 tests, typecheck, component/runtime lint, coverage, architecture, docs, visual-coverage, 23 SEO checks and 16 smoke checks pass. Public and preview optimized builds, distribution verification and gzip payload budgets pass. Public and preview Chromium suites pass 105 / 82 tests (5 / 3 intentional skips); WebKit passes 70 / 75 (33 / 3 intentional skips).
- Local pinned preview-Chromium performance comparison (10 requested pairs, expanded to 20 after an initial signal) against the immutable 0.8.0 build passes all six metrics with no confirmed slowdown. Payload: public 50,101 gzip JS / 12,587 gzip CSS; preview 50,472 / 12,587.
- Earlier CI run [43061631804](https://github.com/matosaru/dryfire/actions/runs/43061631804) reran unchanged 0.8.3 source and reported a small preview-Chromium returning signal. On the 0.8.4 commit, the current pinned local timing comparison passes and all four exact CI performance jobs pass, without changing thresholds or baseline.
- Exact CI run [43070872069](https://github.com/matosaru/dryfire/actions/runs/43070872069) passed validation, public screenshots and all four performance jobs. Its preview screenshot suite had one Settings light-theme handoff mismatch because it compared encoded PNG bytes. Local investigation proved before/after decoded pixels were identical; 20 repeated runs pass with the corrected pixel-based assertion. Follow-up exact CI is required before accepting 0.8.4.

### RecognitionList CSS-ownership increment (0.8.3 accepted)

- `RecognitionList.tsx` now imports its colocated `RecognitionList.css`; the startup owner map routes it to the existing critical stylesheet, with artifact verification and style-ownership tests guarding against a duplicate CSS copy.
- Updated the version-derived About dark/light references, canonical dark About baseline and pinned guide-example source manifest. The guide GIFs were regenerated with the pinned Playwright renderer; the 10 scenario frame counts and intended flows remain intact.
- Local checks pass: 1,192 tests across 182 suites; typecheck; component/runtime lint; coverage ratchet; 16 smoke checks; 23 SEO checks; architecture and docs checks; public build/artifact/payload; and public Chromium/WebKit (175 pass, 38 intentional skips) plus preview Chromium/WebKit (157 pass, 6 intentional skips).
- The short public WebKit diagnostic signaled a possible warm-start slowdown, but the full fixed-sample exact-commit comparisons passed in all four edition/browser combinations. Full run [43059356827](https://github.com/matosaru/dryfire/actions/runs/43059356827) is green across validation, public/preview screenshots and performance; `main` remains unchanged.

### DrillCard increment (local candidate; branch CI pending)

- Added `import './DrillCard.css'` to the component and registered the startup owner so the critical aggregate remains the sole emitted CSS source. Artifact verification now rejects missing or duplicated `.about-card` / `.preset-card` rules.
- Reconciled inventory from 50 to 51 total packages (30 shared UI, 5 feature, 14 pages, 2 public-site packages).
- 1,192 Jest tests / 182 suites, coverage ratchet, typecheck, both lints, smoke, architecture, docs, public and preview builds/artifact verification, and both payload budgets pass locally.
- Pinned Chromium Drills catalog/handoff tests pass (4/4); canonical public Drills screenshot is exact. Both light/dark Settings handoffs and the canonical Settings screenshot pass after fixing a pre-existing asynchronous preference read race. Preview canonical screenshots are intentionally shared with public.
- The full browser suites and all four pinned timing comparisons pass on the final candidate, including the Settings preference-race fix. The focused SEO test step and every job in GitHub run [42910052051](https://github.com/matosaru/dryfire/actions/runs/42910052051) pass. Commit [`de51780`](https://github.com/matosaru/dryfire/commit/de51780c6ea2332b6cf51ac381ff0de08ad71ee3) is pushed to `b`; Production on `main` remains unchanged until an approved promotion.
- Final artifact budgets after the Settings fix: public 50,097 gzip JS / 12,587 gzip CSS; preview 50,462 gzip JS / 12,587 gzip CSS. Both remain below their unchanged ceilings.

### Settings synchronization and feature CSS ownership accepted (0.8.8)

Continued CL4 with direct CSS ownership for CustomDrillEditor, DrillSetup, SequenceRun, SequenceReview and CalibrationCatalog. Fixed the Appearance selector rerender at asynchronous preference handoff and covered selected value plus exact pixels in Chromium/WebKit. Exact `b` run [43092852578](https://github.com/matosaru/dryfire/actions/runs/43092852578) passed validation, both screenshot editions and all four performance jobs. The component-library refactor remains in progress; no `main` promotion has occurred.

### Final CSS ownership candidate at 0.8.8 (local acceptance passed)

The final ownership pass supports multiple direct stylesheet imports per component and records every fragment in the generated component map. PracticeRun and RepetitionResult own their additional existing files; the ordered CSS cascade and browser output remain unchanged. Every active component stylesheet has a verified delivery path.

### Page, feature and external CSS ownership candidate (0.8.8; locally accepted)

Fourteen page components now directly import their page composition styles; five feature components and both public-site owners also declare their actual stylesheet. The generated component map records CSS imports and delivery (`aggregate`, `lazy`, `external` or `none`). `PublicPage.css` remains emitted as its separate SEO-page asset, `TriggerProfileStatus.css` remains inlined into the trusted native Learn template, two comment-only files are explicitly style-free, and HistoryDeleteControl/ProgressContent remain lazy CSS. Build/dev/preview scripts use Vite's native config loader with the existing Node CSS hook so server-side renderers can load component graphs without bundling CSS into Vite's config. The existing ordered app stylesheet remains the one source for aggregate styles. No selectors, DOM or interactions changed.

Local pinned visuals pass (public 175 passed / 38 intentional skips; preview 157 passed / 6 intentional skips). Builds, artifact checks, size budgets and all four pinned performance comparisons pass. The one-time feature version bump is now 0.8.9; rerun tests and visuals against that exact build before pushing it to `b`. `main` remains unchanged.
