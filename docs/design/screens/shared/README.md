# Shared page shell and safety confirmation

CHG-041: the shared header now shows an orange **BETA** badge beside the wordmark in both themes/editions. It remains readable on narrow screens without covering the brand or Settings. [Beta requirements](../../../requirements/branding.md#beta-disclosure--chg-041) define this shared lifecycle label; image review/delivery is recorded in the [tracker](../../../project/implementation-history.md).

CHG-037 standardizes **header → main content → shared footer links/disclosure/copyright → fixed bottom tabs** across every screen. The branded header and Settings gear remain shared and visible; local page titles/back controls stay within content. Gun setup/library now retain the tabs and the same bottom safe-area spacing. Without a valid gun, practice tabs are disabled while Settings/About/Contact/recovery remain available. Short pages keep their footer toward the viewport bottom; long-page content and final controls scroll clear of the tabs. Existing gun/safety context remains page-specific. All twelve screens compile through the same [reusable layout and screen wrapper](../../../architecture/page-templates.md), with shared header/footer/nav fragments and screen-only content templates. See [LAYOUT-01–07](../../../requirements/page-layout.md); [Current image review](../../baselines/page-templates-review.json) records 262 changed/new references, four preserved Home images and both passing 168/180-check runs; publication is tracked separately.

CHG-033 overrides hidden practice tabs on About/Contact: both retain the shared fixed five-item bottom navigation and normal safe-area/content padding. Their gun selector and inline safety disclosure stay hidden; main destinations retain setup/capture guards. CHG-032 applies the [public/full edition specification](../../../requirements/build-editions.md) without changing safety or stored-data formats.

CHG-031 footer contrast correction: the centered **About** and **Contact** controls now use **`#FFFFFF` / `rgb(255, 255, 255)` in resolved Dark mode**. Light controls keep `#4A6276`; the disclosure/copyright remains muted (`#8594A4` in Dark). This supersedes the earlier Dark footer-matching exception while keeping size, underline, focus outline, no arrows, divider, touch targets and navigation intact. [ABOUT-05](../../../requirements/about.md) / [CONTACT-04](../../../requirements/contact.md) own this requested correction. Affected Dark captures are refreshed/reviewed, with original Light images retained. [Current capture review](../../baselines/bright-footer-validation.json) and [build/source manifest](../../baselines/bright-footer-build-manifest.json) record provenance; publication is tracked separately.

CHG-030 shared typography: resolved Dark mode uses **`#FFFFFF` / `rgb(255, 255, 255)`** for primary headings/content and neutral control labels/values throughout the app, including session/practice/history primary text. A shared Dark-only primary-text token covers inherited text and existing explicit near-white overrides. Muted copy, semantic accents/status colors and dark labels on orange buttons retain their colors. CHG-031 separately makes the footer controls white in Dark mode; the disclosure stays muted. Light mode retains its existing palette. Font sizes, layout, focus outlines, navigation and stored data stay intact. [SET-07](../../../requirements/settings.md) records the directly requested palette revision; all affected Dark production-build references are refreshed/reviewed in the pinned renderer. [Current color/capture evidence](../../baselines/white-primary-validation.json) and the [build manifest](../../baselines/white-primary-build-manifest.json) retain provenance; existing Light references remain untouched and publication is tracked separately.

CHG-029 shared footer: two separate **About** and **Contact** controls are centered in a row above the data disclosure. Each opens its independent informational screen without visiting Settings, including before gun setup. Both remain visible on both pages; the current page has `aria-current="page"`. Remove the arrow. Preserve the 0.85rem font, underline, 44px minimum target and 2px keyboard focus outline with 3px offset. CHG-031 now makes controls white in Dark; Light controls still match footer text `#4a6276`. A 1px divider below the row separates links from disclosure text, using the existing theme border colors. The privacy/copyright text and five main practice destinations remain. [About](../../../requirements/about.md) and [Contact](../../../requirements/contact.md) specify the pages. All affected production-build captures are refreshed/reviewed in both pinned browsers; [capture evidence](../../baselines/separate-pages-validation.json) and [delivery status](../../../project/implementation-history.md) are tracked separately.

CHG-023 shared footer: every functional screen retains its data/microphone disclosure, followed by **© 2026 Dry Fire With Ease. All rights reserved.** in the same readable footer style. It wraps naturally on narrow screens and supports the existing Dark/Light themes. The notice belongs to the shared page layout; it creates no new screen or public route. Current captures are refreshed with the footer; the modal still uses the same acknowledgement/continuation rules.

Current implemented layout · CHG-018 coverage audit · 2026-10-11 · CHG-023 source published in [`dbf8687`](https://github.com/matosaru/dryfire/commit/dbf8687); exact reviewed file hashes are in the registry

Entry: Any unconfirmed action that would acquire microphone capture. App anchor: `safetyModal`. This is a state of the same `/` web app, not a separate indexable URL.

## Layout and interaction

Native accessible modal with explicit safety text, acknowledgement checkbox, disabled Confirm & continue until checked and Cancel. Confirm resumes the original action exactly once; Cancel or changed context does not start capture. Acknowledgement is page-session-local, resets on refresh or gun change, and is never a permanent waiver. The disclosure remains available for reviewing the checklist.

Functional specifications: [core](../../../requirements/core.md) · [practice-improvements](../../../requirements/practice-improvements.md). These define acceptance behavior and input bounds; the layout here does not introduce a second set of requirement IDs.

## Current visual references

![Safety confirmation current layout](safety-modal.dark.png)

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| Unconfirmed capture action | [`safety-modal.dark.png`](safety-modal.dark.png) | `safetyModal` |

Captured from the current local production build in Chromium at a 390 px mobile viewport. QA gun names, sample counts, audio levels and timing statistics are illustrative fixtures. Captures are actual UI rather than generated concepts; they do not establish Cloudflare deployment, real iPhone recognition accuracy or legal clearance. Additional transient/error states use this same layout and the linked requirements.

For a visible change, update the affected captures, this Markdown and the [screen registry](../../../architecture/screen-map.json); run the [maintenance checks](../../../architecture/README.md). Earlier reviewed revisions remain in the [archive](../../archive/README.md) and immutable Git history.


## CHG-062 — information navigation in the header

Supersedes historical footer links: top-right About (information circle), Contact (@ SVG), Settings (gear), in that order on every app page. Shared 24px outlined icons and 44px targets; matching optical weight, baseline and theme treatment. Accessible names, real hrefs, current-page indicator, focus ring and keyboard/hover tooltips. Narrow screens may wrap the Beta badge within brand copy; icons never overlap the brand or overflow. Footer retains disclosure/copyright and divider only. Update every affected current screen reference and both-edition/browser baselines; do not alter unrelated content or guide animation frames. See H1 and LAYOUT-01/05.
