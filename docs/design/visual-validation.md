# Keeping designs and implementation aligned

2026-10-11 · current coverage: ten screens, one shared safety dialog and 42 reviewed app captures. CHG-021 adds 106 separate Chromium/WebKit baseline images and twelve browser interaction checks. Pinned rendering and an unchanged 118-check rerun passed; all 106 baselines are reviewed and fingerprinted. Permanent comparison/probe CI passes on `dev` in [run 38161894476](https://github.com/matosaru/dryfire/actions/runs/38161894476); evidence and remaining deployment/device work are recorded in the [delivery tracker](../project/implementation-history.md).

## Current traceable evidence

Each screen has one Markdown layout, functional requirement links and actual implementation images. The source-checked registry/tree names the real DOM states. `docs:check` fails for uncovered views/modes, missing captures/links, changed UI source fingerprints, stale generated architecture and byte-identical current captures. Manual review checks controls against requirements; source hashes alone cannot establish correct appearance.

## Repeatable browser comparison

The [visual-test guide](../development/VISUAL_TESTS.md) defines the renderer, commands and review process. The harness restores a committed synthetic backup through the real app UI into isolated browser storage. Browser/OS image, dependency lockfile, viewport, scale, locale, time zone, clock, randomness and generated audio are fixed. It waits for fonts/images and uses the app’s reduced-motion illustration fallback. No controls or text are masked.

Every registered state is captured at 390 px; eleven critical layouts also run at 320 px. Each capture asserts its real state, absence of page errors and no page-wide horizontal overflow. Chromium and WebKit have separate references under `baselines/<browser>/<screen>/<state>.<theme>.<width>.png`. Full-content screenshots extend height; the modal retains the 844 px viewport. These are test references for the current design catalog, not competing product proposals.

Comparisons allow **zero pixels above a 0.005 perceptual color distance**, tolerating measured one-channel gradient/shadow rounding between CI hosts. They have no retries and cannot create missing expected PNGs. `visual:review` checks complete coverage and reviewed fingerprints. Intentional visible changes require the associated requirement/design revision, human-readable visual review in both browsers and an explicit fingerprint update. Do not increase the documented color threshold or pixel allowance, or auto-accept a failing image. Renderer changes require full review of both sets.

CI uploads an HTML report, expected/actual/diff PNGs, failure traces and source/build/environment metadata. A separate magenta-button probe proves both browsers reject a visible defect and provide all three comparison images; the injected style lives only in that test. Reports upload even on failure. [Artifact navigation and update commands](../development/VISUAL_TESTS.md#running-and-reviewing-checks) are maintained with the harness.

## Deployment and device limits

CHG-024 routes new changes through `dev` before an explicitly requested `main` promotion. Pixel checks apply to the exact built commit, not whatever is currently hosted. Verify the Cloudflare production build commit/assets/cache separately after promotion.

Automated WebKit is useful for the iPhone target but differs from physical iOS Safari. Device testing still covers permission prompts, safe areas, typography, Home Screen behavior, real microphone recognition and speaker loudness. Browser pixels and synthetic PCM do not verify technique, firearm state, vibration support or store acceptance. Use the [device checklist](../development/IPHONE_RELEASE_CHECKS.md) and keep deployment/device evidence separate from CI.

CHG-041: [reviewed Beta captures](baselines/beta-disclosure-review.json) cover all 266 references and 56 current screenshots. Every non-About image retains exact pixels below the shared header; About adds its requested Beta/version and feedback card. Pinned generation and unchanged comparison each pass 168 public / 180 preview checks. Captures explicitly activate/focus their page before taking screenshots so native WebKit accents do not depend on background-page state. Renderer, thresholds, masks and zero-retry policy are unchanged.

## Guide examples and GIFs — CHG-045

The live Practice/Sequence pages and help examples compile the same run/review fragments and use `sessionPresentation.js`. Template tests require identical source fragments with unique namespaced IDs; browser checks cover actual counters/STOP/input/results and safe playback/navigation. Current GIFs are exports from that rendered component, not a second drawing. Their manifest records relevant template/style/engine/export sources and encoded media hashes. `docs:check` fails if these change without regeneration. Review the [current animation exports](screens/practice-guide/examples/README.md) and PNG differences together, then record reviewed fingerprints. Previous proposal animations are explicitly historical.
