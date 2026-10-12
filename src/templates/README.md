# Reusable app templates

Every screen uses [layout.html](layout.html) and [view.html](view.html). Shared chrome is authored once in `shared/`: header, footer, fixed navigation, contextual gun/safety information and safety modal. Only screen content belongs in `pages/`.

[Page definitions](../pageDefinitions.js) supply stable view/title IDs and are reused by navigation. [The compiler](../../tools/page-templates.mjs) assembles trusted repository templates into the `{{app}}` mount in index.html before Vite edition filtering/bundling. Both Free and Full use the same templates. Raw fragments are not copied into dist, and user data continues through existing textContent/form APIs.

Edit a shared fragment to change every screen. Edit one page fragment for its own controls; keep its IDs. New screens need a page definition, page content, navigation/context behavior, requirements, design states and screen-map entry. See [architecture](../../docs/architecture/page-templates.md).
