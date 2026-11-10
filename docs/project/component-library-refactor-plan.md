# Component-library and CSS-ownership refactor plan

Status: approved for implementation on `b` (2026-11-09). CL0–CL3 are accepted. The first CL4 `InformationCard` CSS-owner slice is accepted locally on both editions: owner import, single CSS emission, canonical pixels, functional behavior and the pinned cross-browser performance matrix pass. Continue CL4 with other repeated primitives in bounded slices. Visual design, behavior, routes, storage formats and performance limits remain unchanged. See the detailed [component-library specification](component-library-refactor-spec.md).

## Goal

Turn the existing `@dryfire/ui` package into a clearly layered internal component library that is easy to reuse without relying on a global component stylesheet.

## Current progress

| Phase | Status | Evidence / next action |
| --- | --- | --- |
| CL0 Baseline | Complete | Inventory and canonical visual/performance references recorded. |
| CL1 Architecture | Complete | Approved component and CSS ownership specification. |
| CL2 Safety net | Complete | 182 Jest suites / 1,189 tests; public 105 and preview 82 Chromium tests pass (5 and 3 intentional skips); visual coverage records one canonical mobile Chromium capture per page type. |
| CL3 Proof slice | Complete | `ProgressContent` imports its owned CSS; lazy Settings fallback keeps exact handoff pixels. Both editions pass optimized builds, artifact verification, actual startup-payload checks, and ten-pair Chromium/WebKit comparisons. |
| CL4 Migration | In progress; first slice accepted | `InformationCard` imports its owned CSS; Vite resolves that owner import through the startup-style manifest, preserving one physical CSS emission for pre-rendered About/Contact and lazy React routes. Both editions, exact About/Contact captures, preview route behavior and all four pinned timing comparisons pass. Migrate the next real repeated primitive in a separate slice. |
| CL5–CL11 | Not started | Continue shared product, feature/page, startup cleanup, review, acceptance and delivery after bounded migration slices pass. |

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
| CL11 Delivery | Push `b`, observe CI, promote only through the accepted release workflow | Live deployment remains separately observed |

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

## Latest acceptance evidence (2026-11-10)

- Unit/runtime: 182 suites, 1,189 tests; TypeScript, component/runtime lint, coverage ratchet, docs, architecture and visual-coverage checks pass.
- Visual: Public Chromium 105 passed / 5 skipped; private preview Chromium 82 passed / 3 skipped. The two delayed Settings handoff captures also pass after the final lazy-load scheduling change.
- Payload: CL4 public 50,042 gzip JS / 12,587 gzip CSS; preview 50,414 gzip JS / 12,587 gzip CSS. Both are below their immutable artifacts (50,246 and 50,638 gzip JS respectively); no duplicate `InformationCard` CSS chunk is emitted.
- Timing: ten paired samples per metric for both editions in Chromium and WebKit. All four comparisons pass without a confirmed slowdown. Full JSON reports are generated under ignored `performance-results/` and can be reproduced using [performance guidance](../development/PERFORMANCE.md).
- The first CL4 `InformationCard` slice is accepted; the rest of CL4 and CL5–CL11 remain. The overall component-library migration is not complete.
- Visual: the complete prior Chromium suites passed 105 public / 82 preview tests (5 / 3 intentional skips); after the CL4 change, public canonical About/Contact pixels and the five preview About/Contact functional routes passed. `visual:review` retains 26 canonical mobile page cases.
