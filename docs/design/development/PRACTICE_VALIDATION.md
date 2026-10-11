# CHG-015 implementation validation

Date: 2026-10-11. Scope: [authorized trigger-first plan](../requirements/practice-modes.md). Local evidence is separate from GitHub publication, Cloudflare deployment and physical iPhone results.

## Source/build evidence

Before source changes, dependency installation, **186 Jest / 13 suites**, **16 smoke checks**, production build and `verify:dist` passed. Regression fixtures preceded their corresponding recognition/engine/storage changes. Expected-failing full-reset, double-Next, portable-proof, unsaved-navigation and cue-gate checks were observed before the fixes.

Final **222 Jest tests / 17 suites** and **16 smoke checks**, production build, minified-asset verification and diff checks pass. Added coverage includes trigger-only/distant/negative recognition, six modes, captured-onset deadlines, pauses/cues, gun ownership, immutable results, atomic invalid import, full calibration reset and preservation of a genuine event's features across a cue gate. A final recording-to-live regression exposed different window lengths in Learn and streaming events. Recognition now compares the existing short-window signature and the matching padded 0.8-second Learn window, preserving all stored version-2 vectors. A plausible calibrated negative in either framing vetoes a shot. Distinct reset/noise evidence and near-identical conservative rejection have separate tests; the latter must not promise reliable discrimination of ambiguous sounds. No dependency or feature-vector version change was introduced.

Run from repository root:

```bash
npm test
npm run test:smoke
npm run build
npm run verify:dist
```

## Browser evidence

Fresh local Chromium contexts use synthetic PCM through the actual segmenter, feature extractor and classifier. Separate synthetic ScriptProcessor input exercises calibration capture. Fake permissions/capabilities/track reports test lifecycle and fallbacks. These are functional checks, not firearm/device accuracy measurements.

| Suite | Evidence |
| --- | --- |
| Six modes and external cue/backup | All six finish with correct hit/miss/shot/count/timing semantics; trigger-only or endpoint-only readiness, refreshed Review, gun isolation and actual format-4 download/atomic restoration |
| Rapid interactions/recovery | Double Next, denied initial permission, continuous Pause/Resume without cross-pause interval, refresh interruption with no automatic microphone |
| Capture/storage lifecycle | Delayed permission cancellation cleans late tracks; overlapping Pause/End saves one terminal partial; forced quota failure stops capture, retains accessible Not Saved/Retry, then stores the exact recognized result; per-mode preferences persist; selected-gun full reset preserves results/other guns |
| Learning/readiness | Legacy Trigger preset ready with trigger-only data; Reload explains missing endpoints; optional recognition choice persists without deleting positives; Train captures reset/noise/cue numeric features for the original gun and releases tracks |
| Legacy sequences | Defaults/bounds, pre-GO exclusion, unknown/out-of-order partials, ordered completion, Pause/Resume, refresh recovery, owned history/configuration and compatible export |
| Settings/legacy cue | Per-gun processing, track-confirmed/unconfirmed/unsupported reports, Dark/Light/System, vibration accepted/rejected/absent API, once-per-GO legacy beep and 300 ms captured-input exclusion |
| Database/cache | Actual schema-2-to-3 upgrade preserves IDs/values; cache-v12-to-v13 activation and controlled reload preserve IndexedDB |
| Actual Learn-to-live recognition | Three actual two-second Train captures produce a trigger model that recognizes the subsequent short streaming click without retraining; trained external cue starts with zero shots, distinct trained reset remains zero shots, then intended trigger counts once; capture tracks are released |
| Mobile/new cue/screens | All six Configure layouts, Learn/catalog, Run and Review fit 320/390/768 px; new beep invoked once per signal; pre-80 ms input excluded while a later trigger keeps its feature signature; Light mode usable |

Nine browser suites / 40 checks pass. Zero page errors were observed in the passing suites. Near-identical reset/positive fixtures can intentionally remain ambiguous: matching one synthetic training waveform is not a claim of reliable field discrimination. Larger independent labelled iPhone trials must record both false shots and missed true clicks.

Actual UI captures: [Learn](../practice-implementation-learn.png), [Modes](../practice-implementation-catalog.png), [Configure](../practice-implementation-configure.png), [Run](../practice-implementation-run.png), [Review](../practice-implementation-review.png), [Light](../practice-implementation-light.png). Counts/names/times are test values. Older approved mockups/captures remain preserved.

## Production output

| Artifact | Before raw/gzip kB | Final raw/gzip kB |
| --- | --- | --- |
| HTML | 31.43 / 8.06 | 38.26 / 9.11 |
| CSS | 48.54 / 10.65 | 49.90 / 10.90 |
| Main JavaScript | 88.70 / 27.76 | 122.67 / 36.27 |
| AudioWorklet | 0.71 / 0.36 | 0.71 / 0.36 |
| Service worker | 1.34 / 0.69 | 1.34 / 0.69 |
| Detector chunk | 1.83 / 0.98 | 1.83 / 0.98 |

Final assets: `index-Dzm7VxiF.js`, `index-Hc2oJHTM.css`, cache **v13**, IndexedDB schema **3**, feature version **2**, backup format **4**. Package stays **0.8.0**; use implementation commit/cache/UI to identify the update. One practice engine/controller and the existing capture/settings components serve all six modes. Only bundled/minified `dist/` deploys; no source maps/raw modules were included.

## Separate release evidence

Direct app/build-status requests remain blocked at the workspace network gateway. Git publication is recorded only after the push and remote head are observed. See [implementation history](../implementation-history.md) and [iPhone release checklist](IPHONE_RELEASE_CHECKS.md). No successful Cloudflare deployment, physical microphone accuracy, audible output, physical vibration or signed native release is established by these tests.
