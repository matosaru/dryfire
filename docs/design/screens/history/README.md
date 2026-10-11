# History design

Current implemented layout · CHG-018 coverage audit / CHG-019 corrections · 2026-10-11 · published source [`aacdb18`](https://github.com/matosaru/dryfire/commit/aacdb18); exact reviewed file hashes are in the registry

Entry: History tab or Home card. App anchor: `historyView`. This is a state of the same `/` web app, not a separate indexable URL.

## Layout and interaction

Per-gun comparable drill/settings and time-range filters, session count/mean/median/spread, trend chart and accessible data table. Saved legacy/practice cards reopen their respective Review. Recent retained recognition checks have explicit verified-only limitations and last-N control (1–500). Clearing/trimming recent recognition results preserves saved sessions and learned sounds. No comparable data shows an honest empty/insufficient state.

Functional specifications: [core](../../../requirements/core.md) · [practice-improvements](../../../requirements/practice-improvements.md) · [persistence](../../../requirements/persistence.md). These define acceptance behavior and input bounds; the layout here does not introduce a second set of requirement IDs.

## Current visual references

![History current layout](progress.dark.png)

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| Progress charts, Dark | [`progress.dark.png`](progress.dark.png) | `progressContent` |
| Accessible chart data table | [`data-table.dark.png`](data-table.dark.png) | `progressContent` |
| Progress charts, Light | [`progress.light.png`](progress.light.png) | `progressContent` |

Captured from the current local production build in Chromium at a 390 px mobile viewport. QA gun names, sample counts, audio levels and timing statistics are illustrative fixtures. Captures are actual UI rather than generated concepts; they do not establish Cloudflare deployment, real iPhone recognition accuracy or legal clearance. Additional transient/error states use this same layout and the linked requirements.

For a visible change, update the affected captures, this Markdown and the [screen registry](../../../architecture/screen-map.json); run the [maintenance checks](../../../architecture/README.md). Earlier reviewed revisions remain in the [archive](../../archive/README.md) and immutable Git history.
