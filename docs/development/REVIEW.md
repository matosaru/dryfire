# Engineering review — v0.4.0

This update extends the reviewed v0.3.0 project. The source was modified and tested with local tools; a connected Codex agent was not available in this chat.

## Completed

- **Streaming capture:** AudioWorklet-first PCM transfer, muted output and a compatibility ScriptProcessor fallback.
- **Segmentation:** adaptive energy threshold, finite pre-roll, silence release, hard event-size cap, cooldown and high/normal/low sensitivity presets.
- **Lifecycle:** explicit Start/Stop, cleanup of microphone tracks and AudioContext, stop on tab switch/background/disconnect.
- **Recognition:** reuse feature format v2 for compatibility with v0.3.0; preserve unknown rejection and uncalibrated score warning.
- **Validation:** save independently user-confirmed truth labels, compute an on-device confusion matrix, verified event accuracy, and other-class false-positive fraction.
- **Persistence:** local IndexedDB last-N events and retained per-sound training vectors; raw microphone audio is never written to storage.
- **Tests:** new Jest cases for event segmentation, verified metrics and IndexedDB truth labels, and expanded dependency-free smoke tests.

## Verified here

- `npm run test:smoke`: **7 of 7 passed** on Node.js 22.
- `node --check`: browser modules, worklet and tests are syntactically valid JavaScript.
- Cross-check of UI JavaScript selectors against `index.html`: **28 referenced IDs, none missing**.
- Archive passed `unzip -t` with no errors.

## Unverified here

- `npm install` timed out; therefore the full Jest suite and Vite production build have **not** been verified.
- Chromium-based UI test launch timed out; no live-browser rendering is claimed.
- Real microphone behavior, classifier accuracy, native WebView permissions, lock-screen/lifecycle interruptions and app-store readiness need real Android/iOS device testing.
- No user-provided labelled audio dataset was available to measure classification accuracy.

## Remaining risks

1. Short trigger sounds can be too quiet to detect, while multiphase sounds can be joined or split. Tunable energy segmentation is a baseline, not a validated event detector.
2. The handcrafted-feature classifier is not an MFCC/log-mel model and may generalize poorly. Match scores should not be read as probabilities.
3. Manually confirmed metrics cover detected events only; missed actions cannot be counted automatically without a separate ground-truth event log.
4. Capacitor WebViews may require native audio plugins and platform-specific permission handling. AudioWorklet support depends on the target OS/WebView.
5. No lockfile was generated because dependency installation did not complete; run `npm install` locally and commit `package-lock.json`.

See [accuracy-testing protocol](ACCURACY_TESTING.md) for a practical real-device evaluation protocol.


## 2026-10-09 v0.6.0 addendum

The live detector now supports repeated separated events with a shorter release/cooldown interval, and the classifier recognizes four labels including independent rack-slide and magazine-change examples. Session UI reports each detection. The production Vite build includes the service worker and AudioWorklet as separate minified JS entries, with source maps disabled. Code syntax and smoke tests passed, but the full Jest/Vite production build and real-device microphone test are unverified here because npm registry was unreachable. Check `npm run build && npm run verify:dist` on a machine with dependencies before deployment.
