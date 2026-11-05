# Device accuracy-testing protocol

This is a *manual* acoustic validation protocol. There is no supplied real-world labelled dataset and no claimed field accuracy. Automated tests use synthetic waveforms only. CHG-063 adds privacy-safe paired evaluation; raw PCM remains unsaved.

For the current trigger-first practice release, also complete the [iPhone release checks](IPHONE_RELEASE_CHECKS.md). This protocol measures recognition accuracy; it does not establish production deployment or physical feedback by itself.

## Initial setup

1. Deploy to HTTPS or install a debug Android/iOS build. Allow microphone permission, confirm audio source availability.
2. Follow the safety checklist; use only verified unloaded equipment with ammunition removed and safe direction/backstop.
3. Fix one consistent phone placement. Record at least 8 Trigger examples in Learn and check the profile-quality guidance. Train optional positive classes only when used; add separate reset/noise rejection examples when possible. Keep test examples distinct from calibration.
4. Start live listening and choose **Normal** sensitivity. Wait for the ambient-readiness status; record any noisy-room warning.
5. Prepare a written list of **unseen** events to perform. Do not evaluate on recordings you used to train.

## Suggested manual test matrix

| Test condition | Expected events | What to record |
|---|---:|---|
| Draw-class audio | 10 | Detected count, predicted class, manual truth |
| Slide-racking audio | 10 | Detected count, predicted class, manual truth |
| Magazine-change audio | 10 | Detected count, predicted class, manual truth |
| Trigger-click audio | 10 | Detected count, predicted class, manual truth |
| Trigger reset clicks | 10 | Any false shot counts and legitimate trigger clicks rejected after calibration |
| Background / handling / speech / footsteps / claps | 10 each | Any false shot counts; record detected and missed events separately |
| App start beep and external electronic beep | 10 each | Cue alone must add no shot; record whether a configured calibrated external cue starts timing |
| Background / other sounds | 10 | Whether event is detected, and if so, predicted class |
| Silence for two minutes | 0 | Number of unsolicited detected events |

Perform these in a safe and controlled training environment. For recognition evaluation, a prerecorded nonfunctional mechanical-sound source can also be useful. Label **every detected event** as soon as you know what occurred, including `Other / noise` and incorrect predictions.

## How to interpret the app metrics

- **Accuracy:** manually confirmed correct predictions divided by all verified detected events.
- **Confusion matrix:** which actual class was confused for which prediction, including Unknown.
- **Other-sound false positive fraction:** number of verified *Other* events classified as one of the 4 known classes / all detected, verified *Other* events.
- **False shot count:** separately count accepted shots during reset/handling/noise/cue-only trials, including duplicate counts for one true press. Mode results alone cannot establish the physical source of a sound.
- **Missed event rate:** **not calculated by the app**. Separately track `expected events - detected events` (and false multiple detections). A class can have a high app accuracy even when many expected sounds never trigger segmentation.
- **False detections during silence:** separately record the number per listening hour (app currently does not compute this).

**Cautions:** small datasets are noisy; `N` limits history and changes the evaluation sample size; changes in room/phone distance/OS audio processing may change performance. Numeric match score is a heuristic similarity score, not a probability.

## CHG-063 paired significance gate

Compare baseline and candidate decisions on the same unseen labelled events. The development checkpoint is 50 trigger presses and 100 negative events on the primary iPhone across multiple sessions. Promotion needs at least 300 trigger presses and 600 negatives across at least three device/condition combinations. Use a paired bootstrap 95% interval or an exact paired test. Claim better recall only when the lower confidence bound is above zero and false-shot/duplicate rates do not materially regress. Do not tune thresholds on the promotion corpus.

## Important mobile checklist

- Explicit user permission is required before microphone use.
- Stop releases the microphone indicator / hardware audio route.
- Switching away or locking the phone stops listening.
- Worklet loads after an offline reload; compatibility mode works if worklet unavailable.
- App recovers from denied microphone permission and device disconnection without leaving the UI stuck.
- Validate at least one iOS and one Android device before relying on mobile packaging.
