# Contact design

CHG-033: show the existing fixed five-item bottom navigation, with normal safe-area/content padding in Dark and Light. Contact is not a main tab; preserve its footer current-page marker, Back/Forward and capture/setup guards.

CHG-031: About/Contact footer controls are pure white in Dark (`#FFFFFF`); Light/disclosure colors and the existing layout/underline/focus/divider remain. [ABOUT-05](../../../requirements/about.md) and the [shared footer design](../shared/README.md) define the correction. [Current capture review](../../baselines/bright-footer-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-030 typography revision: primary Dark text uses `#FFFFFF` throughout this screen and neutral controls. Secondary/footer/accent colors and Light values remain. The [shared typography design](../shared/README.md) and [SET-07](../../../requirements/settings.md) define the palette; [current capture/build review](../../baselines/white-primary-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-029 · 2026-10-12 · Separate history-backed Contact screen of `/`, not a public server route. Entry: centered **Contact** control in the shared app footer; available before gun setup and independently of Settings.

Compact Contact heading with Back and the existing Settings shortcut. A readable “Get in touch” card contains the existing feedback invitation, selectable **easydryfire@gmail.com** mailto link and explanation that it opens the user's email app. About's purpose/routine/storage/safety copy belongs on its separate screen.

Gun switching and the inline safety disclosure are hidden. The shared five-item bottom navigation is visible with normal content/safe-area padding. No microphone permission or data change occurs. Both centered footer links remain visible, with the current page indicated accessibly. Links use #FFFFFF in Dark and inherit the footer text color in Light, keep their 0.85rem font/underline/focus outline and have no arrows. A divider separates them from the disclosure/copyright text.

Specifications: [Contact](../../../requirements/contact.md) · [About](../../../requirements/about.md) · [core](../../../requirements/core.md) · [persistence](../../../requirements/persistence.md) · [shared footer](../shared/README.md).

## Current visual references

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| Contact, Dark | [overview.dark.png](overview.dark.png) | `contactView` |
| Contact, Light | [overview.light.png](overview.light.png) | `contactView` |

Capture validation and publication are recorded in the [delivery tracker](../../../project/implementation-history.md). Current references are reviewed production-build images in the pinned Chromium renderer, with passing Chromium/WebKit comparisons at 320/390px. [Review evidence](../../baselines/separate-pages-validation.json) and [build manifest](../../baselines/separate-pages-build-manifest.json) record provenance; no generated concept is substituted for the implemented screen.
