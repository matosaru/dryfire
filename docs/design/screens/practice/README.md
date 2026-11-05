CHG-058: all four trigger modes reuse the Sequence configuration template through DrillSetup. Count/Par use the compact repetition card; Start signal and Start delay use grouped cards; Sound at start uses the separate Sequence switch card. Required sound labels use the same left-aligned ordered-list geometry. External source hides the complete app timing/sound region. Existing controls, bounds, defaults, gun/safety/draft/capture behavior stay intact. [Requirements](../../../requirements/drill-setup-template.md). Pinned references were reviewed from collector 39952757111 / image-only commit 276eacb. Full acceptance is tracked in project history.

# Practice design

CHG-063: app-signal setup includes the shared **Test start sound** action, explains device media-volume control and displays the actual 0.19-second cue guard. Microphone capture observes the room before countdown and reports readiness before an attempt begins. [Audio v3 requirements](../../../requirements/audio-recognition-v3.md) define the behavior and physical-device acceptance gate.

CHG-044: stopped configuration now includes **ⓘ About this practice** after context/sounds, immediately before setup. It opens the [shared guide](../practice-guide/README.md) without microphone/safety prompts and preserves the current gun, mode/preset and invalid/unsaved settings. The link is hidden during connecting/running/review. [Guide requirements](../../../requirements/practice-guides.md) define navigation and examples; actual image acceptance/publication is in the tracker.

CHG-041: the shared header now shows an orange **BETA** badge beside the wordmark in both themes/editions. It remains readable on narrow screens without covering the brand or Settings. [Beta requirements](../../../requirements/branding.md#beta-disclosure--chg-041) define this shared lifecycle label; image review/delivery is recorded in the [tracker](../../../project/implementation-history.md).

CHG-037: this screen uses the common app layout and screen wrapper, shared branded header with Settings, informational footer and fixed five-tab navigation. Context controls remain screen-specific. [Layout requirements](../../../requirements/page-layout.md), [template architecture](../../../architecture/page-templates.md) and [reviewed current captures](../../baselines/page-templates-review.json) define the current shell; earlier entries below retain historical evidence.

CHG-031: About/Contact footer controls are pure white in Dark (`#FFFFFF`); Light/disclosure colors and the existing layout/underline/focus/divider remain. [ABOUT-05](../../../requirements/about.md) and the [shared footer design](../shared/README.md) define the correction. [Current capture review](../../baselines/bright-footer-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-030 typography revision: primary Dark text uses `#FFFFFF` throughout this screen and neutral controls. Secondary/footer/accent colors and Light values remain. The [shared typography design](../shared/README.md) and [SET-07](../../../requirements/settings.md) define the palette; [current capture/build review](../../baselines/white-primary-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-029 capture refresh: current references use the pinned production-build renderer and separate centered About/Contact footer controls. [Capture/build review](../../baselines/separate-pages-validation.json) records both passing 138-check runs and reviewed images; earlier [CHG-028 evidence](../../baselines/footer-entry-validation.json) retains the combined entry.

Current implemented layout · CHG-022 microphone/start corrections · 2026-10-11 · local source revision; previous published baseline [`aacdb18`](https://github.com/matosaru/dryfire/commit/aacdb18); exact reviewed file hashes are in the registry

Entry: Six mode cards or saved practice review in History. App anchor: `practiceView`. This is a state of the same `/` web app, not a separate indexable URL.

## Layout and interaction

Configure exposes only mode-relevant count/par, app/external start source, fixed/random delay, beep and readiness. Single defaults to ten automatic repetitions with fresh random 2–5-second countdown/signal/first accepted trigger each time. Running uses STOP and the microphone meter below when capture is live; Pause releases capture. Par offer Next between resolved attempts; repeated/control remain continuous. Review shows saved outcomes and Repeat / Back to Drills. Histories use actual previous-screen Back and never restart capture on refresh.

Other required states: Connecting; cancel/end remains available; External-cue waiting; live input until calibrated cue starts timing; Finishing a deadline; late events rejected by onset time; Manual Next for Par only; Saving error; Retry and navigation recovery guard.

Functional specifications: [practice-modes](../../../requirements/practice-modes.md) · [practice-improvements](../../../requirements/practice-improvements.md) · [persistence](../../../requirements/persistence.md). These define acceptance behavior and input bounds; the layout here does not introduce a second set of requirement IDs.

CHG-022 implemented revision: Connecting waits for actual incoming audio before countdown. Countdown retains seconds/STOP and adds the live microphone meter below; GO keeps the same STOP/meter. Single early clicks produce **Miss · early trigger** in the latest result and saved Review, followed automatically by a fresh delay until the target. Configure explains that input is monitored before the beep and that the device volume controls audible output. The timing/data rules and acceptance criteria are in [practice-start](../../../requirements/practice-start.md); The actual production-build captures below show this revision. Earlier captures are retained under CHG-022 in the archive.

## Current visual references

![Practice current layout](configure-single.dark.png)

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| Configure single | [`configure-single.dark.png`](configure-single.dark.png) | `practiceConfigure` |
| Configure repeated | [`configure-repeated.dark.png`](configure-repeated.dark.png) | `practiceConfigure` |
| Configure par | [`configure-par.dark.png`](configure-par.dark.png) | `practiceConfigure` |
| Configure control | [`configure-control.dark.png`](configure-control.dark.png) | `practiceConfigure` |
| Fresh ready countdown | [`countdown.dark.png`](countdown.dark.png) | `practiceRun` |
| Listening with STOP and microphone | [`active.dark.png`](active.dark.png) | `practiceRun` |
| Light theme listening | [`active.light.png`](active.light.png) | `practiceRun` |
| Paused microphone inactive | [`paused.dark.png`](paused.dark.png) | `practiceRun` |
| Early-trigger failed review | [`early-review.dark.png`](early-review.dark.png) | `practiceReview` |
| Saved practice review | [`review.dark.png`](review.dark.png) | `practiceReview` |

Captured from the current local production build in Chromium at a 390 px mobile viewport. QA gun names, sample counts, audio levels and timing statistics are illustrative fixtures. Captures are actual UI rather than generated concepts; they do not establish Cloudflare deployment, real iPhone recognition accuracy or legal clearance. Additional transient/error states use this same layout and the linked requirements.

For a visible change, update the affected captures, this Markdown and the [screen registry](../../../architecture/screen-map.json); run the [maintenance checks](../../../architecture/README.md). Earlier reviewed revisions remain in the [archive](../../archive/README.md) and immutable Git history.

Light configuration references: [Single](configure-single.light.png), [Par time](configure-par.light.png).

CHG-059 adopts the shared outlined information link and ordered sound list from DrillSetup. See [guide layout requirements](../../../requirements/guide-layout.md); preserve shared shell, fixed navigation and read-only simulated examples. Screenshot acceptance is recorded in project history.
