# Screenshot regression tests

CHG-021 · revision 1.1 · directly authorized on 2026-10-11 by the user's instruction to proceed with repeatable Chromium/WebKit screenshot checks in CI and downloadable difference images.

## Acceptance criteria

- Test the built `dist/` application in isolated browser contexts using a committed synthetic format-4 backup and deterministic clock/randomness/audio capabilities. Do not read or reset production data, expose test hooks in production, or replace app-rendered controls with static test markup.
- Cover all 44 current screen states in the [screen registry](../architecture/screen-map.json), including six practice configurations, running/countdown/paused/review states, shared safety confirmation, themes, deletion/reset outcomes and CHG-027 About/email contact. Include explicit 320 px layout checks alongside the normal mobile viewport.
- Use separately reviewed Chromium and WebKit PNG baselines, identified by screen/state/viewport, in [design baselines](../design/baselines/README.md). Pin the browser package, Linux rendering image and dependency lockfile so local baseline generation and CI use the same environment.
- Compare stable screenshots with `maxDiffPixels: 0` and a tightly bounded perceptual color threshold of `0.005` for measured one-channel gradient/shadow rounding between CI hosts; no pixels above that threshold may differ. Stabilize clocks, synthetic audio, GIFs, focus/caret and fonts; do not mask controls or automatically accept baseline changes in CI.
- Assert the intended state and absence of horizontal overflow/page errors before capture. Missing state coverage or missing expected images must fail, not silently establish a new baseline.
- A visible CSS change must fail comparison and produce expected, actual and diff PNGs in a downloadable HTML report. Upload reports/results even when the test command fails; preserve the failure exit status.
- Prove repeatability with an unchanged rerun and deliberately demonstrate the failure/report path without committing the injected defect. Then run the full existing test/build/documentation workflow before publication to the authorized branch.
- Document commands, baseline review/update policy, test environment and limits. Browser pixels do not verify physical iPhone microphone/recognition, audible output, Cloudflare deployment or native releases.

Implementation, validation and publication status are recorded in [the delivery tracker](../project/implementation-history.md). Existing current designs remain reviewed visual references; these per-browser baselines are reproducible test artifacts rather than a second competing design catalog.

## Accepted rendering evidence

