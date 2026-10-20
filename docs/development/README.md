# Dry Fire With Ease — trigger-first practice and optional sound learning

Repository workflow: [b/main Free, dev Full, PR protection and test-gated builds](../project/branching-strategy.md).

CHG-046: [React refactor plan](../project/react-refactor-plan.md) maps all 13 existing screens, component/CSS/test ownership and regression gates. CHG-047 starts implementation: workspaces, typed About/Contact and shared heading/card packages are introduced first. The [migration architecture](../architecture/react-migration.md) and [component map](../architecture/component-map.json) distinguish current and remaining owners; the requested DEV.to article comparison still awaits access.

Current forward work: [web commercial roadmap](../project/web-commercial-plan.md) and [initial security/performance review](security-performance-review.md). CHG-026 defers native releases and prioritizes Contact/SEO, a simple Free/Pro offer and secure cloud recovery/billing with dev/production verification.

[Public-Free/private-full-preview testing](free-preview-testing.md) documents the authorized two-gun public build and retained full preview. Hosted preview protection and a proposed authenticated in-app tester switch remain unimplemented; broader billing/accounts/cloud work is still paused.

Product planning: [Requirements and approvals](../requirements/README.md) · [Design catalog](../design/README.md). Read these before changing product behavior.

The approved display brand is **Dry Fire With Ease**. **Sound Trainer** remains a descriptive subtitle. The existing technical `dryfire` identifiers stay unchanged to preserve local data and deployment compatibility; see [branding requirements](../requirements/branding.md).

See [implementation history and remaining plan](../project/implementation-history.md) for code, validation, publication and deployment status. The package version remains **0.8.0**; the current update adds trigger-first readiness, rejection calibration and six practice modes alongside gun profiles, timed sequences and browser settings. The implementation commit/cache identify this update. GitHub publication, production deployment and physical-device verification are tracked separately.

The next verification target is iPhone Safari/Home Screen. Use the [release checklist](IPHONE_RELEASE_CHECKS.md) to record production deployment and actual device results without repeating or relabeling completed synthetic acceptance.

## Gun profiles and saved custom drills

- First use asks for a gun name and one of **Handguns**, **Rifles and Carbines**, or **Shotguns**. The public edition allows creating two profiles; full preview allows five. Existing larger libraries remain usable. Use **My Guns** to switch the selected gun.
- Learned examples, recognition history, custom sequences and selected drill are owned by a gun. Sound/history resets affect only that gun. Stop recording/listening before switching so in-flight data keeps its original owner.
- On **Drills**, full preview can create a saved custom preset; both editions can edit an existing preset with a name and ordered known actions; repeated actions are supported. **Start Drill** opens its explicit, safety-gated session configuration. Built-in sequences remain unchanged.
- IndexedDB schema 3 retains `dryfire-sound-trainer` and adds durable saved sessions alongside gun-owned data. Existing legacy sounds/history are assigned to one profile requiring the user's name/type; an empty legacy database starts with no fabricated profile. Selection and owned data persist after compatible same-origin reloads/deployments.
- Export creates a version-4 whole-library backup including legacy/practice sessions, calibration and preferences. Compatible versions 1–3 remain readable; version-1 data restores into a profile requiring details and older backups contain no saved sessions. Imports validate before atomic replacement, disclose replacing sessions and reject files over 10 MB. Export excludes outdated feature vectors as before; migration preserves those vectors until a confirmed relevant-sound reset.

## Six practice modes

On **Learn**, record three Trigger pull examples (eight to ten recommended). Draw, Rack and Magazine are optional and have per-gun recognition controls; existing trained optional sounds initially remain enabled. Only events used by a mode/sequence are required.

- **Single trigger press:** signal-to-click timing, then automatic fresh countdown and signal until the target is reached (CHG-017).
- **Repeated trigger presses:** one signal, accepted click target and intervals.
- **Par-time:** recognized in-time clicks or explicit misses; late clicks do not count as in-time shots.
- **Trigger control:** mean/min/max/spread of detected click intervals. Microphone timing cannot grade movement or aiming.
- **Reload:** two selected calibrated endpoints in order, with the interval in saved timing splits. Handling events do not count as shots.
- **Free:** accepted clicks and active duration until the limit or End.

