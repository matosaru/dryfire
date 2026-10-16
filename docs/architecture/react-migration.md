# Incremental React architecture — CHG-047

The owner started the [refactor plan](../project/react-refactor-plan.md). This is an incremental migration, not a completed React rewrite. [component-map.json](component-map.json) records all 13 screen owners and their existing behavior-test entry points. Browser screen/state coverage remains in [screen-map.json](screen-map.json) and the pinned visual catalog. Neither map claims complete branch coverage.

## Current ownership

| Boundary | Owner and contract |
| --- | --- |
| Shared shell, BETA header, contextual gun/safety UI, footer, bottom navigation | Existing `src/templates/layout.html` and `shared/` fragments. One copy for all 13 screens. Not yet React-owned. |
| History, active screen, capture/unsaved guards | Existing `src/screenNavigation.js` and `src/main.js`; section wrappers stay mounted. No new router or URLs. |
| About/Contact interiors | `apps/web/src/pages/AboutPage/` and `ContactPage/`; each has component, CSS, public export and behavior tests. The same React components produce build-time content and interactive browser roots. Old duplicate page HTML is removed. |
| Shared heading/card | `packages/ui/src/PageHeading/` and `InformationCard/`; explicit props, accessible names and keyboard/escaping tests; no app, microphone or storage imports. |
| Lazy bridge | `apps/web/src/app/informationBridge.ts`; About/Contact load React once when visited. Static Back remains usable before loading or after a failed download. The bridge retries on a later visit, keeps the prerendered Free/Full copy current before the runtime arrives, forwards that same snapshot into React and cancels abandoned mounts. The shared copy helper prevents duplicate brand/feature strings. |
| React lifecycle | `informationPages.tsx` owns exactly two interiors under Strict Mode. Idempotent disposal unmounts both. Keyboard Back focus survives the first lazy mount. React Back controls are excluded from legacy direct binding, preventing double navigation. No audio acquisition, persistence or effects on mount. |
| Other 11 screens | Existing trusted page fragments/controllers, with their stable IDs, invalid form drafts and persisted ownership. Migrate in later slices; do not mix native DOM writes into a React-owned interior. |
| Timing/audio/storage | Existing tested JavaScript services and pure engines. IndexedDB schema 3 and backup format 4 are unchanged. No React hook acquires microphone resources in this increment. |

## Styles and build

`src/styles.css` is now an ordered composition entry. Shared heading/card and About/Contact rules live beside their components; remaining global rules stay in three explicitly temporary `apps/web/src/styles/legacy-*.css` files. Concatenating those imports reproduces the previous stylesheet byte for byte, including theme/media overrides and selector order. The production CSS remains `index-DnLrZEQ0.css` (61.45 KB, 13.08 KB gzip); no baseline pixels are reaccepted for a refactor.

Vite remains the compiler/minifier. Root commands load TSX for the build-time page compiler through `tsx`; Vite's existing TSX transform uses the automatic JSX runtime. Workspaces use one lockfile; no package is published. Tests retain Jest and add DOM/Testing Library/user-event only for typed component tests. TypeScript, React Hooks lint rules and the package ownership check run in CI. Build fingerprints include typed workspace sources and every extracted CSS file. Public artifact verification still excludes Full controls/graphs/overrides and source maps.

Measured public JavaScript before this increment was 169.74 KB (50.68 KB gzip). The initial bundle is approximately 170.91 KB (51.19 KB gzip); React/informational content is a separate approximately 223 KB (69.7 KB gzip) chunk. Total offline/download storage increases by that lazy chunk; this is migration cost, not a performance improvement. Public offline precaching uses edition asset metadata, including lazy chunks. Private preview still retires offline caches. These are emitted byte sizes, not measured Safari startup timings.

## Existing native controls and events

The six flagged template owners—Drills, History, Practice, Live Listen, Sequence and Settings—retain native select interaction, including all selects in each template. These choices preserve the approved browser controls and their existing labels; they are not six individual select elements. The four forms retain native validation plus the existing numeric/domain validation; changing this ownership is separate product work. Existing centrally attached button handlers are covered by browser workflows; a static scan cannot infer those actions. The earlier generic strict audit is not reported as passing.

Before each further migration, inventory that screen's IDs, selectors, events, drafts and effects. The source/test map supplies an entry point, not permission to skip regression tests. The next slice moves shared AppShell/header/footer/navigation to typed components while keeping a single event owner, then gun/settings/Learn/History; Practice/Sequence/Guide follow last using one real/example renderer.

## Maintenance

Add a component as `Name/{Name.tsx,Name.css,Name.test.tsx,index.ts}`. Keep test behavior meaningful: accessible names, keyboard actions, pending/disabled/errors, ownership and cleanup where relevant. Add new typed behavior tests to the root Jest discovery rather than a second test runner. Update the component map when a screen owner changes; `npm run verify:architecture` rejects incomplete component folders, duplicate/missing screen owners, missing mapped tests and shared UI importing app/platform services.

Use `npm run typecheck`, `npm run lint:components`, `npm run verify:architecture`, existing unit/smoke tests, both-edition builds/artifact checks and pinned Chromium/WebKit references. Do not update PNG baselines to accommodate a refactor. Current help GIFs are exported from actual guide UI and carry the full CSS dependency fingerprints, so splitting style files does not bypass staleness detection.

[Page templates](page-templates.md) · [Site tree](site-tree.md) · [Implementation history](../project/implementation-history.md).

First-increment visual/media evidence: [review record](../design/baselines/react-refactor-review.json). All browser PNGs remain unchanged; regenerated GIF geometry/timing is unchanged, with sparse reviewed color-quantization differences in five exports.
