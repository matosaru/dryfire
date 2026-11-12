# Component-library and CSS ownership specification

Status: approved for staged implementation on `b` (2026-11-09). This specification covers component boundaries and style ownership only. Product behavior, DOM contracts, visual design, storage schemas, app navigation and performance budgets remain governed by their existing requirements.

## Current baseline

- `@dryfire/ui` is a private source workspace with explicit subpath exports; component folders contain source, CSS, tests and an entry file.
- `docs/architecture/component-map.json` indexes 51 page/component packages: 30 shared UI components, 5 feature components, 14 pages and 2 public-site components.
- `src/styles.css` imports design tokens, page/component CSS and ordered `legacy-before-*` / `legacy-after-*` compatibility styles. Active aggregate CSS owners directly import their stylesheet; two shared components also own a second CSS fragment. The component map records direct imports and one of `aggregate`, `lazy`, `external` or `none` CSS delivery. The current migration verifies page/feature owners and preserves the ordered aggregate as the sole application CSS source. Exact source ownership and import paths are indexed in [`component-map.json`](../architecture/component-map.json).
- Native HTML templates render all screen containers before React ownership, so first paint and early navigation need the current blocking stylesheet and its cascade order.
- Several CSS files have real ownership exceptions: `ProgressContent` styles load with the private lazy chart; `HistoryDeleteControl` styles load with the lazy presentation chunk; `NumberInput.css` includes a parent selector; `PracticeCatalog.css` and `RetainedNode.css` are comment-only; `TriggerProfileStatus.css` is read into the trusted native template; `PublicPage.css` is emitted separately for public SEO pages; some legacy-named files still contain active unrelated selectors.
- Node `--import tsx` build renderers import the same React component graph as the browser. Component-owned CSS is handled by the registered Node CSS hook and Vite's `--configLoader native`; Vite's config bundler must not bundle CSS imports from its prerender graph.
- `tools/public-pages.mjs` currently assumes it can identify one startup application stylesheet. It must select the stylesheet linked from the generated app HTML if lazy CSS assets are introduced.

The detailed per-package paths and current source/test ownership remain generated in [`component-map.json`](../architecture/component-map.json). The baseline agent’s inspected owners include `src/styles.css`, `tools/page-templates.mjs`, `tools/public-pages.mjs`, `src/optional/progressView.js`, `tools/style-sources.mjs`, `tools/verify-dist.mjs`, `packages/ui/src/NumberInput/NumberInput.css`, and feature CSS under `apps/web/src/features`.

## Required dependency layers

Keep the current flat component directories and `@dryfire/ui/ComponentName` exports initially. Define layers in metadata and enforce imports before considering directory moves.

| Layer | Owners | Allowed dependencies |
| --- | --- | --- |
| Foundation | semantic tokens, reset and document defaults | no component or application dependency |
| UI infrastructure | retained DOM ownership and shared presentation types | React and neutral utilities only |
| Primitives | shared low-level fields, buttons, cards, dialogs, status and current primitive candidates | foundation and lower-level infrastructure/primitives |
| Shell | app shell, brand header, main navigation, page heading and footer | primitives and infrastructure only |
| Product presentation | gun/safety, catalogs/setup, practice/sequence run/review, history/progress | primitives/infrastructure and declared acyclic product dependencies |
| Feature presentation | Settings and learned-sound feature components | lower shared layers and the owning feature; no cross-feature presentation imports |
| Pages/public presentation | app page and public-page composition | shared UI and relevant feature components; no page-to-page imports |
| Application adapters | `apps/web/src/app` and legacy controllers | presentation owners plus service/controller adapters |

Shared UI must not import `apps`, runtime controllers, IndexedDB, microphone capture or build-edition authority. Add only behavior-light primitives that have real repeated consumers. Preserve native Input/Select behavior.

## CSS ownership contract

