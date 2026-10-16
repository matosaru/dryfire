# Shared page layout

Revision 1.2 · CHG-037 / CHG-041 / CHG-044 · directly requested 2026-10-12. Applies to all existing functional app screens, including Settings, About, Contact, the contextual Practice guide and Settings installation/help content. It creates no new public route.

| ID | Requirement |
| --- | --- |
| LAYOUT-01 | Use one shared branded header with the DF / WITH EASE wordmark, visible BETA badge (BRAND-07) and Settings control on every screen. Keep it in the same position; do not move the gear into individual page headings. Screen-specific titles/back controls remain content headings. |
| LAYOUT-02 | Shared architecture is header → main content → footer links/disclosure/copyright → fixed bottom navigation. Expose separate banner, main, contentinfo and navigation landmarks. Keep one main content region and one copy of each shared control. |
| LAYOUT-03 | Every screen, including gun setup/library and informational views, shows the same five fixed bottom tabs. Preserve active/aria-current state and history/context guards. Until a valid gun exists, or while a profile change loads, unavailable practice destinations are disabled; Settings/About/Contact and recovery remain available. |
| LAYOUT-04 | Reserve bottom space for navigation and the device safe area on every page. At the end of scrolling, content, footer links, copyright and last controls remain visible above navigation. Support short/long pages, 320/390 px phones, wider screens and theme changes without horizontal overflow. |
| LAYOUT-05 | Keep centered About/Contact controls, divider, existing accessible touch/focus styling, white Dark primary/link colors, Light colors and copyright/data disclosure. Short pages keep the shared footer toward the bottom of the viewport, above navigation. |
| LAYOUT-06 | Preserve all saved data, safety acknowledgement, capture interruption, unsaved-result guards, six practice modes and public/full edition restrictions. Update architecture/design evidence together and exercise scrolling/landmarks/header/navigation in both browser renderers and editions. |
| LAYOUT-07 | All screens use common reusable templates: one app layout, shared header/footer/navigation/context/modal fragments and one screen wrapper. Keep each screen’s content in its own template; compile trusted source templates before Vite edition filtering/bundling. Centralize stable page definitions and preserve IDs for existing logic, history and accessibility. Do not ship source template files or introduce runtime HTML injection. |

[Shared layout/design](../design/screens/shared/README.md) · [Screen tree](../architecture/site-tree.md) · [Delivery status](../project/implementation-history.md). The safety dialog remains an accessible modal overlay rather than a separate page shell.
