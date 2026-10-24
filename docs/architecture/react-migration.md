# Incremental React architecture — CHG-047

> Final status (2026-10-22): refactor accepted under CHG-051 with retained progressive startup adapters. The [application structure guide](application-structure.md) and [completed plan](../project/react-refactor/plan.md) describe current ownership; migration milestones below are historical.

CHG-048 prepares the remaining migration in [spec.md](../project/react-refactor/spec.md) and [plan.md](../project/react-refactor/plan.md). CHG-049 approves those documents and autonomous staged implementation. The linked article is now read, and expanded coverage/performance preparation must precede the next production-code slice.

The owner started the [refactor plan](../project/react-refactor-plan.md). This is an incremental migration, not a completed React rewrite. [component-map.json](component-map.json) records all 13 screen owners and their existing behavior-test entry points. Browser screen/state coverage remains in [screen-map.json](screen-map.json) and the pinned visual catalog. Neither map claims complete branch coverage.

## Current ownership

| Boundary | Owner and contract |
| --- | --- |
| Shared shell, BETA header, footer, bottom navigation | AppShell/BrandHeader/InfoFooter/BottomNavigation packages render the build-time shell. chromeBridge owns immediately usable native chrome until chromePages safely takes its three interiors. Context/safety and all section drafts retain their existing owners. |
| History, active screen, capture/unsaved guards | Existing `src/screenNavigation.js` owns serialized history/capture/save guards; typed `apps/web/src/app/routeContext.ts` validates current route ownership through explicit gun/controller ports; `src/main.js` creates route snapshots. Section wrappers stay mounted. No new router or URLs. |
| About/Contact interiors | `apps/web/src/pages/AboutPage/` and `ContactPage/`; each has component, CSS, public export and behavior tests. The same React components produce build-time content and interactive browser roots. Old duplicate page HTML is removed. |
| Shared heading/card | `packages/ui/src/PageHeading/` and `InformationCard/`; explicit props, accessible names and keyboard/escaping tests; no app, microphone or storage imports. |
| Lazy bridge | `apps/web/src/app/informationBridge.ts`; About/Contact load React once when visited. Static Back remains usable before loading or after a failed download. The bridge retries on a later visit, keeps the prerendered Free/Full copy current before the runtime arrives, forwards that same snapshot into React and cancels abandoned mounts. The shared copy helper prevents duplicate brand/feature strings. |
| React lifecycle | `informationPages.tsx` owns About/Contact interiors under Strict Mode; `chromePages.tsx` owns three isolated chrome interiors after the safe handoff. Idempotent disposal unmounts both. Keyboard Back focus survives the first lazy mount. React Back controls are excluded from legacy direct binding, preventing double navigation. No audio acquisition, persistence or effects on mount. |
| Other 11 screens | Existing trusted page fragments/controllers, with their stable IDs, invalid form drafts and persisted ownership. Migrate in later slices; do not mix native DOM writes into a React-owned interior. |
| Timing/audio/storage | Existing tested JavaScript services and pure engines. IndexedDB schema 3 and backup format 4 are unchanged. No React hook acquires microphone resources in this increment. |

## Styles and build

`src/styles.css` is now an ordered composition entry. Shared heading/card and About/Contact rules live beside their components; remaining global/theme rules stay in ordered explicitly temporary `apps/web/src/styles/legacy-*.css` files. Concatenating those imports reproduces the previous stylesheet byte for byte, including theme/media overrides and selector order. The production CSS remains `index-DnLrZEQ0.css` (61.45 KB, 13.08 KB gzip); no baseline pixels are reaccepted for a refactor.

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

## CHG-049 P0/P1

P0 is green in both branch profiles, including pinned both-edition screenshots and paired browser performance. P1 extracts route validation only, not the router or audio/session engines. Eight pre-move characterization cases cover every ordinary route, no/incomplete gun, stale profile/setup/guide context and both controller owners. The source-wrapper integration test retains the released route-creation seam; the actual resolver is imported from the typed module. Chrome selection is characterized separately against the existing shared fragments before P2 transfers its writer. Build-only heading metadata is derived from the same frozen route IDs and tree-shaken out of the browser. Narrow `.d.ts` ports describe existing JavaScript APIs without introducing a domain-to-app dependency. No page rendering, URL, ID, storage schema, capture or GIF input changes. P1 canonical image/performance checks are pending until its own commit runs; P0 green is not substituted as P1 evidence.

### Static practice catalog performance correction

P1’s canonical public run flags WebKit returning startup (71 ms original / 74 ms candidate, 16 of 20 pairs slower); preserve the gate and address it before advancing. Move the six static cards to `packages/ui/src/PracticeCatalog/` and a build-only adapter, generated from the existing `PRACTICE_MODES`. The existing controller retains one delegated listener, asynchronous configuration/capture guards and disabled state. It no longer constructs/replaces six hidden cards during every startup. A frozen fixture captured from the released controller and DOM-parity tests protect every element/attribute/text, and pre-move controller cases verify every choice, pending-capture rejection and idempotent refresh. Shared CSS stays at its existing ordered owners; the component declares no competing rules. This pulls one static presentation subcomponent forward from P5 to fix a measured gate; the Drills page/editor and six-mode controller remain legacy-owned. React remains absent from initial requests.

Guide/run/review DOM and CSS are measured byte-identical, and pure presentation/example/engine sources are unchanged. Existing GIF files are retained with unchanged hashes; the coarse build-script source fingerprint is revalidated against this input-equivalence proof. This is not a new guide design or a claim that GIFs were re-encoded. Pinned live/help/reference comparisons and performance must still pass for the new commit.


CHG-049 P2 removes no existing page or data owner. Static NumberInput and CalibrationCatalog packages are pulled forward solely for prerender parity/startup work removal. CSS foundation rules move beside each component; ordered temporary global/theme chunks preserve all overrides. The old shell HTML fragments are no longer read by the production compiler; they remain temporarily as characterized legacy evidence until P7 cleanup. The current initial-byte measurements and pending canonical gates are in [implementation history](../project/implementation-history.md).


CHG-049 P2 context extraction: GunSwitcher, SafetyDisclosure and SafetyDialog now provide typed build-time source and ordered component CSS. Native main/safetyGate code remains the single runtime writer; these are not client-hydrated components yet. Compiled-template integration tests cover focus, acknowledgment, exactly-once continuation, cancellation/Escape, owner changes and asynchronous rejection. Component tests cover explicit callbacks/disabled states and safe gun-name rendering. The complete compiled shell is semantically identical to frozen released context/modal fixtures; expanded and optimized CSS remain byte-identical. Eleven page interiors and the gun/form service migration remain outstanding.

P3 first runtime page: My Guns is now a lazy React page with typed row/callback props and colocated CSS/tests. The build uses the same component for initial markup. Profile storage, per-gun ownership, confirmations and async stale-read tokens stay with the existing controller. React owns every card/action and library lock after mount; main only retains the prerendered fallback before mount. Home and GunSetup remain native until their next characterized slices. Timing optimization is deferred by CHG-050; final original-baseline acceptance is unchanged.

P3 Home/GunSetup now have separate typed page/CSS/test packages and build adapters. The lazy profile entry shares React with My Guns. Home snapshots current native values before takeover; main then publishes typed result/readiness/context updates without writing its owned DOM. GunSetup owns native name draft plus React type state; same-key saving/notice updates preserve invalid form nodes, while an explicit Add/Edit resets the root key. Initial native fallback remains for immediate first use and will be reviewed in P7. No template, capture or stored-data algorithm changes. Known interim payload/timing debt remains subject to unchanged final original-baseline gates.
