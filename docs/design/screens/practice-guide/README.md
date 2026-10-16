# About this practice — shared guide design

CHG-044 · 2026-10-15 · Implementation/capture/CI status is recorded in the [delivery tracker](../../../project/implementation-history.md).

One shared `practiceGuideView` page opens from **About this practice ›**, below the title of stopped Practice or Sequence configuration. It keeps the shared BETA header, Settings, informational footer and fixed five-tab navigation with Drills active. The informational page omits the setup safety/gun-switch controls; reading never acquires audio, asks for safety permission or starts practice.

The page includes a mode/preset title and purpose, actual selected sequence/endpoints where relevant, current start-source explanation, static synthetic example, What it measures, three How it works steps, Good to know, Before you start and Back to setup. User titles/steps are inserted as text. Back/Forward and both Back controls preserve the same gun/source context and invalid/unsaved form values; stale contexts fall back safely. An active/pending/unsaved session cannot enter the guide.

The shared live-template illustration follows the [reviewed animation direction](../../proposals/practice-guides/README.md#animation-direction), using the actual pure session engines with synthetic detections. Small example targets and optional app beep are clearly disclosed; external/silent setups explain the difference. Initial motion is stopped in all motion preferences. Play/Pause/Resume/Replay work without audio; navigating away or hiding the page pauses; Review stops playback. Single provides separate Normal/Early examples. Reload uses the selected endpoints; custom examples follow the saved preset's actual order. Long presets show one complete example attempt, avoiding unnecessarily repeated long media.

Requirements: [practice guides](../../../requirements/practice-guides.md), [shared layout](../../../requirements/page-layout.md), [practice modes](../../../requirements/practice-modes.md), [ordered sessions](../../../requirements/drill-sessions.md). Local/pinned browser evidence does not establish deployment or microphone accuracy.

## Current captures

The state/theme image list below is generated from the screen registry when the implementation references are reviewed. Source/pixel acceptance and publication are tracked separately; proposal images remain under `proposals/` as history.

| State | Capture | App anchor |
| --- | --- | --- |
| single guide, dark | [single.dark.png](single.dark.png) | `practiceGuideExample` |
| single guide, light | [single.light.png](single.light.png) | `practiceGuideExample` |
| repeated guide, dark | [repeated.dark.png](repeated.dark.png) | `practiceGuideExample` |
| repeated guide, light | [repeated.light.png](repeated.light.png) | `practiceGuideExample` |
| par guide, dark | [par.dark.png](par.dark.png) | `practiceGuideExample` |
| par guide, light | [par.light.png](par.light.png) | `practiceGuideExample` |
| control guide, dark | [control.dark.png](control.dark.png) | `practiceGuideExample` |
| control guide, light | [control.light.png](control.light.png) | `practiceGuideExample` |
| reload guide, dark | [reload.dark.png](reload.dark.png) | `practiceGuideExample` |
| reload guide, light | [reload.light.png](reload.light.png) | `practiceGuideExample` |
| free guide, dark | [free.dark.png](free.dark.png) | `practiceGuideExample` |
| free guide, light | [free.light.png](free.light.png) | `practiceGuideExample` |
| sequence trigger only guide, dark | [sequence-trigger-only.dark.png](sequence-trigger-only.dark.png) | `practiceGuideExample` |
| sequence trigger only guide, light | [sequence-trigger-only.light.png](sequence-trigger-only.light.png) | `practiceGuideExample` |
| sequence rack trigger guide, dark | [sequence-rack-trigger.dark.png](sequence-rack-trigger.dark.png) | `practiceGuideExample` |
| sequence rack trigger guide, light | [sequence-rack-trigger.light.png](sequence-rack-trigger.light.png) | `practiceGuideExample` |
| sequence mag trigger guide, dark | [sequence-mag-trigger.dark.png](sequence-mag-trigger.dark.png) | `practiceGuideExample` |
| sequence mag trigger guide, light | [sequence-mag-trigger.light.png](sequence-mag-trigger.light.png) | `practiceGuideExample` |
| sequence draw mag trigger guide, dark | [sequence-draw-mag-trigger.dark.png](sequence-draw-mag-trigger.dark.png) | `practiceGuideExample` |
| sequence draw mag trigger guide, light | [sequence-draw-mag-trigger.light.png](sequence-draw-mag-trigger.light.png) | `practiceGuideExample` |
| sequence custom guide, dark | [sequence-custom.dark.png](sequence-custom.dark.png) | `practiceGuideExample` |
| sequence custom guide, light | [sequence-custom.light.png](sequence-custom.light.png) | `practiceGuideExample` |
| single early guide, dark | [single-early.dark.png](single-early.dark.png) | `practiceGuideExample` |
| single early guide, light | [single-early.light.png](single-early.light.png) | `practiceGuideExample` |
| reload selected endpoints context | [reload-selected-endpoints.dark.png](reload-selected-endpoints.dark.png) | `practiceGuideExample` |
| external start context | [external-start.dark.png](external-start.dark.png) | `practiceGuideExample` |
| silent start context | [silent-start.dark.png](silent-start.dark.png) | `practiceGuideExample` |

## Shared live screen and maintained GIFs — CHG-045

The initial Canvas was rejected by user review. The example now compiles the real Practice/Sequence run and review fragments with namespaced IDs and uses the same read-only presentation functions and CSS. It shows the actual counters, STOP/microphone card, countdown and results. Only synthetic events/levels drive it; reading and playback never capture/save.

Current animated exports are generated from this working component using `node tools/export-guide-examples.mjs`, then `python3 tools/encode-guide-examples.py`. Their source/media manifest is validated by `docs:check`; see [examples](examples/README.md). Any relevant design change requires updating live/help/GIF/screenshot evidence together.