Shared Configure/Run/Review stores configuration and outcomes separately for each gun. New defaults are 10 repetitions/clicks, random 2–5 seconds, beep On, par 1.5 seconds, free 60 active seconds and Rack → Magazine reload endpoints. Fixed delay remains available. Pause releases capture; Resume starts a fresh signal and intervals never span paused time. New practice uses a disclosed **80 ms** cue guard; legacy sequences retain **300 ms**. Deadlines judge captured onset and allow up to two seconds to finish segmenting audio already captured in time.

Under **Improve recognition**, optional reset/noise examples help reject false shots. Calibrated external-beep start needs three cue examples, waits for that cue and starts an acoustic timer without an app beep. Similar press/reset clicks can remain ambiguous; rejection may also miss an intended click. Numeric scores are heuristic. No field accuracy is established by synthetic checks.

Results reopen from gun-owned History. Storage failure stops capture, keeps unsaved Review/Retry accessible and prevents leaving that review until saved. Refresh recovers the last durable snapshot without automatically starting the microphone. Full sound reset clears that gun's positive/reset/noise/cue features while preserving results and other guns.

Active practice shows **STOP** in place of GO, with the captured microphone level below it. STOP releases capture and saves partial results; Pause/Resume and Next repetition remain available in their corresponding states. Heard-but-unmatched feedback distinguishes receiving audio from recognizing a shot. [The revised Run design](../design/archive/chg-016/practice-input.md) documents both themes.

See [practice requirements](../requirements/practice-modes.md), [release validation](PRACTICE_VALIDATION.md) and [actual UI captures](../design/README.md).

## Legacy timed sequences and working settings

These features are implemented and locally validated under CHG-014; [implementation history](../project/implementation-history.md) records source/browser evidence and publication/deployment separately.

- Select a built-in/custom drill, configure repetitions and fixed/random delay, confirm safety/training readiness, and press **Start Session**. Defaults: 10 repetitions, fixed 3 seconds, optional sound Off; Random initially offers 2–5 seconds. Bounds: 1–100 repetitions, 0–30-second delays in tenths, minimum no greater than maximum.
- Microphone acquisition precedes the countdown. Each repetition gets a fresh delay/visual GO. Only a complete detected ordered sequence increments Completed; known out-of-order events remain reviewable; new unknown input is transient (older saved rows remain readable). A completed result displays for one second before automatic progression.
- Pause releases capture and saves a partial attempt; Resume reacquires capture with a fresh countdown. Running/paused sessions lock gun switching. End/navigation/backgrounding/capture failure records incomplete/interrupted status; reload opens durable results without automatically restarting the microphone.
- **Sound at start** optionally synthesizes a beep at GO. A disclosed 300 ms detector-input guard excludes the cue; very fast sounds inside it may be missed. Silent mode has no guard. Reported intervals are sound-detection timings, not verified physical actions.
- Saved session/repetition review reopens from the selected gun's History. Preset edits, sound resets and recent-recognition trimming/clearing do not erase those separate snapshots.
- Settings offers per-gun **Noise Filter** and **Auto Gain**, initially Off, requesting supported browser processing on the next capture and reporting unsupported/unconfirmed track settings. Echo cancellation stays off; changing preferences preserves samples.
- Device-wide **Appearance** supports Dark (initial), Light and System; System follows the OS choice. Device-wide **Vibration Feedback** is initially Off and requests a short GO/completion vibration only when supported, reporting unavailable/failure accurately.

There is no account, cloud recovery or cross-device synchronization. Physical microphone/recognition accuracy, audible beep and physical vibration require real-device checks; synthetic acceptance does not establish them.

Offline-first, local sound-learning PWA, compatible with a future Capacitor iOS/Android wrapper. **It is not a signed IPA.** Classifier accuracy is experimental; complete the in-app safety checklist and test on inert/safe equipment before use.

## Primary and optional action sounds

