# Reusable app templates

Every screen uses [layout.html](layout.html) and [view.html](view.html). Shared chrome is authored once in `shared/`: header, footer, fixed navigation, contextual gun/safety information and safety modal. Legacy screen content belongs in `pages/`. CHG-047 moves About/Contact content into typed page packages in `apps/web/src/pages/`; the compiler renders those same components at build time, so no duplicate HTML templates remain.

[Page definitions](../pageDefinitions.js) supply stable view/title IDs and are reused by navigation. [The compiler](../../tools/page-templates.mjs) assembles trusted repository templates into the `{{app}}` mount in index.html before Vite edition filtering/bundling. Both Free and Full use the same shell and page components. Raw fragments are not copied into dist, and user data continues through existing textContent/form APIs.

Edit a shared fragment to change every screen. Edit one page fragment for its own controls; keep its IDs. New screens need a page definition, page content, navigation/context behavior, requirements, design states and screen-map entry. See [architecture](../../docs/architecture/page-templates.md).

Practice/Sequence run/review fragments also mount inside the guide with `example-` ID prefixes. Keep the same component/CSS for live and example rendering; `src/sessionPresentation.js` is their shared read-only view layer. Update [current GIFs](../../docs/design/screens/practice-guide/examples/README.md) and reviewed captures together after a relevant design change.
