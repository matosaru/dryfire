## Unreleased — multi-gun profiles and custom presets

- Implemented the approved first-use gun name/type form, My Guns library with a five-profile limit, selected-gun switcher and consistent gun ownership on Home, Learn, Drills, Live Listen and History (CHG-012).
- Added independently owned learned models, recognition history, retention/selected-drill settings and editable saved custom sequences. Preserved the four existing sound identifiers and built-in drill order; stop recording/listening before switching guns.
- Upgraded the existing IndexedDB database to schema 2 transactionally. Legacy features/history keep IDs, timestamps and verification metadata in a profile requiring user-supplied details. Empty databases start with first-gun setup rather than a fabricated gun.
- Added validated version-2 whole-library export/restore and compatible version-1 import. Browser imports over 10 MB are rejected before parsing. Compatible current features are exported; outdated legacy vectors remain preserved in the database until confirmed reset.
- Updated the service-worker cache from v10 to v11. Passed 16 smoke checks, 100 Jest tests, production build and `verify:dist`, plus browser checks for legacy cache/database migration, gun isolation/reload, custom editor, whole-library backups, confirmed resets, retention and 320–768 px layout. Synthetic Chromium capture verified switch guards and stream cleanup. No package-version bump or Cloudflare/real-device success is claimed.
- Added the ongoing [implementation history and remaining plan](../implementation-history.md) requested by the user (CHG-013). Dedicated timed sessions/repetition summaries, extra browser settings, cloud recovery and the deferred free-plan cap remain separate work.

## Unreleased — display branding

- Updated the canonical display name to **Dry Fire With Ease** and added **WITH EASE** to the existing orange/white DF header lockup (CHG-011).
- Updated visible/accessibility branding, About text, installation metadata, Capacitor appName and backup download filename; retained stable data, backup-format, package and deployment identifiers.
- Updated the service-worker cache from v9 to v10. Local Chromium checks confirmed existing learned profiles, history and settings survive the update and reload; existing-format backups still import/export.
- Passed 16 smoke checks, 48 Jest tests, production build and `verify:dist`; verified the header at 320–1280 px. [Actual header](../brand-lockup.png) and [Home screenshot](../branding-preview.png) show the implemented UI. Cloudflare deployment and real-device installation are not verified.
- Earlier reviewed mockups and release records retain their historical wording.

## 0.8.0
- Redesigned compact iPhone header with stylized DF logo and new app icons.
- Navigation split into Learn, Drills, and Live Listen; Settings moved to header gear.
- Added four lightweight looping abstract waveform previews and static reduced-motion images.
- Added one-sound reset and retained full learned-model reset and separate history clearing.
- Added Jest persistence tests and static app/asset smoke checks.
- Added Cloudflare Workers static deployment `wrangler.jsonc` and clarified deployment steps.
- Bumped service worker cache version so existing installations fetch updated assets.

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
