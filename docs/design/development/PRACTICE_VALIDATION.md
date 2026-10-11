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

Cloudflare app and GitHub API requests remain blocked at the workspace network gateway. Public GitHub Actions HTML is now accessible and confirms [GitHub Actions run 38130523348](https://github.com/matosaru/dryfire/actions/runs/38130523348) completed successfully for the Node 22 test fix. Implementation [`8b8aec9`](https://github.com/matosaru/dryfire/commit/8b8aec9) was pushed successfully to `main`; the remote head returned `8b8aec987bacc6be3f9cb76f883d8432ecabdbfb`. A post-push GitHub Actions query was Forbidden and the app CONNECT tunnel returned gateway HTTP 403; neither establishes an external check or deployment failure. See [implementation history](../implementation-history.md) and [iPhone release checklist](IPHONE_RELEASE_CHECKS.md). No successful Cloudflare deployment, physical microphone accuracy, audible output, physical vibration or signed native release is established by these tests.

## CI failure follow-up — 2026-10-11

The user supplied [GitHub job 114441525944](https://github.com/matosaru/dryfire/actions/runs/38129781080/job/114441525944) and its failing log. Before the fix, the full suite reproduced the same failure under Node **22.23.3**: 221 passed / 1 failed, `resolvePermission is not a function` in the first audio lifecycle test. The unchanged test passed under local Node 24.19.0. The fixed-count microtask loop could finish before the asynchronous event-detector import reached the permission mock.

Three lifecycle tests now await explicit signals from the mocked permission/worklet calls before releasing them or aborting. Original preference snapshot, cancellation and cleanup assertions remain intact. No application code, saved-data behavior or requirements changed. After the fix, the complete CI command sequence passes with Node 22.23.3: dependency installation, 16 smoke checks, 222 Jest tests / 17 suites, production build and `verify:dist`. Build hashes/sizes remain unchanged. GitHub API access remains Forbidden; public GitHub HTML is accessible and confirms the reported job failed. Test fix [`be50b99`](https://github.com/matosaru/dryfire/commit/be50b99) was pushed to `main`; the observed remote hash was `be50b99f7c8534636924091f327602567222a88d`. Public Actions HTML reports [GitHub Actions run 38130523348](https://github.com/matosaru/dryfire/actions/runs/38130523348) **completed successfully**. The delivery tracker records this observed CI success separately from Cloudflare/device checks.

## CHG-016 — STOP, microphone feedback and missed-trigger regressions

Date: 2026-10-11. [Revision 1.3](../requirements/practice-modes.md) records the user's corrected STOP-above-meter instruction and automatic-work authorization. The [Dark](../practice-stop-microphone-dark.png)/[Light](../practice-stop-microphone-light.png) design captures and [layout](../practice-input-design.md) are published in [`9b24b7d`](https://github.com/matosaru/dryfire/commit/9b24b7d); push and matching remote main hash were observed. Source publication and physical-device acceptance remain separately tracked.

The post-CI-fix Node 22 baseline passed 222 Jest/17 suites, 16 smoke checks, build and asset verification before this correction. Regression fixtures then reproduced four missed-trigger conditions before their fixes: a Learn click near 80 ms, a ±20% volume change, a quiet Learn-accepted click filtered before classification, and room-background mismatch. A fifth regression reproduced a brief PCM spike being missed between 100 ms level reports. The old Run candidate also failed the browser check for a missing microphone indicator. These are reproduced compatibility/display faults; they do not establish which fault caused the user's device report.

Final source checks pass on Node **22.23.3**: **227 Jest tests / 17 suites**, **16 smoke checks**, production build and `verify:dist`. The original rejection assertions remain intact. Saved version-2 profiles are compared without data replacement, arbitrary recording position and gain are normalized, brief frame offsets and captured background are handled, and the live peak floor aligns with the accepted Learn peak. Distance rejection and calibrated-negative vetoes remain enabled. Meter reports retain genuine short peaks, then clear on stop/pause; no raw audio is stored.

Seven browser suites / **35 checks** pass with zero page errors:

| Suite | Checks | Observed evidence |
| --- | --- | --- |
| STOP/input design | 5 | Countdown to STOP, meter below STOP, real unmatched input without shots, recognized input, pause/release/fresh resume, stopped partial results, both themes at 320/390/768 px and retained results after refresh |
| Actual Learn-to-live | 2 | Three actual two-second Train captures with a click at 80 ms recognize a later approximately 20% louder streaming click without retraining; actual cue/reset calibration starts timing without counting cue/reset and counts the intended trigger |
| Six modes/cue/backup | 8 | Correct counts/results in all six modes, durable review and gun isolation; external cue starts without a shot; format-4 export restores the exact database |
| Legacy sequences | 5 | Preserved readiness/defaults/order, unknown/out-of-order handling, pause/resume, captured-input gate, durable splits, refresh recovery and gun isolation |
| Settings/legacy cues | 6 | Saved constraints/theme/preferences, confirmed and unsupported capability reports, beep/input exclusion and supported/absent/rejected vibration behavior |
| Database/cache | 2 | Schema-2-to-3 preservation and cache-v13-to-v14 activation/controlled reload without changing IndexedDB data |
| Capture/storage lifecycle | 7 | Late permission cleanup, overlapping interruption, quota failure/accessible Retry, durable settings and scoped resets without deleting histories |

The first combined mode run was interrupted by an HTTP response failure while the concurrent build temporarily replaced `dist/`. A complete rerun after the build finished passed; it is not reported as an app recognition failure. Calibration acceptance uses an acoustically distinct reset (900 Hz versus 2800 Hz trigger), since an amplitude-only difference is no longer sound identity. The separate near-identical reset/trigger unit regression remains conservatively unknown; it was not removed or relabelled as accurate discrimination.

| Artifact | CHG-015 raw/gzip kB | CHG-016 raw/gzip kB |
| --- | --- | --- |
| HTML | 38.26 / 9.11 | 39.41 / 9.40 |
| CSS | 49.90 / 10.90 | 51.14 / 11.12 |
| Main JavaScript | 122.67 / 36.27 | 124.68 / 37.01 |
| AudioWorklet | 0.71 / 0.36 | 0.71 / 0.36 |
| Service worker | 1.34 / 0.69 | 1.34 / 0.69 |
| Detector chunk | 1.83 / 0.98 | 1.83 / 0.98 |

Current candidate assets: `index-BbyURu6D.js`, `index-DCikZBm2.css`, cache **v14**. IndexedDB schema **3**, feature version **2**, backup format **4** and package **0.8.0** are unchanged. Old validation/asset records above remain historical. Synthetic success establishes functional regression coverage; physical iPhone click discrimination, audible cues and Cloudflare deployment remain unverified after the user's reported misses. See [release checks](IPHONE_RELEASE_CHECKS.md).
