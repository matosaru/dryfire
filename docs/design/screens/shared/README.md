# Safety confirmation design

Current implemented layout · CHG-018 coverage audit · 2026-10-11 · application baseline [`b29837a`](https://github.com/matosaru/dryfire/commit/b29837a) plus CHG-019; exact reviewed file hashes are in the registry

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
