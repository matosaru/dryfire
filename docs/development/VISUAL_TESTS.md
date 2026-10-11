# Screenshot regression tests

CHG-021 · revision 1.0 · directly authorized on 2026-10-11 by the user's instruction to proceed with repeatable Chromium/WebKit screenshot checks in CI and downloadable difference images.

## Acceptance criteria

- Test the built `dist/` application in isolated browser contexts using a committed synthetic format-4 backup and deterministic clock/randomness/audio capabilities. Do not read or reset production data, expose test hooks in production, or replace app-rendered controls with static test markup.
- Cover all 41 current screen states in the [screen registry](../architecture/screen-map.json), including six practice configurations, running/countdown/paused/review states, shared safety confirmation, themes and deletion/reset outcomes. Include explicit 320 px layout checks alongside the normal mobile viewport.
- Use separately reviewed Chromium and WebKit PNG baselines, identified by screen/state/viewport, in [design baselines](../design/baselines/README.md). Pin the browser package, Linux rendering image and dependency lockfile so local baseline generation and CI use the same environment.
- Compare stable screenshots with zero allowed differing pixels. Stabilize clocks, synthetic audio, GIFs, focus/caret and fonts; do not mask controls or automatically accept baseline changes in CI.
- Assert the intended state and absence of horizontal overflow/page errors before capture. Missing state coverage or missing expected images must fail, not silently establish a new baseline.
- A visible CSS change must fail comparison and produce expected, actual and diff PNGs in a downloadable HTML report. Upload reports/results even when the test command fails; preserve the failure exit status.
- Prove repeatability with an unchanged rerun and deliberately demonstrate the failure/report path without committing the injected defect. Then run the full existing test/build/documentation workflow before direct-main publication.
- Document commands, baseline review/update policy, test environment and limits. Browser pixels do not verify physical iPhone microphone/recognition, audible output, Cloudflare deployment or native releases.

Implementation, validation and publication status are recorded in [the delivery tracker](../project/implementation-history.md). Existing current designs remain reviewed visual references; these per-browser baselines are reproducible test artifacts rather than a second competing design catalog.

## Initial collection status

The managed workspace can run system Chromium for state-harness debugging, but cannot download the pinned rendering image: its blob download redirects to `westcentralus.data.mcr.microsoft.com`, outside the active allowlist. An additive environment-network draft is saved but has not been published. System-browser captures are temporary and cannot become canonical baselines.

The temporary **Collect initial visual candidates** workflow renders the 104 candidates in the pinned GitHub container, requires an unchanged exact rerun, and publishes only `visual-candidates/` for inspection. No candidate is an accepted baseline. After review against the linked requirements/designs, promote the images to the browser baseline folders, record their fingerprint manifest and remove the collection workflow/configuration and candidate folder. The permanent comparison workflow must reject missing baselines and may never regenerate them.