| What you record | Stable storage ID | Notes |
|---|---|---|
| Draw from holster | `draw` | Optional; required only by sequences that use it |
| Rack slide | `rack` | Optional; required only by modes/sequences that use it |
| Trigger pull | `trigger` | Primary trigger-based practice calibration |
| Change magazine | `reload` | Keeps previous `reload` profile IDs for backwards compatibility |

**Important migration:** old `reload` examples are interpreted as *magazine changes*. If you previously recorded slide-racking as `reload`, reset learned sounds and collect correct examples for the categories you use. Old recorded history and backups remain readable.

## Development (human-readable code)

Requires **Node.js 22+**.

```bash
npm ci
npm run dev
npm run test:smoke
npm test
```

Your maintainable source lives in `src/`, `public/`, `index.html`, tests in `tests/`, and Vite configuration in `vite.config.js`. Commit these files to GitHub; `dist/` is intentionally ignored.

The committed npm lockfile pins dependencies. [Screenshot checks](VISUAL_TESTS.md) add a separate deterministic browser harness in `visual-tests/`, with reviewed Chromium/WebKit references in the design package. Use the pinned container for comparisons and baseline updates so local system fonts/browser versions cannot silently replace CI references.

## Production: minified files only

```bash
npm run build
npm run verify:dist
npm run preview
```

The `dist/` directory contains optimized **minified** JS/CSS bundles, the app HTML, the audio worklet, manifest and icons. It does **not** copy `src/`, test sources, or `.map` source maps. Vite 8 uses the Oxc JS minifier, Lightning CSS minifier, and `sourcemap: false`; see `vite.config.js`. For backwards compatibility `npm run build:static` now invokes the same Vite build (it **no longer** deploys human-readable source).

See the [minification audit and browser response checks](MINIFICATION.md) for current asset names/sizes, measured alternative compressors and how to compare an actual deployed response with the local build. All current production JavaScript/CSS files have one nonempty physical line; local build verification and Cloudflare publication are separate checks.

