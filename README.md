# Sound Trainer v0.7.0 — four-action acoustic learning

Offline-first, local sound-learning PWA, compatible with a future Capacitor iOS/Android wrapper. **It is not a signed IPA.** Classifier accuracy is experimental; complete the in-app safety checklist and test on inert/safe equipment before use.

## Four sounds

| What you record | Stable storage ID | Notes |
|---|---|---|
| Draw from holster | `draw` | Capture an isolated presentation sound |
| Rack slide | `rack` | New separate class (no previous examples exist) |
| Trigger pull | `trigger` | Capture the dry click |
| Change magazine | `reload` | Keeps previous `reload` profile IDs for backwards compatibility |

**Important migration:** old `reload` examples are interpreted as *magazine changes*. If you previously recorded slide-racking as `reload`, reset learned sounds and collect correct examples for all four categories. Old recorded history and backups remain readable.

## Development (human-readable code)

Requires **Node.js 22+**.

```bash
npm install
npm run dev
npm run test:smoke
npm test
```

Your maintainable source lives in `src/`, `public/`, `index.html`, tests in `tests/`, and Vite configuration in `vite.config.js`. Commit these files to GitHub; `dist/` is intentionally ignored.

## Production: minified files only

```bash
npm run build
npm run verify:dist
npm run preview
```

The `dist/` directory contains optimized **minified** JS/CSS bundles, the app HTML, the audio worklet, manifest and icons. It does **not** copy `src/`, test sources, or `.map` source maps. Vite 8 uses the Oxc JS minifier, Lightning CSS minifier, and `sourcemap: false`; see `vite.config.js`. For backwards compatibility `npm run build:static` now invokes the same Vite build (it **no longer** deploys human-readable source).

Upload **only `dist/`** to Netlify Drop, or configure Netlify to build from the GitHub source repo:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22` (set `NODE_VERSION=22` in Netlify if needed)

GitHub Actions in `.github/workflows/check.yml` runs the tests and creates a downloadable **minified-web-app** build artifact after each push to `main`. GitHub repository code remains readable; the deployment code is bundled and minified. Minification is *not* encryption, DRM or a guarantee that shipped client-side behavior cannot be inspected.

## Live sound testing

1. Open the HTTPS site on your iPhone in Safari and Add to Home Screen.
2. Confirm the safety check and record **at least 3** examples for each of the **four** classes (8–10 recommended).
3. Open **Listen → Start continuous listening**. Watch for the green **Microphone active** indicator.
4. Perform **separate, clearly audible actions** with a short quiet gap between them. A session timeline records each separate detection; the microphone stays on until you press **Stop** or hide the app.
5. **Single sound test** is intentionally a **one-shot** recording and stops after one event.
6. Verify each event under History; accuracy includes only verified detections and cannot count missed sounds.

The detector now uses fixed ~10ms frames, faster release/cooldown and bounded pre-roll buffers. It is still energy-based: overlapping sounds or very rapid mechanical sequences may merge; microphone auto gain, echo, distance and background noise can affect accuracy. No audio is uploaded or stored; only derived features and recent detections are kept in IndexedDB. The maximum number of history results is configurable from 1 to 500. Export a backup before changing browsers or uninstalling the Home Screen app.

## Layout

- `src/main.js` — views, four labels, continuous session state and timeline
- `src/audio.js` — microphone and feature extraction, worklet from `workers/pcm-capture.worklet.js`
- `src/eventDetector.js` — streaming segmentation
- `src/classifier.js` — four-class nearest-distance model, unknown rejection
- `src/storage.js` — IndexedDB, backup/restore, recent-N retention
- `src/evaluation.js` — manually verified confusion matrix
- `workers/sw.js` — versioned PWA caching (v7), minified at build
- `tools/verify-dist.mjs` — public-build sanity check
- `.github/workflows/check.yml` — CI tests + build artifact

See `INSTALL_ON_IPHONE.md` and `ACCURACY_TESTING.md` for more guidance.


## Built-in sequence drills (v0.7)

Open **Listen → Training mode** and select one of these presets:

| Preset | Expected recognition sequence |
| --- | --- |
| Trigger pull | Trigger pull |
| Rack slide, trigger pull | Rack slide → Trigger pull |
| Magazine change, trigger pull | Change magazine → Trigger pull |
| Draw, magazine change, trigger pull | Draw from holster → Change magazine → Trigger pull |

Confirm the safety checklist, train all four acoustic classes and tap **Start continuous listening**. The selected preset highlights the next expected sound and counts recognized complete sequences. Out-of-order known detections restart a partial attempt; unknown sounds are counted but don't advance it. After a completed sequence the app automatically listens for another attempt. Switch to **Free listen** for unlabeled sequence recognition. The session counters reset when you start or switch presets, and the drill ID/outcome is attached to each recognized event in the last-N local history (and backup).

**Caution:** These are *classifier-inferred* sequence completions, not measurements of physical action completion or performance. The classifier can miss, merge, or mislabel sounds. Keep actions safely separated for reliable segmentation. The microphone operates only in the foreground.

For step-by-step hosting instructions (GitHub + Netlify or manual Netlify Drop), read **`NETLIFY_DEPLOY.md`**.