[Dev collection run 38154941386](https://github.com/matosaru/dryfire/actions/runs/38154941386), source `4861613`, passes all **118 checks** during generation and again during an unchanged exact comparison. All 106 browser PNGs have been visually reviewed against the linked screen requirements/current captures. The [initial validation record](../design/baselines/initial-validation.json) and [build/environment manifest](../design/baselines/initial-build-manifest.json) retain that provenance. The temporary candidate workflow/configuration/folder are removed after promotion; CI now compares the reviewed references without regenerating them.

Independent CI hosts exposed isolated one-channel (1/255) color rounding on gradients/shadows despite identical pinned software and layouts. Software-rendering overrides passed ten same-host dialog captures and 59 full Chromium checks twice, but an independent runner still failed eight single-pixel comparisons. [Rendering evidence](../design/baselines/rendering-validation.json) preserves both outcomes and the reviewed nine-image crop/delta analysis. The overrides and experimental shadow reference are removed. Revision 1.1 uses Playwright's perceptual threshold **0.005** (well below its default 0.2), with **zero pixels allowed above it**. This measures layout/content and visible colors while tolerating documented rounding; it does not claim byte-identical rendering on different CPUs. No masks, retries or automatic expected-image updates are introduced. [CI 38161894476](https://github.com/matosaru/dryfire/actions/runs/38161894476), source `bfda2b7`, passes all 118 checks and the deliberately visible defect probe; both browsers provide expected/actual/diff PNGs in the uploaded `screenshot-checks` artifact. [Independent unchanged rerun 38162033363](https://github.com/matosaru/dryfire/actions/runs/38162033363), source `5d86aee`, passes the same 118 checks/probe after main/dev synchronization.

The managed workspace can use system Chromium for debugging, but its active network policy blocks the pinned image blob redirect to `westcentralus.data.mcr.microsoft.com`. An additive network/setup draft is saved for environment review/save/publish; it is not active merely because it was saved. Pinned rendering was therefore performed in GitHub’s fixed container. System-browser captures are not substituted as canonical baselines.

## Running and reviewing checks

Install locked dependencies and build the production app, then use the pinned Linux/amd64 image:

```bash
npm ci
npm run build
npm run visual:review
npm run test:visual:docker
```

On an environment already running that exact image, `npm run test:visual` runs both browser projects. The system browser is useful for debugging assertions but is not interchangeable with the pinned renderer. Each test restores the synthetic backup through the real Import UI, asserts its destination/controls and complete asynchronous gun/preset lists, freezes the clock/random timing, and awaits visible fonts/images before measuring full-content height. Reduced motion selects the existing SVG alternatives; only their CSS/SMIL animation clocks are frozen at frame zero. Visible illustrations are eagerly loaded for full-content capture. No controls or text are masked.

Every registered state gets a 390 px capture; thirteen critical states also run at 320 px. Screens extend viewport height to show all content; practice navigation remains fixed at the bottom where that screen provides it. Safety confirmation retains the 390/320 × 844 px viewport. Each state has its own browser context/IndexedDB, so production storage is never accessed. Test-only generated PCM reaches the real detector through the mocked Web Audio boundary; it verifies UI state, not physical microphone accuracy.

In GitHub, open **Actions → Test and build → the commit's run → Artifacts → screenshot-checks**. Download and extract the ZIP. `playwright-report/index.html` contains the normal comparisons; `test-results/` contains named PNGs, JSON, retained traces and a source/build/environment manifest. A mismatch includes expected, actual and difference images. `playwright-probe-report/` and `test-results-probe/` show the separately labelled deliberate magenta-button defect. The probe succeeds only if both browsers reject that defect and provide all three image attachments; it never edits app source or expected files. Reports upload even after failed comparisons and remain available for 14 days.

For full report navigation, serve the extracted folder with `npx playwright show-report playwright-report`. Tests have no retries; ordinary comparisons do not create missing expected images, and CI rejects snapshot-update arguments. `visual:review` rejects missing/unowned images or fingerprints changed without review.

## Intentional visible changes

Update the approved functional/layout specifications and current design evidence first. Generate only affected candidates in the pinned container, inspect every changed image in both browsers against that requirement and the prior reference, then record reviewed fingerprints:

```bash
npm run test:visual:docker -- --grep 'practice/' --update-snapshots=all
npm run visual:review -- --write
npm run test:visual:docker
```

Commit the reviewed PNGs and manifest with the intentional change. `--write` records evidence hashes; it does not perform or replace visual review. New states come from the screen registry; add their state preparation/assertions to `visual-tests/screens.spec.js`. Do not increase the recorded color threshold or pixel allowance to hide unexplained differences. Changing Playwright/image/locale/scale requires review of both complete reference sets. Application screen evidence/source fingerprints and architecture still follow [their maintenance procedure](../architecture/README.md).

Delivery status: the permanent comparison/artifact/probe workflow is implemented on `dev` and passes [CI 38161894476](https://github.com/matosaru/dryfire/actions/runs/38161894476). The [acceptance record](../design/baselines/ci-validation.json) and delivery tracker preserve the observed result. There are **106 screenshots plus twelve browser checks**: ten for microphone readiness, cancellation, missing-input timeout, saved early outcomes and zero-delay progression, and two for native History filtering at 320 px.

CHG-027 expands current coverage to **114 screenshots plus sixteen browser checks (130 total)**: the new About Dark/Light states at both widths add eight browser images and four navigation/no-capture/data-preservation checks. Five existing Settings images per browser change with its About entry. Initial collection is temporary and writes only `visual-candidates/`, never accepted baselines; images must be reviewed and the collector removed before release. Current collection/acceptance/CI status is in the [delivery tracker](../project/implementation-history.md).
