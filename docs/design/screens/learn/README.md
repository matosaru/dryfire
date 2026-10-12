# Learn Sounds design

CHG-037: this screen uses the common app layout and screen wrapper, shared branded header with Settings, informational footer and fixed five-tab navigation. Context controls remain screen-specific. [Layout requirements](../../../requirements/page-layout.md), [template architecture](../../../architecture/page-templates.md) and [reviewed current captures](../../baselines/page-templates-review.json) define the current shell; earlier entries below retain historical evidence.

CHG-031: About/Contact footer controls are pure white in Dark (`#FFFFFF`); Light/disclosure colors and the existing layout/underline/focus/divider remain. [ABOUT-05](../../../requirements/about.md) and the [shared footer design](../shared/README.md) define the correction. [Current capture review](../../baselines/bright-footer-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-030 typography revision: primary Dark text uses `#FFFFFF` throughout this screen and neutral controls. Secondary/footer/accent colors and Light values remain. The [shared typography design](../shared/README.md) and [SET-07](../../../requirements/settings.md) define the palette; [current capture/build review](../../baselines/white-primary-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-029 capture refresh: current references use the pinned production-build renderer and separate centered About/Contact footer controls. [Capture/build review](../../baselines/separate-pages-validation.json) records both passing 138-check runs and reviewed images; earlier [CHG-028 evidence](../../baselines/footer-entry-validation.json) retains the combined entry.

Current implemented layout · CHG-018 coverage audit / CHG-019 corrections · 2026-10-11 · CHG-023 footer published in [`dbf8687`](https://github.com/matosaru/dryfire/commit/dbf8687); earlier feature baseline [`aacdb18`](https://github.com/matosaru/dryfire/commit/aacdb18); exact reviewed file hashes are in the registry

Entry: Learn tab, Home card or missing-sound link. App anchor: `learnView`. This is a state of the same `/` web app, not a separate indexable URL.

## Layout and interaction

Primary Trigger training card; optional Draw/Rack/Magazine disclosure with per-label recognition controls; optional reset/noise/external-beep calibration disclosure. Preview, Train, Test and confirmed per-category Reset are distinct. Three compatible samples are required; 8–10 recommended. New recordings stop at ten per gun/type/category; older over-cap data remains. Capture asks for safety first.

Functional specifications: [core](../../../requirements/core.md) · [practice-modes](../../../requirements/practice-modes.md) · [practice-improvements](../../../requirements/practice-improvements.md). These define acceptance behavior and input bounds; the layout here does not introduce a second set of requirement IDs.

## Current visual references

![Learn Sounds current layout](overview.dark.png)

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| Trigger-first learning | [`overview.dark.png`](overview.dark.png) | `classCards` |
| Optional action sounds | [`optional-sounds.dark.png`](optional-sounds.dark.png) | `optionalClassCards` |
| Rejection and external-cue calibration | [`calibration.dark.png`](calibration.dark.png) | `calibrationCards` |
| Preserved old profile above the new cap | [`recording-limit.dark.png`](recording-limit.dark.png) | `classCards` |

Captured from the current local production build in Chromium at a 390 px mobile viewport. QA gun names, sample counts, audio levels and timing statistics are illustrative fixtures. Captures are actual UI rather than generated concepts; they do not establish Cloudflare deployment, real iPhone recognition accuracy or legal clearance. Additional transient/error states use this same layout and the linked requirements.

For a visible change, update the affected captures, this Markdown and the [screen registry](../../../architecture/screen-map.json); run the [maintenance checks](../../../architecture/README.md). Earlier reviewed revisions remain in the [archive](../../archive/README.md) and immutable Git history.
