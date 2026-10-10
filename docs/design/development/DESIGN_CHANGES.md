# Reference design update

Implemented the supplied mobile design and change checklist:

- Angular orange/white DF logo and matching 180, 192 and 512 px app icons.
- Compact Home header with a Settings shortcut; centered page titles with back controls.
- Persistent bottom navigation: Home, Learn, Drills, Live Listen and History.
- Dashboard cards with colored vector icons and the reference's introductory copy.
- Four illustrated, looping GIF sound previews with distinct waveform colors and reduced-motion SVG fallbacks.
- Compact Learn cards with Train and independent Reset controls.
- Built-in drill cards with label-colored ordered sequence chips and Start Drill controls. Selecting a drill opens its existing recognition screen; microphone startup remains explicit and safety-gated.
- Grouped Settings for full reset, export/import and About; collapsible installation instructions.
- Safety acknowledgement remains available on every screen and expands when an unacknowledged recording is attempted.
- Updated service-worker cache to refresh the new UI and preload GIFs for offline use.

Existing compatible sound profiles, recognition history, feature formats and IndexedDB schema are unchanged. Individual resets preserve unrelated profiles and history; full reset preserves history. Both retain confirmation prompts.

Custom drills are marked as upcoming. The reference's additional Noise Filter, Auto Gain, Appearance and Vibration Feedback controls were not added; this update follows the supplied change checklist and preserves existing audio processing.

## Validation

Baseline: 16 smoke tests, 46 Jest tests, production build and asset verification passed.
After update: 16 smoke tests, 48 Jest tests, production build and asset verification passed. Production output remains minified without source maps.

Chromium checks passed for navigation, drill selection, safety gating, GIF/reduced-motion selection, cancellation and confirmation of both reset operations, preservation of other profiles/history, and viewport widths from 320 to 1280 px. Screenshots were inspected at 390 px. Real iPhone microphone and recognition accuracy still require device testing.

Main production bundles before/after (uncompressed): HTML 14.97 / 18.12 kB; CSS 17.09 / 23.89 kB; main JS 37.19 / 37.87 kB. New GIFs add approximately 260 kB of static assets.
