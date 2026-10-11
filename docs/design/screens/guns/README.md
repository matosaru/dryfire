# My Guns design

Current implemented layout · CHG-018 coverage audit / CHG-019 corrections · 2026-10-11 · published source [`aacdb18`](https://github.com/matosaru/dryfire/commit/aacdb18); exact reviewed file hashes are in the registry

Entry: Active-gun switcher. App anchor: `gunsView`. This is a state of the same `/` web app, not a separate indexable URL.

## Layout and interaction

Illustrated library cards show gun name/type, readiness, selected status and capacity out of five. Each has separate Select and Edit actions; no nested buttons. Add opens the illustrated type form. Editing retains all owned data and selection; switching loads only the selected gun’s model/history. Backup & restore remains accessible.

Functional specifications: [gun-profiles](../../../requirements/gun-profiles.md) · [persistence](../../../requirements/persistence.md). These define acceptance behavior and input bounds; the layout here does not introduce a second set of requirement IDs.

## Current visual references

![My Guns current layout](library.dark.png)

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| Gun library | [`library.dark.png`](library.dark.png) | `gunList` |
| Illustrated library, Light | [`library.light.png`](library.light.png) | `gunList` |

Captured from the current local production build in Chromium at a 390 px mobile viewport. QA gun names, sample counts, audio levels and timing statistics are illustrative fixtures. Captures are actual UI rather than generated concepts; they do not establish Cloudflare deployment, real iPhone recognition accuracy or legal clearance. Additional transient/error states use this same layout and the linked requirements.

For a visible change, update the affected captures, this Markdown and the [screen registry](../../../architecture/screen-map.json); run the [maintenance checks](../../../architecture/README.md). Earlier reviewed revisions remain in the [archive](../../archive/README.md) and immutable Git history.
