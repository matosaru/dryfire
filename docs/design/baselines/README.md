# Browser screenshot baselines

CHG-021 uses the current [screen catalog](../README.md) and [registry](../../architecture/screen-map.json) as its coverage source. These are reproducible test references, not additional product proposals. Production artwork and the existing reviewed design catalog retain their authoritative locations.

Files follow `<browser>/<screen>/<state>.<theme>.<width>.png`, for example `chromium/practice/active.dark.390.png`. Chromium and WebKit have independent references. Full-content captures extend viewport height so fixed navigation appears at the bottom; the safety modal keeps the fixed 844 px mobile viewport. Every registered state is captured at 390 px; selected critical states also use 320 px. Reduced motion selects the app's existing static illustrations.

The browser package/container, locale/timezone, fixed clock, device scale and comparison policy are pinned in [environment.json](../../../visual-tests/environment.json). Synthetic feature-only gun/history data lives in [library.json](../../../visual-tests/fixtures/library.json). Acceptance and maintenance instructions are in [VISUAL_TESTS.md](../../development/VISUAL_TESTS.md).

New or changed baseline images require review of the corresponding requirements, design and app-rendered controls. Normal tests and CI must never automatically update expected PNGs. Updating the renderer requires regenerating and reviewing both browser sets in the new pinned environment. Current reviewed screenshots remain preserved; do not copy them over browser baselines generated with different fixtures/renderers.

## Initial reviewed set

106 PNGs (53 states/widths per browser) were reviewed on 2026-10-11 against the screen specifications and current implementation captures. [Collection run 38154941386](https://github.com/matosaru/dryfire/actions/runs/38154941386) on `dev` passed generation and an unchanged **118-check** rerun. [Initial validation](initial-validation.json) and [source/build metadata](initial-build-manifest.json) preserve that evidence. [manifest.json](manifest.json) records every accepted image’s dimensions and SHA-256; `visual:review` requires exact coverage and matching fingerprints. This records engineering review under the user’s screenshot-CI authorization, not a new product proposal or physical-device result.