1. A component imports its own physical stylesheet from its canonical package entry. Component source CSS may import fragments owned by that same component.
2. A page imports page-composition CSS; it does not collect CSS for child components.
3. Child components own their internal selectors. Parents own layout through existing roots and slots. Do not add wrappers, IDs or classes only to make CSS scoping convenient.
4. CSS selectors are rooted at a stable owner class where the existing DOM permits it. Preserve released IDs/classes used by adapters and browser tests.
5. Move parent-dependent selectors into the parent owner. For example, `NumberInput.css` cannot own `.settings-row:has(.numeric-hint)`; that rule belongs to its row/page composition.
6. Themes derive from `packages/ui/src/tokens.css` where the semantic mapping is exact. A component-specific dark/light override stays in that component stylesheet. Retain `src/main.js` as the single Dark/Light/System resolver.
7. Global CSS owns only reset, document defaults, shared semantic tokens and a named startup-compatibility manifest. The manifest may include component-owned physical files needed to style native prerendered markup before React; it must not duplicate declarations or become a second source of style rules.
8. Keep the existing blocking stylesheet discovery and cascade order. No async CSS, preload reordering, critical inline CSS or browser-specific branches without a separate accepted performance investigation.
9. Preserve `ProgressContent`'s private `progressView`-only CSS ownership and `verify-dist` guarantees until its separate lazy-artifact proof passes.
10. A component with no visual rules uses an explicit empty/none ownership entry; do not invent CSS merely to satisfy a file pattern.

## Build and loading design

- The canonical owner stylesheet is imported with the component package entry and remains available to Vite’s CSS graph. The generated map and architecture verifier assert each active import's delivery path.
- CL3 proved that source-entry imports plus the startup compatibility manifest emit each physical aggregate stylesheet once, preserve the original blocking app stylesheet, and do not create a late style flash for native HTML screens.
- Node SSR/build helpers use the CSS module hook installed before Vite/config imports with `--configLoader native`; it returns an empty module in Node renderers while Vite continues to process real browser CSS. Keep `page-templates.mjs`, public page prerendering, docs generation and Jest in the acceptance gates.
- `tools/public-pages.mjs` must select the app stylesheet from the generated HTML link, not the first arbitrary CSS asset, before code splitting can create multiple stylesheets.
- Preserve the public standalone CSS and route metadata. Public pages remain fully styled without hydration.
- Do not change `cssCodeSplit`, app style order, preload behavior, service-worker cache completeness or the exclusive Full preview asset boundary without measurements and corresponding tests.

## Component/style migration records

Before each slice, add or update ownership metadata: layer, consumers, stylesheet, CSS fragments, theme owner, native-template exposure, lazy/eager loading, owner-entry import and SSR handling. Architecture verification rejects an unrecorded component, forbidden layer import, missing stylesheet owner, duplicate physical style source or owner/test path drift.

Existing exceptions to resolve explicitly during migration:

- `ProgressContent`: private lazy CSS inline owner; keep isolated.
- `NumberInput`: move the parent `.settings-row` relationship to the composition owner.
- `PracticeCatalog`: classify its comment-only stylesheet; either remove the empty file through a reviewed package-contract exception or give catalog-only rules to its real owner.
- `TriggerProfileStatus`: native template reads CSS as a string; document the shared physical source and prevent a second emitted copy.
- `SettingsAction`: currently depends on global `.button` and `.danger` variants plus a duplicate rule in a legacy aggregate; retain shared button primitive semantics and move only component-owned details.
- `LiveResultPanel`: selectors overlap global classes such as `.score`, `.bar` and `.distance-label`; scope or explicitly document shared semantic ownership without changing the native/React handoff.
- Files named `legacy-*` contain active rules from multiple owners. Migrate rules by selector ownership and rendered evidence, never by filename.

## Required evidence per migration

- Component tests for semantics, callbacks, disabled/error states and keyboard/focus behavior.
- Theme verification for Dark, Light and System where visible.
- Native-to-React identity, focus, draft and visual handoff tests wherever the static owner exists.
- One reviewed 390 px Chromium image per affected functional page type; retain semantic WebKit checks and cross-size layout tests.
- Both edition builds, artifact/source-map exclusion, public-page styling, offline cache completeness and preview privacy checks.
- Assert each CSS declaration is loaded once, no formerly global selector disappears from a native screen, and CSS import order remains stable.
- Run the unchanged payload and pinned performance comparisons for any critical-path, loading, shell or shared component slice.

## Completion

Every shipping component and page has an explicit stylesheet owner and theme policy. Global rules are restricted to the documented foundations and native startup manifest. The dependency graph and generated component map are current. No duplicate/orphan selectors remain. Public and preview behavior, existing data, accessibility, minification, offline operation, reviewed pixels and original performance limits pass on the same accepted `b` candidate.
