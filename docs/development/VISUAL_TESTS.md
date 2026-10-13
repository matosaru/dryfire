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

On an environment already running that exact image, `npm run test:visual` runs both browser projects. The system browser is useful for debugging assertions but is not interchangeable with the pinned renderer. Each test restores the synthetic backup through the real Import UI, asserts its destination/controls and complete asynchronous gun/preset lists, freezes the clock/random timing, and awaits visible fonts/images before measuring full-content height. Reduced motion selects the existing SVG alternatives; only their CSS/SMIL animation clocks are frozen at frame zero. The motion-freezing route serves only the four exact SVG paths read from the built `dist/motions/` artifact; missing files or unknown requested names fail. It avoids an extra intercepted local HTTP fetch that can abort in WebKit. Visible illustrations are eagerly loaded for full-content capture. No controls or text are masked.

Every registered state gets a 390 px capture; fifteen critical states also run at 320 px. Screens extend viewport height to show all content; practice navigation remains fixed at the bottom where that screen provides it. Safety confirmation retains the 390/320 × 844 px viewport. Each state has its own browser context/IndexedDB, so production storage is never accessed. Test-only generated PCM reaches the real detector through the mocked Web Audio boundary; it verifies UI state, not physical microphone accuracy.

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

[CHG-027 CI 38169517520](https://github.com/matosaru/dryfire/actions/runs/38169517520), source `9ecadea`, passes all 130 checks and the visible-defect probe using the reviewed references. The temporary collector is removed; ordinary CI compares without baseline updates. Feature publication is complete; PR promotion and deployment are separate from this successful check.

CHG-028 moves the About entry to the shared footer, independently of Settings. [Collection 38210186073](https://github.com/matosaru/dryfire/actions/runs/38210186073) passes all 130 checks twice; all 114 candidate references are reviewed, and 44 current captures are refreshed. [Review evidence](../design/baselines/footer-entry-validation.json) and [build/source manifest](../design/baselines/footer-entry-build-manifest.json) retain provenance. Coverage, renderer, thresholds and ordinary comparison policy are unchanged; the temporary collector is removed after review.

CHG-029 adds separate Contact Dark/Light states at both widths and refreshes the centered muted footer across all screens. Current target: **122 screenshots plus sixteen browser interactions (138 total)**. About/Contact navigation checks cover first-gun access, both Back/Forward paths, no microphone/safety side effects and unchanged exported data/appearance. The pinned renderer, comparison threshold, zero allowed differing pixels, no-mask/no-retry policy and visible-defect probe stay unchanged. Current reviewed image and publication evidence is recorded in the [delivery tracker](../project/implementation-history.md).

[CHG-029 collection 38218503434](https://github.com/matosaru/dryfire/actions/runs/38218503434), source `0861d0e`, passes all **138 checks** during generation and again during unchanged comparison. All 122 images are reviewed and accepted; [review evidence](../design/baselines/separate-pages-validation.json) and the current manifest retain provenance. The temporary collector/candidate folder are removed. Normal CI compares reviewed references; final publication/CI and PR/deployment status are recorded in the delivery tracker.

[CHG-029 final CI 38219646536](https://github.com/matosaru/dryfire/actions/runs/38219646536), source `b05d2dc`, passes all 138 checks and the visible-defect probe. Reviewed references are published on `feature/about-contact-page`; downloadable reports contain expected/actual/diff images for the labelled deliberate probe. PR promotion and production deployment remain separate, access-blocked steps in the delivery tracker.

CHG-030 updates Dark primary text to `#FFFFFF` across inherited headings/content and explicit neutral labels/values. Coverage stays **122 browser images plus sixteen functional checks (138 total)**: 100 Dark and 22 Light image cases. Review Dark candidates against the shared typography/SET-07 requirement; retain existing Light PNGs and compare them in final normal CI. The renderer, thresholds, no-mask/no-retry rules and deliberate visible-defect probe stay unchanged. Current review and publication status is in the delivery tracker.

[CHG-030 collection 38221777800](https://github.com/matosaru/dryfire/actions/runs/38221777800), source `26dbb0f`, passes all 138 checks during generation and again during unchanged comparison. All 100 Dark reference images are reviewed/promoted; 22 Light references retain their prior hashes. [Color/capture review](../design/baselines/white-primary-validation.json) records the scope and preserved bytes. Temporary candidate/config/workflow files are removed. Final normal CI/publication and PR/deployment status are recorded in the delivery tracker.

[CHG-030 final CI 38223040449](https://github.com/matosaru/dryfire/actions/runs/38223040449), source `5e24651`, passes all 138 checks against the reviewed Dark and original Light references, plus the visible-defect probe. Source/build/docs/deploy dry runs also pass. Screenshots and source are published on the feature branch; PR promotion and production deployment remain separate in the delivery tracker.

CHG-031 makes About/Contact footer controls white in Dark while retaining the muted disclosure, original Light images and all geometry/controls. Coverage stays 100 Dark + 22 Light screenshot cases and sixteen functional checks (138 total). Review the affected footer regions under ABOUT-05 / CONTACT-04 and retain the original Light references for final normal CI. Pinned renderer/threshold, no masks/retries/auto-acceptance and the visible-defect probe remain unchanged; delivery evidence is tracked separately.

[CHG-031 collection 38243977755](https://github.com/matosaru/dryfire/actions/runs/38243977755), source `60b14cc`, passes all 138 checks twice. The 100 Dark footer references are reviewed/promoted; all 22 existing Light references retain their hashes. [Review evidence](../design/baselines/bright-footer-validation.json) records dimensions/colors and immutable build provenance. The temporary collector/candidates are removed; final CI/publication and PR/deployment status are recorded separately in the delivery tracker.

[CHG-031 final CI 38245431812](https://github.com/matosaru/dryfire/actions/runs/38245431812), source `7f3a755`, passes all 138 checks against the reviewed Dark and original Light references, plus the visible-defect probe. Source/docs/build/minification and both deploy dry runs also pass. Earlier source-only [run 38243977722](https://github.com/matosaru/dryfire/actions/runs/38243977722) has 96 comparison failures against the prior Dark footer references and a separate documentation-audit failure; those are superseded by the reviewed delivery, not hidden or converted to passes. Reports and the minified application are downloadable from the successful run. PR promotion/deployment remain separate in the delivery tracker.

CHG-032/033: compare both build editions in independent matrix jobs. Current target is **148 public checks + 160 private-preview checks**, including 250 screenshot comparisons and 58 functional browser checks. Baseline paths include the edition; registry edition-only states do not run against the wrong artifact. About/Contact retain the bottom tabs. Preview charts/new creation and public legacy preservation/direct-submit guards are separately exercised. Both jobs run the deliberate visible-defect probe and publish edition-labelled reports. Image review/publication status is in the delivery tracker.

CHG-035 private tests use an explicit Full fixture preference for ordinary preview captures and separate Free/Full Settings states. Dedicated clean-context tests check the CHG-038 Full default, explicit Free selection, refresh persistence, full-to-free data preservation, existing-preset editing and forced changes during confirmation/pending microphone permission. Public builds reject browser overrides and omit the test control/module. Private cache-retirement/online refresh replaces its old offline-shell check; public real-offline coverage remains.

CHG-037 target: 266 screenshot comparisons (128 public + 138 preview) plus 82 functional browser checks, **348 total** (168 public / 180 preview). Twelve additional viewport/theme layout checks per edition exercise all pages at 320/390/1024 px; expanded Settings installation-help states are captured in both themes/widths. Pinned candidate generation, unchanged comparison and engineering image review must precede baseline acceptance.
