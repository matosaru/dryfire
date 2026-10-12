# Settings design

CHG-028 capture refresh: current references use the pinned production-build renderer and the independent About & contact footer entry. [Capture/build evidence](../../baselines/footer-entry-validation.json) records both 130-check runs and reviewed images.

Current implemented layout · CHG-018 coverage audit / CHG-019 corrections · 2026-10-11 · CHG-023 footer published in [`dbf8687`](https://github.com/matosaru/dryfire/commit/dbf8687); earlier feature baseline [`aacdb18`](https://github.com/matosaru/dryfire/commit/aacdb18); exact reviewed file hashes are in the registry

Entry: Settings gear in each screen heading; backup/restore links. App anchor: `settingsView`. This is a state of the same `/` web app, not a separate indexable URL.

## Layout and interaction

Distinct confirmed selected-gun sound reset with visible learned/calibration counts and result; whole-library backup export/import; supported per-gun Noise Filter/Auto Gain and device-wide themes/vibration. A separate Delete all guns & app data action states every store deleted, recommends exporting first, and requires confirmation before atomic reset/restart. Cancel deletes nothing. Sound reset retains guns, presets/results and other guns. Unsupported capabilities are disclosed; Install explains local-data and microphone limits. CHG-028 keeps a Device information group with capability status. About & contact is a separate shared app-footer link, outside the Settings controls, and opens its independent screen directly.

Functional specifications: [settings](../../../requirements/settings.md) · [core](../../../requirements/core.md) · [persistence](../../../requirements/persistence.md) · [About](../../../requirements/about.md). These define acceptance behavior and input bounds; the layout here does not introduce a second set of requirement IDs.

## Current visual references

![Settings current layout](overview.dark.png)

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| Settings, Dark | [`overview.dark.png`](overview.dark.png) | `settingsView` |
| Settings, Light | [`overview.light.png`](overview.light.png) | `settingsView` |
| Completed selected-gun sound reset | [`sounds-reset.dark.png`](sounds-reset.dark.png) | `soundResetOutcome` |

CHG-027 captures come from the production build in pinned Chromium at 390 px, with the changed entry also reviewed at 320 px and in WebKit. [Rendering evidence](../../baselines/about-validation.json) retains source/collection details. QA gun names, sample counts, audio levels and timing statistics are illustrative fixtures. Captures are actual UI rather than generated concepts; they do not establish Cloudflare deployment, real iPhone recognition accuracy or legal clearance. Additional transient/error states use this same layout and the linked requirements.

For a visible change, update the affected captures, this Markdown and the [screen registry](../../../architecture/screen-map.json); run the [maintenance checks](../../../architecture/README.md). Earlier reviewed revisions remain in the [archive](../../archive/README.md) and immutable Git history.
