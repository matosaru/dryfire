# Reusable page architecture

CHG-037 · 2026-10-12. All existing SPA screens at `/` use one shared template architecture; there is no separate wrapper copied into each page.

```text
index.html — metadata, Vite entry and one {{app}} mount
  src/templates/layout.html — common app shell
    shared/header.html — branding, BETA status and Settings
    shared/safety-modal.html — modal overlay
    main.page-content
      shared/context.html — contextual messages/safety/gun selector
      view.html × pageDefinitions.js — stable accessible section wrapper
        pages/<screen-id>.html — screen-specific content
    shared/footer.html — About/Contact, disclosure, copyright, private indicator
    shared/navigation.html — one fixed five-tab navigation
```

[Templates](../../src/templates/README.md) are assembled by [page-templates.mjs](../../tools/page-templates.mjs) in Vite’s pre-transform phase. Edition filtering then removes private fragments from public output; bundling/minification work as before. Docs/smoke checks inspect the same assembled HTML as the app. Template and compiler content is included in the source digest; registry fingerprints cover all visible templates. Dev changes to HTML fragments trigger full reload. Raw source templates are not published.

[Page definitions](../../src/pageDefinitions.js) are the common view/title-ID list for build-time wrappers and runtime navigation. Screen-specific titles, controls and histories retain their stable IDs. All pages share banner/main/contentinfo/navigation landmarks and the same safe-area/footer spacing; first-gun readiness disables unavailable practice tabs.

To add a page, add its definition/content, route/context behavior and requirements/design/registry states; never duplicate the app header/footer/nav or bypass the shared wrapper. Maintain [screen-map.json](screen-map.json), regenerate the [tree](site-tree.md) and run docs/source/both-edition browser checks. Scroll/viewport tests cover every page at 320/390/1024 px in both themes and both browser engines. Screenshot acceptance remains manual engineering review; ordinary CI does not update images.

[Layout requirements](../requirements/page-layout.md) · [Shared design](../design/screens/shared/README.md) · [Delivery history](../project/implementation-history.md).

CHG-041 adds the beta lifecycle disclosure once in the shared header, independent of build edition, plus the About feedback card. No new screen, public route or storage state is introduced. The existing screen tree remains authoritative.

CHG-045 extracts Practice/Sequence run/review content into four shared fragments. The compiler mounts the exact same fragments in help with namespaced IDs/ARIA references; `sessionPresentation.js` renders both live state and simulated snapshots. Their shared CSS has no alternate animation skin. Tests assert fragment identity and unique IDs. See [guide requirements](../requirements/practice-guides.md#chg-045-visual-parity-and-exports).
