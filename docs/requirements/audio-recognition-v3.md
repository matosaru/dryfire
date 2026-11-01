# Predictable audio learning and recognition

Revision 1.0 · CHG-063 · 2026-11-01

## Goal

Make trigger-click learning and recognition understandable, repeatable and measurable on real devices. The primary outcome is reliable trigger-click recall without increasing false shot counts. Other learned mechanical sounds remain optional.

This work is developed on `feature/audio-recognition-v3` until the evidence gates in this document pass. It does not change production branches by itself.

## Approved scope

The owner instructed: **“Prepare a valid step by step plan. And proceed with audio listening and learning improvement implementation. For this, let’s create a separate feature branch. We will test on on and work on it until significancy is reached. Suggest testing strategy also. Make UX friendly, and clear. Update user help pages and manual with new approach.”**

### AUDIO3-01 — Guided trigger learning

- Trigger learning remains the only required sound training.
- The Learn screen explains how to hold the device, keep the room representative and record natural presses.
- A profile-quality summary reports whether examples are insufficient, variable or stable. It must explain the next action in plain language.
- Inconsistent examples may be identified for replacement, but the application never silently deletes a recording.
- The existing limit of ten recordings per sound type remains.

### AUDIO3-02 — Ambient readiness

- Listening begins before a timed practice countdown or session signal.
- Before arming detection, the application observes a bounded ambient window and initializes the detector from robust room-level statistics.
- The UI distinguishes microphone preparation, ready, noisy-room and unavailable states. A noisy-room state gives a corrective instruction and must not claim accuracy.
- A fixed sensitivity choice may adjust the detector, but it must not be the only basis for its threshold.

### AUDIO3-03 — Predictable event decisions

- A detected event is counted as a shot only when it matches the active gun's trigger profile and passes negative-example rejection.
- Trigger reset, handling, speech and other unknown events are not stored as recognized shots.
- The application prevents one mechanical event from producing duplicate shot counts.
- Recognition diagnostics expose useful decision information without presenting distance scores as probabilities.
- Raw PCM is not persisted, uploaded or added to backups by this change.

### AUDIO3-04 — Start sound

- The app start signal is made substantially easier to hear on a phone speaker while retaining a short, non-startling envelope.
- Setup provides a **Test start sound** action before a drill begins.
- The UI explains that the phone's media volume controls final loudness.
- The detector's cue guard covers the emitted signal and its short acoustic tail. A valid fast trigger after that guard remains detectable.

### AUDIO3-05 — Backward compatibility

- Existing feature-version-2 learned profiles remain usable.
- New profile metadata is optional and must fail safely when absent.
- No database identity, gun ownership, history or backup data is removed.
- A later feature-version-3 classifier runs beside the current classifier during evaluation before it can become the default.

### AUDIO3-06 — User validation and correction

- A sound check lets a tester perform known trigger presses and mark missed or incorrect outcomes.
- The check reports expected presses, detected matches, misses, false shots and duplicates using plain counts.
- Device/session metadata may be exported for evaluation only when it contains no raw audio or personal content.
- Help and practice manuals describe calibration, readiness, start sound, early presses and troubleshooting consistently.

## Accuracy evidence

The application must not describe a classifier change as better from unit tests or training examples alone.

| Measure | Definition | Direction |
| --- | --- | --- |
| Trigger recall | accepted trigger clicks / known trigger clicks | higher |
| False-shot rate | counted shots / known non-trigger events | lower |
| Duplicate rate | extra counts / known trigger clicks | lower |
| Timing error | detected onset minus labelled onset | closer to zero |
| Cue false shots | counted shots caused by the app signal | zero |

Development checkpoint: at least 50 unseen trigger presses and 100 non-trigger events on the primary iPhone, collected across multiple sessions, device positions and representative room conditions.

Promotion evidence: at least 300 unseen trigger presses and 600 non-trigger events across at least three device/condition combinations. Compare old and candidate decisions on the same labelled events. Use a paired bootstrap 95% interval or an exact paired test. A claimed recall improvement requires the lower confidence bound to be above zero, with no material false-shot or duplicate regression. Zero false shots in 300 negative events supports only an approximate upper 95% bound below 1%; it does not prove a zero real-world rate.

## Exclusions

- The microphone cannot verify that a firearm is unloaded, aimed safely or physically stable.
- Camera/sensor analysis, cloud audio storage and remote model training are not included.
- Browser audio-processing switches such as noise suppression remain capability dependent.
- Device volume cannot be raised above the user's operating-system media-volume setting.

## Acceptance

- Pure detector, readiness, profile-quality and cue-envelope tests pass.
- Integration tests cover permission delay, preparation, cue guard, first fast click, duplicate suppression, pause/stop and device loss.
- Pinned Chromium/WebKit functional and screenshot checks pass with reviewed UX updates.
- Public/preview optimized builds, artifact verification and the original performance gates pass before any branch promotion.
- Real-device results are recorded separately from simulated browser evidence.

