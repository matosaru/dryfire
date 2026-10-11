# About design

CHG-027 · Initial copy/layout proposal implemented for review on `feature/about-contact-page`; direct page/contact request authorizes this slice. Exact copy has not received word-for-word user approval.

Entry: Settings → About & contact, also available before saving a first gun. App anchor: `aboutView`. This is a history-backed state of `/`, not a separate indexable route.

## Layout and interaction

Compact About heading with Back and the existing Settings shortcut. The canonical DF logo leads the app name, version, short purpose and “Dry-fire practice, made simple.” Three readable cards explain the practice routine, local storage/backup and contact. The confirmed address is a selectable email link with a visible email-app explanation. A concise final note describes recognition limits and the existing safety check. The shared privacy/copyright footer remains present.

Gun switching, recording controls, the safety disclosure and bottom practice navigation are hidden on this informational screen. Back/Forward retains the visited screen, including first-use Settings. Opening About does not open the microphone, create a gun, confirm safety or change saved data. Dark/Light reuse the existing theme colors; long email text wraps at narrow widths. No illustration, paid offer or cloud feature is added.

Functional specifications and proposed copy: [About](../../../requirements/about.md) · [core](../../../requirements/core.md) · [branding](../../../requirements/branding.md) · [persistence](../../../requirements/persistence.md).

## Current visual references

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| About, Dark | [overview.dark.png](overview.dark.png) | `aboutView` |
| About, Light | [overview.light.png](overview.light.png) | `aboutView` |

Capture review and rendering evidence are recorded in the delivery tracker. Actual production-build captures show the proposed page; publication does not establish Cloudflare deployment or physical microphone accuracy.
