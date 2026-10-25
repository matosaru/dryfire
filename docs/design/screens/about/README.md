# About design

CHG-061: retain marketing content inside About through reusable MarketingOverview, including the routine, free/local-data promise, free-app CTA and four guide cards. The canonical `/about/` is both public and in-app, using the same shell; `/` opens the actual trainer. Changed current images require pinned review. [SEO requirements](../../../requirements/public-seo.md).

CHG-041: the shared header now shows an orange **BETA** badge beside the wordmark in both themes/editions. It remains readable on narrow screens without covering the brand or Settings. [Beta requirements](../../../requirements/branding.md#beta-disclosure--chg-041) define this shared lifecycle label; image review/delivery is recorded in the [tracker](../../../project/implementation-history.md).

About also shows **Sound trainer · Beta · v0.8.0** and a **Feedback welcome** card: “This app is in beta. All feedback and suggestions are welcome. Visit Contact to share an idea or report a problem.” Contact remains a separate page. See [ABOUT-07](../../../requirements/about.md#beta-and-feedback--chg-041).

CHG-037: this screen uses the common app layout and screen wrapper, shared branded header with Settings, informational footer and fixed five-tab navigation. Context controls remain screen-specific. [Layout requirements](../../../requirements/page-layout.md), [template architecture](../../../architecture/page-templates.md) and [reviewed current captures](../../baselines/page-templates-review.json) define the current shell; earlier entries below retain historical evidence.

CHG-033: retain the fixed Home / Learn / Drills / Live Listen / History navigation at the bottom in both themes, with normal safe-area/content padding and no unrelated active tab. CHG-032: public copy describes basic practice/saved results/recovery; full preview retains the five-gun/custom/trends description. Both editions preserve the shared footer and data/capture guards. [Edition specification](../../../requirements/build-editions.md).

CHG-031: About/Contact footer controls are pure white in Dark (`#FFFFFF`); Light/disclosure colors and the existing layout/underline/focus/divider remain. [ABOUT-05](../../../requirements/about.md) and the [shared footer design](../shared/README.md) define the correction. [Current capture review](../../baselines/bright-footer-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-030 typography revision: primary Dark text uses `#FFFFFF` throughout this screen and neutral controls. Secondary/footer/accent colors and Light values remain. The [shared typography design](../shared/README.md) and [SET-07](../../../requirements/settings.md) define the palette; [current capture/build review](../../baselines/white-primary-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-029 revises the footer and separates Contact from About. Current captures are reviewed against the production build; [evidence](../../baselines/separate-pages-validation.json) records both passing 138-check runs. Earlier [CHG-028 evidence](../../baselines/footer-entry-validation.json) retains the superseded combined entry.

CHG-027 · Initial copy/layout proposal implemented for review on `feature/about-contact-page`; direct page/contact request authorizes this slice. Exact copy has not received word-for-word user approval.

Entry: shared app footer → About, independently of Settings and also before saving a first gun. App anchor: `aboutView`. This is a history-backed canonical `/about/` route.

## Layout and interaction

Shared branded header with Settings; compact About content heading with Back. The canonical DF logo leads the app name, version, short purpose and “Dry-fire practice, made simple.” Two readable cards explain the practice routine and local storage/backup. Contact and the email link belong to the separate [Contact screen](../contact/README.md). A concise final note describes recognition limits and the existing safety check. The shared privacy/copyright footer remains present; both centered About/Contact links remain visible with an accessible current-page indication and a divider above the footer disclosure.

Gun switching, recording controls and the inline safety disclosure are hidden. The shared five-item bottom navigation is visible with normal content/safe-area padding. Back/Forward retains the visited screen, including first-gun setup. Opening About does not open the microphone, create a gun, confirm safety or change saved data. Dark/Light reuse the existing theme colors; long email text wraps at narrow widths. No illustration, paid offer or cloud feature is added.

Functional specifications and proposed copy: [About](../../../requirements/about.md) · [core](../../../requirements/core.md) · [branding](../../../requirements/branding.md) · [persistence](../../../requirements/persistence.md).

## Current visual references

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| About, Dark | [overview.dark.png](overview.dark.png) | `aboutView` |
| About, Light | [overview.light.png](overview.light.png) | `aboutView` |

Actual production-build references use the pinned Chromium renderer at 390 px. Both themes and 320/390 px images were reviewed in Chromium and WebKit; [current collection and unchanged-comparison evidence](../../baselines/separate-pages-validation.json) and [build/source manifest](../../baselines/separate-pages-build-manifest.json) retain provenance. Publication does not establish Cloudflare deployment or physical microphone accuracy.

CHG-047 preserves this design during the React migration. The page interior now has one typed component with colocated styles/tests; the shared shell and exact existing browser images remain the reference. No visual redesign or new screenshot baseline is authorized.
