# Contact design

CHG-029 · 2026-10-12 · Separate history-backed Contact screen of `/`, not a public server route. Entry: centered **Contact** control in the shared app footer; available before gun setup and independently of Settings.

Compact Contact heading with Back and the existing Settings shortcut. A readable “Get in touch” card contains the existing feedback invitation, selectable **easydryfire@gmail.com** mailto link and explanation that it opens the user's email app. About's purpose/routine/storage/safety copy belongs on its separate screen.

Gun switching, practice navigation and safety disclosure are hidden on this informational screen. No microphone permission or data change occurs. Both centered footer links remain visible, with the current page indicated accessibly. Links inherit the theme's footer text color, keep their 0.85rem font/underline/focus outline and have no arrows. A divider separates them from the disclosure/copyright text.

Specifications: [Contact](../../../requirements/contact.md) · [About](../../../requirements/about.md) · [shared footer](../shared/README.md).

## Current visual references

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| Contact, Dark | [overview.dark.png](overview.dark.png) | `contactView` |
| Contact, Light | [overview.light.png](overview.light.png) | `contactView` |

Capture validation and publication are recorded in the [delivery tracker](../../../project/implementation-history.md). Current references must be reviewed production-build images in the pinned Chromium renderer, with separate Chromium/WebKit comparisons at 320/390px; no generated concept is substituted for the implemented screen.
