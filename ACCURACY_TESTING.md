# Device accuracy-testing protocol (v0.4.0)

This is a *manual* acoustic validation protocol. The code includes an accuracy summary over confirmed **detected** events, but there is **no supplied real-world labelled dataset** and no claimed field accuracy. Automated tests use synthetic waveforms only.

## Initial setup

1. Deploy to HTTPS or install a debug Android/iOS build. Allow microphone permission, confirm audio source availability.
2. Follow the safety checklist; use only verified unloaded equipment with ammunition removed and safe direction/backstop.
3. Fix one consistent phone placement. Record at least 8 training examples **per class** in Learn.
4. Start live listening and choose **Normal** sensitivity. Try a quiet room first.
5. Prepare a written list of **unseen** events to perform. Do not evaluate on recordings you used to train.

## Suggested manual test matrix

| Test condition | Expected events | What to record |
|---|---:|---|
| Draw-class audio | 10 | Detected count, predicted class, manual truth |
| Slide-racking audio | 10 | Detected count, predicted class, manual truth |
| Magazine-change audio | 10 | Detected count, predicted class, manual truth |
| Trigger-click audio | 10 | Detected count, predicted class, manual truth |
| Background / other sounds | 10 | Whether event is detected, and if so, predicted class |
| Silence for two minutes | 0 | Number of unsolicited detected events |

Perform these in a safe and controlled training environment. For recognition evaluation, a prerecorded nonfunctional mechanical-sound source can also be useful. Label **every detected event** as soon as you know what occurred, including `Other / noise` and incorrect predictions.

## How to interpret the app metrics

- **Accuracy:** manually confirmed correct predictions divided by all verified detected events.
- **Confusion matrix:** which actual class was confused for which prediction, including Unknown.
- **Other-sound false positive fraction:** number of verified *Other* events classified as one of the 3 known classes / all detected, verified *Other* events.
- **Missed event rate:** **not calculated by the app**. Separately track `expected events - detected events` (and false multiple detections). A class can have a high app accuracy even when many expected sounds never trigger segmentation.
- **False detections during silence:** separately record the number per listening hour (app currently does not compute this).

**Cautions:** small datasets are noisy; `N` limits history and changes the evaluation sample size; changes in room/phone distance/OS audio processing may change performance. Numeric match score is a heuristic similarity score, not a probability.

## Important mobile checklist

- Explicit user permission is required before microphone use.
- Stop releases the microphone indicator / hardware audio route.
- Switching away or locking the phone stops listening.
- Worklet loads after an offline reload; compatibility mode works if worklet unavailable.
- App recovers from denied microphone permission and device disconnection without leaving the UI stuck.
- Validate at least one iOS and one Android device before relying on mobile packaging.
