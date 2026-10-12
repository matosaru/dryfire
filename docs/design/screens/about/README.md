# About design

CHG-031: About/Contact footer controls are pure white in Dark (`#FFFFFF`); Light/disclosure colors and the existing layout/underline/focus/divider remain. [ABOUT-05](../../../requirements/about.md) and the [shared footer design](../shared/README.md) define the correction. Capture review and publication are recorded in the [delivery tracker](../../../project/implementation-history.md).

CHG-030 typography revision: primary Dark text uses `#FFFFFF` throughout this screen and neutral controls. Secondary/footer/accent colors and Light values remain. The [shared typography design](../shared/README.md) and [SET-07](../../../requirements/settings.md) define the palette; [current capture/build review](../../baselines/white-primary-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-029 revises the footer and separates Contact from About. Current captures are reviewed against the production build; [evidence](../../baselines/separate-pages-validation.json) records both passing 138-check runs. Earlier [CHG-028 evidence](../../baselines/footer-entry-validation.json) retains the superseded combined entry.

CHG-027 · Initial copy/layout proposal implemented for review on `feature/about-contact-page`; direct page/contact request authorizes this slice. Exact copy has not received word-for-word user approval.

Entry: shared app footer → About, independently of Settings and also before saving a first gun. App anchor: `aboutView`. This is a history-backed state of `/`, not a separate indexable route.

## Layout and interaction

Compact About heading with Back and the existing Settings shortcut. The canonical DF logo leads the app name, version, short purpose and “Dry-fire practice, made simple.” Two readable cards explain the practice routine and local storage/backup. Contact and the email link belong to the separate [Contact screen](../contact/README.md). A concise final note describes recognition limits and the existing safety check. The shared privacy/copyright footer remains present; both centered About/Contact links remain visible with an accessible current-page indication and a divider above the footer disclosure.

Gun switching, recording controls, the safety disclosure and bottom practice navigation are hidden on this informational screen. Back/Forward retains the visited screen, including first-gun setup. Opening About does not open the microphone, create a gun, confirm safety or change saved data. Dark/Light reuse the existing theme colors; long email text wraps at narrow widths. No illustration, paid offer or cloud feature is added.

Functional specifications and proposed copy: [About](../../../requirements/about.md) · [core](../../../requirements/core.md) · [branding](../../../requirements/branding.md) · [persistence](../../../requirements/persistence.md).

## Current visual references

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| About, Dark | [overview.dark.png](overview.dark.png) | `aboutView` |
| About, Light | [overview.light.png](overview.light.png) | `aboutView` |

Actual production-build references use the pinned Chromium renderer at 390 px. Both themes and 320/390 px images were reviewed in Chromium and WebKit; [current collection and unchanged-comparison evidence](../../baselines/separate-pages-validation.json) and [build/source manifest](../../baselines/separate-pages-build-manifest.json) retain provenance. Publication does not establish Cloudflare deployment or physical microphone accuracy.
