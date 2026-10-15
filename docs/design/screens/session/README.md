# Drill Session design

CHG-041: the shared header now shows an orange **BETA** badge beside the wordmark in both themes/editions. It remains readable on narrow screens without covering the brand or Settings. [Beta requirements](../../../requirements/branding.md#beta-disclosure--chg-041) define this shared lifecycle label; image review/delivery is recorded in the [tracker](../../../project/implementation-history.md).

CHG-037: this screen uses the common app layout and screen wrapper, shared branded header with Settings, informational footer and fixed five-tab navigation. Context controls remain screen-specific. [Layout requirements](../../../requirements/page-layout.md), [template architecture](../../../architecture/page-templates.md) and [reviewed current captures](../../baselines/page-templates-review.json) define the current shell; earlier entries below retain historical evidence.

CHG-031: About/Contact footer controls are pure white in Dark (`#FFFFFF`); Light/disclosure colors and the existing layout/underline/focus/divider remain. [ABOUT-05](../../../requirements/about.md) and the [shared footer design](../shared/README.md) define the correction. [Current capture review](../../baselines/bright-footer-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-030 typography revision: primary Dark text uses `#FFFFFF` throughout this screen and neutral controls. Secondary/footer/accent colors and Light values remain. The [shared typography design](../shared/README.md) and [SET-07](../../../requirements/settings.md) define the palette; [current capture/build review](../../baselines/white-primary-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-029 capture refresh: current references use the pinned production-build renderer and separate centered About/Contact footer controls. [Capture/build review](../../baselines/separate-pages-validation.json) records both passing 138-check runs and reviewed images; earlier [CHG-028 evidence](../../baselines/footer-entry-validation.json) retains the combined entry.

Current implemented layout · CHG-018 coverage audit / CHG-019 corrections · 2026-10-11 · CHG-023 footer published in [`dbf8687`](https://github.com/matosaru/dryfire/commit/dbf8687); earlier feature baseline [`aacdb18`](https://github.com/matosaru/dryfire/commit/aacdb18); exact reviewed file hashes are in the registry

Entry: Start Drill on a built-in/custom sequence, or History review. App anchor: `sessionView`. This is a state of the same `/` web app, not a separate indexable URL.

## Layout and interaction

Keep the ordered sequence visible once. Configure exposes repetitions (default ten), fixed/random delay (default fixed three seconds), Sound at start (default Off), readiness and Start Session. Require only referenced sound types. Run shows completed/left, countdown/GO, latest repetition and Pause/Resume/End. Legacy GO is a status; the Practice STOP correction does not replace this runner. Each ordered completion is saved and followed by a fresh countdown. Review shows totals and repetition/split details, Repeat Session and Back to Drills.

Functional specifications: [drill-sessions](../../../requirements/drill-sessions.md) · [practice-improvements](../../../requirements/practice-improvements.md) · [persistence](../../../requirements/persistence.md). These define acceptance behavior and input bounds; the layout here does not introduce a second set of requirement IDs.

## Current visual references

![Drill Session current layout](configure.dark.png)

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| Configure sequence | [`configure.dark.png`](configure.dark.png) | `sessionConfigure` |
| Active sequence | [`active.dark.png`](active.dark.png) | `sessionRun` |
| Paused sequence | [`paused.dark.png`](paused.dark.png) | `sessionRun` |
| Saved sequence review | [`review.dark.png`](review.dark.png) | `sessionReview` |

Captured from the current local production build in Chromium at a 390 px mobile viewport. QA gun names, sample counts, audio levels and timing statistics are illustrative fixtures. Captures are actual UI rather than generated concepts; they do not establish Cloudflare deployment, real iPhone recognition accuracy or legal clearance. Additional transient/error states use this same layout and the linked requirements.

For a visible change, update the affected captures, this Markdown and the [screen registry](../../../architecture/screen-map.json); run the [maintenance checks](../../../architecture/README.md). Earlier reviewed revisions remain in the [archive](../../archive/README.md) and immutable Git history.