Upload **only `dist/`** to Netlify Drop, or configure Netlify to build from the GitHub source repo:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22` (set `NODE_VERSION=22` in Netlify if needed)

GitHub Actions in `.github/workflows/check.yml` runs the tests and creates a downloadable **minified-web-app** build artifact after each push to `main`. GitHub repository code remains readable; the deployment code is bundled and minified. Minification is *not* encryption, DRM or a guarantee that shipped client-side behavior cannot be inspected.

## Live sound testing

1. Open the HTTPS site on your iPhone in Safari and Add to Home Screen.
2. Confirm the safety check and record **at least 3 Trigger pull** examples (8–10 recommended). Other classes are optional; record a referenced class before using it in a mode/sequence.
3. Open **Live Listen → Start continuous listening**. Watch for the green **Microphone active** indicator.
4. Perform **separate, clearly audible actions** with a short quiet gap between them. A session timeline records each separate detection; the microphone stays on until you press **Stop** or hide the app.
5. **Single sound test** is intentionally a **one-shot** recording and stops after one event.
6. Verify each event under History; accuracy includes only verified detections and cannot count missed sounds.

The detector now uses fixed ~10ms frames, faster release/cooldown and bounded pre-roll buffers. It is still energy-based: overlapping sounds or very rapid mechanical sequences may merge; microphone auto gain, echo, distance and background noise can affect accuracy. No audio is uploaded or stored; only derived features and recent detections are kept in IndexedDB alongside gun metadata, custom presets and settings. The maximum number of history results is configurable from 1 to 500 independently per gun. Export a backup before changing browsers or uninstalling the Home Screen app.

## Layout

- `src/main.js` — views, four labels, continuous session state and timeline
- `src/audio.js` — microphone and feature extraction, worklet from `workers/pcm-capture.worklet.js`
- `src/eventDetector.js` — streaming segmentation
- `src/classifier.js` / `src/calibration.js` / `src/recognition.js` — single/multiple-class similarity, optional-label and rejection/cue evidence
- `src/practiceSession.js` / `src/practiceController.js` — shared six-mode logic, capture lifecycle and saved review
- `src/storage.js` — owned IndexedDB, backup/restore, durable sessions and recent-N retention
- `src/evaluation.js` — manually verified confusion matrix
- `workers/sw.js` — versioned PWA caching (v17), minified at build
- `tools/verify-dist.mjs` — public-build sanity check
- `.github/workflows/check.yml` — CI tests + build artifact

See [iPhone installation](INSTALL_ON_IPHONE.md) and [accuracy testing](ACCURACY_TESTING.md) for more guidance.


## Built-in action sequences

Open **Drills** and select one of these presets, or a custom preset saved for the selected gun:

| Preset | Expected recognition sequence |
| --- | --- |
| Trigger pull | Trigger pull |
| Rack slide, trigger pull | Rack slide → Trigger pull |
| Magazine change, trigger pull | Change magazine → Trigger pull |
| Draw, magazine change, trigger pull | Draw from holster → Change magazine → Trigger pull |

Confirm the safety checklist and train only the acoustic classes referenced by the selected sequence. **Start Drill** opens configuration; **Start Session** begins the timed flow described above. Out-of-order known detections reset partial recognition and unknown sounds never advance it. Completed repetitions, partial attempts and detected timings are saved in the selected gun's dedicated session review. **Live Listen → Start continuous listening** remains free listening; it does not silently start a timed drill or reuse its configuration.

**Caution:** These are *classifier-inferred* sequence completions, not measurements of physical action completion or performance. The classifier can miss, merge, or mislabel sounds. Keep actions safely separated for reliable segmentation. The microphone operates only in the foreground.

For step-by-step hosting instructions (GitHub + Netlify or manual Netlify Drop), read [Netlify deployment](NETLIFY_DEPLOY.md).


## Historical version 0.8.0 — interface refresh

- Compact header and angular **DF** logo inspired by the dark/olive reference image; matching installed-app icons.
- Main navigation: **Home / Learn / Drills / Live Listen / History**, with Settings in the top-right gear.
- Four lightweight, looping animated SVG sound cues on Learn cards. Vector previews reduce download size; movement is decorative and not a measured waveform.
- Per-sound **Reset** button deletes only that class's learned examples. Settings → **Reset all learned sounds** removes all four classes, preserving recognition history. History has an independent clear control. All deletions ask for confirmation.
- No audio feature format or IndexedDB version change: existing compatible models and history remain intact.
- Deploy via Cloudflare Workers Builds, Pages, or Netlify; see [DEPLOY.md](DEPLOY.md).

## CHG-017 improvements

[Approved requirements](../requirements/practice-improvements.md) cover automatic Single repetitions, comparable gun-owned History statistics/chart/table, ten new recordings per type/category, reviewed numeric limits, transient unknown input, app/browser navigation and once-per-page safety confirmation that resumes the original action. [Current captures](../design/README.md) and [validation](PRACTICE_VALIDATION.md) distinguish local source/browser checks from publication, Cloudflare and physical iPhone results. Cache v15 updates the application without changing IndexedDB schema 3, feature version 2 or backup format 4. Older compatible over-cap profiles remain usable/exportable/restorable; no automatic truncation is introduced.

## Documentation and browser capability maintenance

Run `npm run docs:check` before publishing; see [screen architecture maintenance](../architecture/README.md). See [browser capability guidance](BROWSER_CAPABILITIES.md) for optional audio controls and iPhone/Android vibration limits.

[Native iPhone/Android release guide](NATIVE_RELEASE.md) · [Monetization planning](../business/monetization.md)

The [reusable page architecture](../architecture/page-templates.md) compiles all screen content through shared app/view templates. Use typed page packages in `apps/web/src/pages/` and shared UI packages for screen content/chrome. Only the view wrapper and retained private progress/testing fragments remain under `src/templates/`; index.html owns metadata and the single app mount.

CHG-049: [coverage and performance gates](PERFORMANCE.md) run before and after refactor slices; the independent original artifacts, paired browser reports and React shell feasibility probe preserve the unchanged-startup contract.
