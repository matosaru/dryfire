# Audio recognition improvement plan

Status: active on `feature/audio-recognition-v3` · CHG-063 · 2026-11-01

## Constraints

- Preserve existing gun data, learned profiles, history, routes and safety flow.
- Keep trigger training required and other sound categories optional.
- Do not store or upload raw microphone audio.
- Keep optimized/minified production artifacts and existing performance gates.
- Update requirements, help/manual copy, screenshots and tests with every user-visible change.

## Step-by-step delivery

### 0. Establish the baseline — complete

1. Run the locked installation, smoke/unit tests, optimized build and artifact verification on the unchanged branch point.
2. Record existing detector/classifier/cue behavior and bundle sizes.
3. Treat physical-device accuracy as unverified even when automated tests pass.

### 1. Add measurement before tuning — implemented; owner device capture pending

1. Add a versioned, labelled evaluation-event format containing features, expected class, device/session conditions and decision output; exclude PCM.
2. Add a deterministic baseline-versus-candidate evaluator for recall, false shots, duplicates and timing error.
3. Add a guided sound-check UX so known clicks and misses can be recorded explicitly.
4. Export a privacy-safe evaluation report for repeated iPhone tests.

Exit: the same corpus produces reproducible metrics and can compare both algorithms event for event.

### 2. Make microphone readiness deterministic — implemented on the feature branch

1. Observe a bounded ambient window while capture is active and detection is disarmed.
2. Estimate a robust room noise level and initialize the detector from it.
3. Show Preparing, Ready, Room is noisy and unavailable states with a clear remedy.
4. Use the same readiness path for trigger practices, sequence drills and Live Listen.
5. Verify that the first post-signal click is not lost and an early pre-signal click is classified as a failed attempt where the practice requires it.

Exit: integration tests prove capture starts before countdown, cue guard ends deterministically and a fast valid first click reaches the engine.

### 3. Improve guided learning — implemented; owner review pending

1. Compute profile consistency/outlier information from saved feature vectors.
2. Present Needs samples, Variable or Stable with one recommended action.
3. Add recording guidance and an explicit replace flow; never silently remove samples.
4. Keep optional negative/calibration categories under a clearly labelled advanced section.

Exit: users can see whether a trigger profile is usable and what to correct without interpreting technical scores.

### 4. Strengthen and test the start signal — implemented on the feature branch; iPhone audibility pending

1. Use a phone-friendly frequency, longer audible envelope and higher safe Web Audio gain.
2. Add Test start sound to the shared setup component.
3. Derive the detection guard from cue duration plus a bounded acoustic tail.
4. Explain media-volume dependence and preserve sound-off behavior.

Exit: envelope tests pass, the cue never counts as a shot in the synthetic corpus, and physical iPhone verification records whether it is clearly audible.

### 5. Evaluate a feature-version-3 classifier — shadow implementation complete; evidence pending

1. Add onset-aligned spectral information such as log-mel/MFCC bands while retaining current time-domain features.
2. Train a per-gun trigger verifier with negative-example rejection and bounded thresholds.
3. Run v2 and v3 side by side on the same events without changing user results.
4. Promote v3 only after the significance and non-regression gates in the requirement pass.
5. Retain rollback and v2-profile compatibility.

Exit: paired real-device evidence supports the change. Otherwise retain v2 and document the inconclusive result.

### 6. Documentation, visual acceptance and release candidate

1. Update Learn, setup, practice-guide, Help/About copy and manuals from the implemented behavior.
2. Update architecture/site maps and current screen specifications.
3. Regenerate and review affected Dark/Light screenshots and controlled guide media.
4. Run complete unit, integration, coverage, screenshot, WebKit/Chromium, build, artifact and performance checks.
5. Publish only this feature branch for testing until the owner accepts measured device behavior.

## Real-device test protocol

Use the same labelled action order for baseline and candidate. On the primary iPhone Safari/Home Screen app, test at quiet, normal and noisy room levels, with the phone close and at the expected working distance. Include natural trigger clicks, reset clicks, slide/handling sounds, speech, claps and the app cue. Do not tune on the evaluation events.

For each session record device/browser version, gun profile pseudonym, distance/position, room condition, sensitivity, expected event and observed result. Split calibration/development events from evaluation events. Repeat sessions on different days to expose changing room acoustics and microphone gain.

The first development checkpoint can guide iteration; it cannot support a production accuracy claim. The promotion corpus and paired interval decide whether the candidate is meaningfully better.

## Current status

- [x] Separate feature branch created from accepted `main`.
- [x] Requirements and significance gates specified.
- [x] Phased implementation and device protocol specified.
- [x] Unchanged baseline recorded: 1,137 tests / 169 suites, 16 smoke checks and optimized public artifact verification passed at `df3b864`.
- [x] Privacy-safe measurement/evaluation foundation and interactive labelled Sound Check/report export implemented.
- [x] Ambient readiness implemented for Practice and Sequence capture with robust room sampling before countdown.
- [x] Guided learning quality and atomic explicit replace flow implemented.
- [x] Louder cue, shared acoustic guard and Test start sound action implemented; physical iPhone audibility remains unverified.
- [x] Candidate spectral extractor/classifier runs beside v2 in Sound Check and never drives practice.
- [ ] Candidate spectral classifier evaluated on the owner-supplied unseen iPhone corpus.
- [x] Help/manual, current captures and reviewed visual baselines updated; public and preview exact replays pass 454/454 Chromium/WebKit cases.
- [ ] Physical iPhone checkpoint passed.

## Local checkpoint · 2026-11-02

The implementation candidate, owner-reported Sound Check start correction and Contact copy fallback are complete on the feature branch. It passes 1,169 tests / 177 suites, the coverage ratchet, type checks, both lint suites, 16 smoke checks, documentation checks and 454 exact public/preview screenshot cases across Chromium and WebKit. The real Sound Check route test waits for controller readiness, clicks Start and observes the safety dialog. Public critical payload remains below the unchanged main-branch ceilings at 159,308 raw / 50,203 gzip JavaScript and 59,532 raw / 12,587 gzip CSS. Paired Chromium/WebKit performance and branch CI are the final automated release gates before owner testing.

This checkpoint establishes implementation stability, not recognition significance. The owner next collects the development corpus with Sound Check on iPhone Safari/Home Screen; exported reports decide whether feature v3 can be promoted. The stronger cue still needs physical audibility confirmation because browser automation cannot measure the phone speaker.

