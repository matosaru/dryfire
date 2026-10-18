# Reusable page architecture

CHG-037 · 2026-10-12. All existing SPA screens at `/` use one shared template architecture; there is no separate wrapper copied into each page.

```text
index.html — metadata, Vite entry and one {{app}} mount
  packages/ui/src/AppShell — typed common shell (build adapter)
    BrandHeader — branding, BETA status and Settings
    SafetyDialog — native modal overlay
    main.page-content
      SafetyDisclosure + messages + GunSwitcher — native context
      view.html × pageDefinitions.js — stable accessible section wrapper
        pages/<screen-id>.html — 11 legacy screen interiors
        apps/web/src/pages/{AboutPage,ContactPage} — 2 React interiors
    InfoFooter — About/Contact, disclosure, copyright, private indicator
    BottomNavigation — one fixed five-tab navigation
```

[Templates](../../src/templates/README.md) are assembled by [page-templates.mjs](../../tools/page-templates.mjs) in Vite’s pre-transform phase. Edition filtering then removes private fragments from public output; bundling/minification work as before. Docs/smoke checks inspect the same assembled HTML as the app. Template and compiler content is included in the source digest; registry fingerprints cover all visible templates. Dev changes to HTML fragments trigger full reload. Raw source templates are not published.

[Page definitions](../../src/pageDefinitions.js) are the common view/title-ID list for build-time wrappers and runtime navigation. Screen-specific titles, controls and histories retain their stable IDs. All pages share banner/main/contentinfo/navigation landmarks and the same safe-area/footer spacing; first-gun readiness disables unavailable practice tabs.

To add a page, add its definition/content, route/context behavior and requirements/design/registry states; never duplicate the app header/footer/nav or bypass the shared wrapper. Maintain [screen-map.json](screen-map.json), regenerate the [tree](site-tree.md) and run docs/source/both-edition browser checks. Scroll/viewport tests cover every page at 320/390/1024 px in both themes and both browser engines. Screenshot acceptance remains manual engineering review; ordinary CI does not update images.

[Layout requirements](../requirements/page-layout.md) · [Shared design](../design/screens/shared/README.md) · [Delivery history](../project/implementation-history.md).

CHG-041 adds the beta lifecycle disclosure once in the shared header, independent of build edition, plus the About feedback card. No new screen, public route or storage state is introduced. The existing screen tree remains authoritative.

CHG-045 extracts Practice/Sequence run/review content into four shared fragments. The compiler mounts the exact same fragments in help with namespaced IDs/ARIA references; `sessionPresentation.js` renders both live state and simulated snapshots. Their shared CSS has no alternate animation skin. Tests assert fragment identity and unique IDs. See [guide requirements](../requirements/practice-guides.md#chg-045-visual-parity-and-exports).

CHG-047 begins the [incremental React migration](react-migration.md). About/Contact have colocated CSS/tests and render through the same React components at build time and in lazy browser roots; legacy Back bindings exclude their React buttons. The existing shell remains the sole header/footer/navigation owner. The [component map](component-map.json) tracks all current screen owners.


CHG-049 P2 compiles the shared typed AppShell through `renderAppShell.tsx`; trusted safety/context/page slots retain the mounted native nodes. React's automatic header-logo hint is omitted to preserve the released request graph. Numeric inputs/hints and calibration cards are also prerendered from their tested packages. Their static DOM replaces startup construction; existing native validation, counters and service callbacks remain. The information chunk can transfer only the three chrome interiors after locks clear, with rollback/focus restoration on failed commit. See [ownership](react-migration.md) and [unchanged-input review](../design/baselines/shared-shell-refactor-review.json).

CHG-049 P2 context preparation replaces the two remaining shared context/dialog compiler inputs with GunSwitcher, SafetyDisclosure and SafetyDialog packages. Each owns colocated CSS and tests; the build adapter renders them without adding client React or extra image hints. `main.js` still owns selected-gun state and `safetyGate.js` alone owns native showModal/close, focus and pending-action confirmation. No second event owner is mounted. Frozen DOM fixtures, complete ordered CSS hash and actual compiled-template gate integration cover this boundary. The former context/modal fragments are retained solely as legacy evidence until P7.

### P3 My Guns owner

`apps/web/src/pages/GunsPage/` owns both prerendered and live library markup. `app/gunsPage.tsx` mounts one lazy React root in `#gunsView`, updates locks synchronously and restores native nodes/focus if its first commit fails. Main retains the guarded data workflow and ignores stale library reads, including a chunk that finishes after a newer render request. After mounting, main no longer writes library card or Add-button properties; callbacks route to the existing guarded actions. Home and the gun-details form retain their existing owners during the next P3 steps.
