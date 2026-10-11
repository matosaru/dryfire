# Timed sessions and working settings — approved implementation plan

Revision: 1.0 · Change: CHG-014 · Approval date: 2026-10-10 · State: **Approved; implemented and locally validated on 2026-10-11; publication/deployment tracked separately**

The user instructed **“proceed with next steps”** after the multi-gun delivery, then explicitly replied **“proceed”** to the confirmation of this published revision. Timed starts, progress, saved repetition results, the start beep and the four settings were already requested or approved; the latest reply approves the remaining defaults and interruption behavior below. See the appended CHG-014 approval evidence in [approval-log.md](approval-log.md) and the [immutable reviewed proposal](https://github.com/matosaru/dryfire/blob/ebac22b/docs/design/requirements/next-implementation.md).

Affected requirements: DRILL-01–05, DRILL-07–09, DATA-01–04 and SET-01–05. The authoritative [drill](drill-sessions.md), [persistence](persistence.md) and [settings](settings.md) specifications now incorporate these approved choices. Approval does not establish code completion, publication, deployment or real-device verification.

## Configure, Run and Review

Use the already reviewed [three-state drill design](../drill-session-mockup.png). Retain the current brand and selected gun. Display the full sequence once in its ordered strip, with the generic heading **Drill Session**. This revision clarifies controls and behavior rather than replacing the approved visual direction.

```text
Configure                           Run                         Review
Drill Session · selected gun        Drill Session · gun         Session review · gun
[one ordered sequence strip]        [one sequence strip]        Completed / target · status
Repetitions: 10                     Completed 3 · Left 7        Saved on this device
Start delay: Fixed / Random         Countdown / GO / Paused     Repetition timing records
Fixed: 3 s / Random: 2–5 s          Latest repetition result    Expand detections/splits
Sound at start: Off / On            Pause / Resume · End        Repeat · Back to Drills
Training/safety readiness           Microphone status           Interrupted results labelled
Start Session                                                  Also available in History
```

- Defaults: **10 repetitions**, **fixed 3-second delay**; switching to Random initially offers **2–5 seconds**. Allow 1–100 repetitions and delays of 0–30 seconds, in tenths of a second; random minimum must not exceed maximum.
- Save configuration for the selected gun. Start requires the existing safety checklist and at least three compatible examples of every existing sound class. Explain missing training and link to Learn.
- Acquire the microphone before starting the first countdown. Apply a fresh fixed/random delay before every repetition. After completion, show the result for one second, then advance automatically; finish at the target.
- Lock configuration and gun switching while a session is running or paused. Pause releases the microphone and abandons the unfinished attempt without increasing Completed; keep its partial outcome for review. Resume acquires the microphone and starts that repetition with a fresh countdown. Completed repetitions remain saved.
- End, leaving the session, backgrounding, microphone failure or refresh saves an incomplete/interrupted session accurately. Refresh opens saved results rather than automatically restarting the microphone. An abrupt browser shutdown is recovered from the last durable snapshot.
- Unknown sounds do not advance the sequence. A known out-of-order sound resets partial recognition; count and retain it for review. Only a complete detected ordered sequence increases Completed and decreases Left. Timings describe sound detection, not verified physical actions.
- **Sound at start** retains its approved semantics: optional short beep when visual GO appears; silent mode also shows GO. Default Off. In beep mode, suppress/reset detector input during a 300 ms cue guard to exclude the synthetic cue; report that very fast sounds in this guard may be missed. Timings remain measured from visual GO. Silent mode has no cue guard.
- Save the gun/drill identity and title/sequence/configuration snapshots, timestamps, session status, completed and partial repetition outcomes, detected events, unknown/out-of-order counts and relative sound-detection timing/splits. Changes to presets do not rewrite past sessions.
- Review shows saved repetition details and offers Repeat Session and Back to Drills. Selected-gun History can reopen saved sessions. Sound reset and recent-recognition trimming/clearing do not delete session results.

## Audio, appearance and feedback controls

- **Noise Filter** and **Auto Gain** are per-gun preferences, initially **Off**, retaining current capture behavior. They request supported `noiseSuppression` and `autoGainControl` constraints on the next training, test, free-listen or drill capture. Echo cancellation remains off. Changes never alter an active capture.
- Clearly report unsupported browser controls or settings the audio track does not confirm. Keep core capture usable. Explain that changing processing can affect recognition and may require fresh examples; changing preferences itself never deletes samples.
- **Appearance** is a device-wide preference: **Dark** (initial), **Light**, **System**. System follows the device preference. All choices retain readable controls and persist through refresh.
- **Vibration Feedback** is device-wide, initially **Off**. When enabled and supported, request a short vibration at GO and repetition completion. Mark unavailable where the API is absent or reports failure; do not claim iPhone support or physical vibration verification from a browser test.

## Preservation and backups

Keep the database identity and all gun-owned data. Add a separate session store transactionally; do not automatically trim saved sessions. Serialize writes so completed repetition results are durable before advancing.

Extend whole-library backups to include owned sessions and preferences. Continue accepting older versions. The existing replacement confirmation must explicitly disclose replacement of saved sessions; older backups contain none. Validate all associations and records before an atomic replacement. Keep same-origin local-storage limits explicit; this introduces no accounts or cloud synchronization.

## Acceptance

Validate fixed/random bounds, countdown gating, actual ordered completion counts, pause/resume/interruption, persistence after refresh, independent gun ownership, historic snapshots, beep exclusion, compatible backups and reset/trim isolation. Verify supported/unsupported processing, next-capture application, persisted themes and vibration preference behavior. Test narrow screens and old-data migration. Synthetic checks do not establish real-device audio accuracy, audible beep or physical vibration.

No free-plan cap, profile deletion, new sound taxonomy, signed native release or cloud recovery is added.
