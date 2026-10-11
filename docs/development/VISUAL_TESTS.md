# Screenshot regression tests

CHG-021 · revision 1.0 · directly authorized on 2026-10-11 by the user's instruction to proceed with repeatable Chromium/WebKit screenshot checks in CI and downloadable difference images.

## Acceptance criteria

- Test the built `dist/` application in isolated browser contexts using a committed synthetic format-4 backup and deterministic clock/randomness/audio capabilities. Do not read or reset production data, expose test hooks in production, or replace app-rendered controls with static test markup.
- Cover all 42 current screen states in the [screen registry](../architecture/screen-map.json), including six practice configurations, running/countdown/paused/review states, shared safety confirmation, themes and deletion/reset outcomes. Include explicit 320 px layout checks alongside the normal mobile viewport.
- Use separately reviewed Chromium and WebKit PNG baselines, identified by screen/state/viewport, in [design baselines](../design/baselines/README.md). Pin the browser package, Linux rendering image and dependency lockfile so local baseline generation and CI use the same environment.
- Compare stable screenshots with zero allowed differing pixels. Stabilize clocks, synthetic audio, GIFs, focus/caret and fonts; do not mask controls or automatically accept baseline changes in CI.
- Assert the intended state and absence of horizontal overflow/page errors before capture. Missing state coverage or missing expected images must fail, not silently establish a new baseline.
- A visible CSS change must fail comparison and produce expected, actual and diff PNGs in a downloadable HTML report. Upload reports/results even when the test command fails; preserve the failure exit status.
- Prove repeatability with an unchanged rerun and deliberately demonstrate the failure/report path without committing the injected defect. Then run the full existing test/build/documentation workflow before direct-main publication.
- Document commands, baseline review/update policy, test environment and limits. Browser pixels do not verify physical iPhone microphone/recognition, audible output, Cloudflare deployment or native releases.

Implementation, validation and publication status are recorded in [the delivery tracker](../project/implementation-history.md). Existing current designs remain reviewed visual references; these per-browser baselines are reproducible test artifacts rather than a second competing design catalog.

## Initial collection status

The managed workspace can run system Chromium for state-harness debugging, but cannot download the pinned rendering image: its blob download redirects to `westcentralus.data.mcr.microsoft.com`, outside the active allowlist. An additive environment-network draft is saved but has not been published. System-browser captures are temporary and cannot become canonical baselines.

The temporary **Collect initial visual candidates** workflow renders the 106 candidates in the pinned GitHub container, requires an unchanged exact rerun, and publishes only `visual-candidates/` for inspection. No candidate is an accepted baseline. After review against the linked requirements/designs, promote the images to the browser baseline folders, record their fingerprint manifest and remove the collection workflow/configuration and candidate folder. The permanent comparison workflow must reject missing baselines and may never regenerate them.

## Running and reviewing checks

Install locked dependencies and build the production app, then use the pinned Linux/amd64 image:

```bash
npm ci
npm run build
npm run visual:review
npm run test:visual:docker
```

On an environment already running that exact image, `npm run test:visual` runs both browser projects. The system browser is useful for debugging assertions but is not interchangeable with the pinned renderer. Each test restores the synthetic backup through the real Import UI, asserts its destination/controls, freezes the clock/random timing, and awaits visible fonts/images. Reduced motion selects the existing SVG alternatives; only their CSS/SMIL animation clocks are frozen at frame zero. Visible illustrations are eagerly loaded for full-content capture. No controls or text are masked.

Every registered state gets a 390 px capture; eleven critical states also run at 320 px. Screens extend viewport height to show all content with fixed navigation at the bottom. Safety confirmation retains the 390/320 × 844 px viewport. Each state has its own browser context/IndexedDB, so production storage is never accessed. Test-only generated PCM reaches the real detector through the mocked Web Audio boundary; it verifies UI state, not physical microphone accuracy.

In GitHub, open **Actions → Test and build → the commit's run → Artifacts → screenshot-checks**. Download and extract the ZIP. `playwright-report/index.html` contains the normal comparisons; `test-results/` contains named PNGs, JSON, retained traces and a source/build/environment manifest. A mismatch includes expected, actual and difference images. `playwright-probe-report/` and `test-results-probe/` show the separately labelled deliberate magenta-button defect. The probe succeeds only if both browsers reject that defect and provide all three image attachments; it never edits app source or expected files. Reports upload even after failed comparisons and remain available for 14 days.

For full report navigation, serve the extracted folder with `npx playwright show-report playwright-report`. Tests have no retries; ordinary comparisons do not create missing expected images, and CI rejects snapshot-update arguments. `visual:review` rejects missing/unowned images or fingerprints changed without review.

## Intentional visible changes

Update the approved functional/layout specifications and current design evidence first. Generate only affected candidates in the pinned container, inspect every changed image in both browsers against that requirement and the prior reference, then record reviewed fingerprints:

```bash
npm run test:visual:docker -- --grep 'practice/' --update-snapshots=all
npm run visual:review -- --write
npm run test:visual:docker
```

Commit the reviewed PNGs and manifest with the intentional change. `--write` records evidence hashes; it does not perform or replace visual review. New states come from the screen registry; add their state preparation/assertions to `visual-tests/screens.spec.js`. Do not loosen the zero-pixel threshold to hide unexplained differences. Changing Playwright/image/locale/scale requires review of both complete reference sets. Application screen evidence/source fingerprints and architecture still follow [their maintenance procedure](../architecture/README.md).

Initial delivery status: the harness, commands and report workflow are prepared; pinned candidate review/promotion and final CI acceptance remain in progress. The CHG-022 early-review state extends the set to 106 screenshots; twelve additional browser checks verify microphone startup/cancellation/timeouts/early outcomes and zero-delay progression, plus native History filtering at 320 px.
