# Keeping designs and implementation aligned

2026-10-11 · current coverage: 10 screens, shared safety dialog and 38 actual Chromium captures. Source-aware documentation checks are implemented; automated pixel regression is the next verification improvement, not an existing CI capability.

## What exists now

Each current screen has a Markdown layout, functional requirement links and actual images. The source-checked registry/tree names the real DOM states. `docs:check` fails for uncovered views/modes, missing captures/links, changed UI source fingerprints, stale generated architecture and byte-identical current images. The current production-build captures were manually reviewed against those controls, with synthetic gun/audio/history fixtures. This establishes traceable current evidence, not a universal pixel guarantee.

## Repeatable visual regression workflow

1. Build the exact candidate commit with the CI Node/runtime/dependency versions. Serve `dist/`, not an earlier live deployment. Record source commit and build hashes with the capture artifact.
2. Commit a synthetic fixture and capture harness. Restore it through the supported backup flow into a fresh browser context; no personal firearm/audio data belongs in test fixtures. Fix browser/OS version, viewport, pixel ratio, locale, time zone, clock and random timing. Wait for fonts/images/data readiness.
3. Cover the registry's stable configurations, dialogs and outcomes, including Dark/Light and the smallest supported width. Freeze state deliberately for countdown/running references. Use separately documented masks only for unavoidable changing values, never entire controls or layout areas that could hide a defect. Check microphone/countdown behavior in functional tests as well as pictures.
4. Compare with reviewed reference images using Playwright screenshot assertions. A differing image fails CI and uploads expected/actual/diff artifacts. In one identical environment, exact pixel matching can use zero differing pixels; adopt a small documented threshold only if rendering proves nondeterministic. Different browsers/devices need separate references rather than a shared tolerance that hides their differences.
5. Review any intentional visible change with its requirement/design update, then update only the affected baseline. Never automatically regenerate and accept all baseline images just because a test fails. Existing scope authorization can support a routine correction; changed product behavior follows the normal change process.
6. Capture Chromium and WebKit separately for the iPhone target. WebKit automation is useful but not identical to physical iOS Safari: verify permission prompts, safe-area spacing, native typography, start-beep/microphone behavior and Home Screen rendering on the actual iPhone.
7. After deployment, verify the served commit/assets/cache version against the validated build. An exact local screenshot does not establish that the same release is live.

## Maintainable scope and limits

Use the [screen registry](../architecture/screen-map.json) to drive coverage and the [current catalog](README.md) as visual review evidence. Store future per-browser test baselines under `docs/design/baselines/<browser>/<screen>/<state>.<theme>.png`, with source/environment metadata and a reproducible harness. Do not keep two competing current design catalogs. Older reviewed screenshots remain archived.

Pixel regression verifies appearance; semantic assertions verify enabled controls, ownership, saved data, resets and navigation. Both are needed. Browser screenshots cannot prove real microphone accuracy, physical vibration or store acceptance. See the [implementation plan](../project/implementation-history.md) for the explicit pending pixel-CI step and [device checklist](../development/IPHONE_RELEASE_CHECKS.md) for actual iPhone validation.
