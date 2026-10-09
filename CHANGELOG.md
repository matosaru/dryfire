# v0.7.0 — Built-in acoustic sequence drills

- Added four requested presets: trigger, rack→trigger, magazine change→trigger, draw→magazine change→trigger.
- Added drill selection, current-step display, automatic repeated-attempt counting, and clear mismatch/unknown feedback to Live Listen.
- Stored optional drill identification, sequence step and recognition outcome in local event history, backups, and restores.
- Added isolated sequence tests and updated HTML smoke tests.
- Retained readable development source and production minification.

# Changelog

## v0.6.0 — four actions, continuous multi-event detection, optimized deployment

- Added a dedicated **Rack slide** label; draw, trigger pull and magazine change stay separate.
- Kept the legacy `reload` ID for magazine change to preserve existing profiles and results; users who used it for slide-racking should retrain.
- Reworked the detector around fixed 10 ms frames and reduced quiet/recovery windows, so short separated sounds can be emitted repeatedly without ending the session.
- Added a persistent listening indicator, a scrolling session timeline, and a rejected-event counter. Clarified that the single-sound button is intentionally one-shot.
- Extended manual verification, confusion matrix, storage validation, backups and class readiness to four classes.
- Added Vite minification/source map configuration, a `verify:dist` check, and a GitHub Actions build/test workflow. `build:static` no longer copies readable sources.
- Added multi-event/chunk-size regression tests. Real-device accuracy remains unverified.

## v0.5.0

- iPhone Home Screen UI, portable local backups, install instructions.
