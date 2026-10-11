## CHG-016 — Practice STOP, microphone input and recognition corrections — 2026-10-11

- Replaced persistent GO with functional STOP during practice; the real input-level indicator sits below STOP. Stopping releases capture and saves partial results. Countdown, pause/resume/next and external-cue timing retain their behavior.
- Added brief-peak visibility and recognized/heard-but-unmatched feedback; inactive input is cleared. No raw audio is stored.
- Corrected gain, early recording position, short-frame alignment, room-background and quiet-click compatibility without rewriting stored profiles; distance and negative-evidence rejection remain.
- Published revised dark/light Run captures and revision-1.3 requirements. Final Node 22 checks: 227 Jest/17 suites, 16 smoke, build/asset verification; seven browser suites/35 checks pass. Cache v14 preserves schema-3 data; physical iPhone/Cloudflare evidence remains separate in the delivery tracker.

## CI test synchronization fix — 2026-10-11

- Reproduced the reported audio lifecycle failure under Node 22. Replaced fixed microtask waits with explicit permission/worklet mock request signals in three tests, preserving their snapshot/abort/cleanup assertions. Complete Node 22 dependency/smoke/222-Jest/build/asset validation passes; application code and generated assets remain unchanged.

## Unreleased — trigger-first practice and six modes

- Implemented CHG-015 under the user's explicit automatic-work instruction: optional non-trigger sounds and mode/sequence-specific readiness, one-class distance rejection, reset/noise/cue evidence and saved per-gun optional recognition controls.
- Added one shared engine/controller for Single, Repeated, Par-time, Trigger control (interval consistency), Reload endpoints and timed Free practice. New practice defaults to random 2–5 seconds/beep On; legacy sequence defaults remain unchanged. Calibrated external cue starts acoustic timing without adding a shot.
- Saved per-gun mode configuration, hit/miss/partial outcomes and captured-onset timing; pause excludes paused intervals, refresh reopens durable interrupted review, storage failure retains accessible Not Saved/Retry. Fixed rapid double-Next cancellation and cue-gate frame alignment.
- Reused schema 3/feature version 2; export format 4 accepts compatible formats 1–3 and preserves old sessions. Full sound reset atomically clears only the selected gun's positive/rejection/cue features while preserving results. Cache v13; package remains 0.8.0.
- 222 Jest/17 suites, 16 smoke checks, production build/asset verification and nine browser suites (40 checks) pass. Actual UI captures and [validation](PRACTICE_VALIDATION.md) are retained. GitHub publication is tracked in [implementation history](../implementation-history.md); Cloudflare and physical iPhone accuracy/output remain separately unverified.

## Unreleased — timed sessions and working browser settings

- Integrated approved CHG-014 Configure/Run/Review, per-gun repetition/fixed/random configuration, microphone-before-countdown, visual GO, complete/left progress and optional guarded start beep.
- Added pause/release/resume with a fresh countdown, accurate interruption/reload review and durable owned session/repetition snapshots. Preset edits, sound/history reset and recent-recognition retention do not rewrite/delete sessions.
- Added per-gun next-capture Noise Filter/Auto Gain with supported/unconfirmed reporting, device-wide Dark/Light/System appearance and optional supported GO/completion vibration. Defaults preserve audio processing Off, Dark theme and vibration/beep Off.
- Schema 3 adds separate owned sessions; backup format 3 includes sessions/preferences and restores compatible versions 1/2 atomically with explicit session replacement disclosure. The service-worker cache is v12; package remains 0.8.0.
- Passed 16 smoke checks, 186 Jest tests across 13 suites, build/`verify:dist` and six final browser suites with zero page errors. Coverage includes actual segmentation/classification with synthetic PCM, interruption/storage-failure races, immutable review snapshots, schema-2-to-3/cache-v11-to-v12 migration, version-1/2/3 backups and capability fallbacks. Five ownership regressions failed before the fix and now pass, protecting delayed writes when a library restore removes the original owning gun. Published to GitHub `main` in [`6119b8f`](https://github.com/matosaru/dryfire/commit/6119b8f); production deployment remains unverified.
- Actual local captures: [Configure](../session-implementation-configure.png), [Run](../session-implementation-run.png), [Review](../session-implementation-review.png), [Dark settings](../settings-implementation-dark.png), [Light settings](../settings-implementation-light.png). No physical-device/Cloudflare deployment success is claimed.

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
