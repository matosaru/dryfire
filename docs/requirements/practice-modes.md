# Trigger-first practice — current functional specification

Revision: 1.6 · Changes: CHG-015/016/017 · Scope: authorized for automatic implementation · Implementation: CHG-015 published in [`8b8aec9`](https://github.com/matosaru/dryfire/commit/8b8aec9); CHG-016 implemented, locally validated and published in [`34d3136`](https://github.com/matosaru/dryfire/commit/34d3136), designs in [`9b24b7d`](https://github.com/matosaru/dryfire/commit/9b24b7d); CI/production/device acceptance remain separate in the delivery tracker

Evidence, 2026-10-11: the user requested **“other sounds then trigger pull recognition to be optional”** and **“all the practice modes”**, then instructed **“adjust the final plan, try to optimise the steps”** and **“after plan is adjusted, proceed with next steps… stop confirming each step, do all steps automatically, i will verify final changes in an app and give a feedback.”** This authorizes completing the consolidated plan below and choosing routine implementation details without repeated confirmation. It supersedes the earlier proposal to seek separate confirmation for each detailed choice. Changes remain documented; approvals are not inferred from silence.

CHG-017 defines automatic fresh-delay/countdown/signal Single cycles. See [the approved revision-1.2 plan](practice-improvements.md) for progress charts, transient unknown input, navigation, safety modal and the explicitly approved limit table. Par/Reload manual Next behavior remains unchanged.

## Outcome and compatibility

Trigger-based practice works with only the selected gun's trigger examples. Optional Draw, Rack and Magazine calibration stays available and never blocks an unrelated mode. A sequence or reload mode asks only for its own required events. Preserve existing gun IDs, four positive sound identifiers, learned features, custom presets, old session snapshots, history and device preferences.

The shipped CHG-014 runner remains available for legacy built-in/custom sequences. Its historical fixed-delay/default/300 ms cue policy is preserved. New practice modes share a single engine, recorder and saved review rather than six independent implementations.

## Requirements

| ID | Requirement |
| --- | --- |
| PRACTICE-01 | Trigger recognition is sufficient for trigger-based practice. Other positive sound types are optional; only a mode/sequence's referenced events are prerequisites |
| PRACTICE-02 | An accepted firing-mechanism click counts one shot. Reset/handling/background/cue sounds must not count as additional shots; provide transient rejected/unknown feedback without adding new durable unknown records (CHG-017); retain older observations |
| PRACTICE-03 | Provide safety/readiness, configurable ready delay/start cue, acoustic timing feedback, repetition/reset flow and durable review |
| PRACTICE-04 | Single trigger press: start-signal-to-click timing per repetition |
| PRACTICE-05 | Repeated trigger presses: accepted click count and consecutive intervals |
| PRACTICE-06 | Par-time: accepted click within the configured deadline, or explicit miss/late outcome |
| PRACTICE-07 | Trigger control: timing consistency statistics, with no microphone-only movement/aim/technique grading |
| PRACTICE-08 | Reload: timing between two explicitly selected event endpoints. Handling endpoints never count as shots; an explicitly selected Trigger endpoint counts only an accepted trigger click |
| PRACTICE-09 | Free practice: accepted total and active session duration |
| PRACTICE-10 | All configuration/calibration/results are gun-owned and survive compatible same-origin refreshes/deployments and backups |
| PRACTICE-11 | Test labelled positive and rejection examples, including resets, noise and cues. Measure real-device false counts and missed clicks separately; synthetic checks are not field accuracy |
| PRACTICE-12 | Keep existing safety acknowledgement and accurate acoustic limits: no verification of unloaded status, aim or safe movement |
| PRACTICE-13 | An optional calibrated external electronic beep may start the timer; it never counts as a shot |
| PRACTICE-14 | Replace GO with a functional STOP button once practice starts; place the real microphone-level indicator below STOP. STOP releases capture and saves partial results using existing End Practice behavior. Countdown remains before the start; inactive/paused/ended capture must not imply live input. Show heard-but-unmatched feedback without counting a shot |

## Concrete defaults and mode behavior

- New practice defaults: 10 repetitions/clicks, random 2–5-second ready delay, app start beep On. Fixed timing remains available at 3 seconds. Existing saved legacy-session configuration is not overwritten.
- Repetition/count target: 1–100; delays: 0–30 seconds in tenths, minimum no greater than maximum. Free practice defaults to 60 active seconds, configurable 1–3600. Par defaults to 1.5 seconds, configurable 0.1–30 in tenths; a click exactly at the deadline is in time.
- Single/par/reload use individual repetitions. Single automatically starts a fresh configured countdown and signal after saving each first accepted click, until the target is reached; no manual Next action is required. Par and Reload stop accepting input and offer **Next repetition** after a resolved repetition so the user can reset before a fresh countdown. Completed attempts and accepted shots are distinct; a par miss consumes an attempt but adds no shot. Late/pre-start events cannot become the next repetition's result.
- Par/free deadlines stop accepting later onsets, then allow up to two seconds for the existing 1.55-second maximum event segment to finish. Show finishing status; judge accepted events by captured onset, not callback/persistence time.
- Repeated/trigger-control use one start signal, continuously accept distinct clicks and finish at the count target. Free practice uses one start signal and finishes at its active-duration limit or explicit End. Pause releases capture; resumed continuous practice excludes paused time and does not compute an interval across the pause.
- Reload defaults to Rack → Magazine change; the two endpoint selectors also offer Draw and Trigger where desired. Distinct endpoints required. Only the endpoint calibration is required; trigger clicks count as shots only when accepted as trigger events, never when a handling label is detected.
- Start source: **App signal** by default or **External beep**. External mode requires three compatible cue examples, waits with the acquired microphone, and starts timing at the detected cue onset. It does not also play the app beep or apply its ready delay.
- CHG-022 waits for actual incoming microphone audio before starting a countdown, monitors the Single countdown, and stores pre-GO triggers as failed attempts with automatic progression; see [practice-start](practice-start.md). The app cue has stronger output. The app-cue input guard is 80 ms, disclosed in Configure/Review; the generated beep and calibrated cue examples are also rejection evidence. Audio offsets start at the scheduled GO reference, with audible-output/device latency limitations stated. Actual beep exclusion and fast-click capture require iPhone validation. Legacy sequences retain their approved 300 ms guard.
- Trigger positives retain the existing three-example minimum, 8–10 recommended, ten new examples maximum per type per gun. Optional reset/noise rejection examples improve discrimination and remain optional, up to ten new examples per category per gun, preserving older over-cap profiles. Calibrated external cues are also rejection evidence for shots. Optional recognized classes have saved per-gun controls; existing trained optional classes are initially enabled to preserve prior behavior.
- Capture compatibility: match both the existing short-segment feature window and the 0.8-second Learn window, with calibrated-negative vetoes across either framing. Preserve stored feature version 2 and old vectors; no destructive retraining migration.
- Similarity-based one-class recognition must have a genuine distance-based rejection rule. Merely removing all-four UI gates is insufficient: the previous classifier requires a competing positive class. Near-identical reset/press acoustics cannot be claimed perfectly distinguishable; expose limits and measured evidence honestly.
- Timing consistency reports detected intervals (mean/range/spread), not physical trigger control. No camera/sensor, raw-audio upload, cloud account, gun deletion or free-plan cap is added.

## Storage and review

Reuse IndexedDB schema 3 and its owned sessions store. Add a discriminated practice-record shape with immutable mode/configuration/gun snapshots, append-only completed outcomes/detections, truthful saving/error/retry, and last-durable-snapshot interruption recovery. Keep old drill records readable. Reuse owned settings for rejection/cue features, optional-label preferences and practice configuration; validate these before atomic restore.

Export backup format 4 containing old/new sessions and calibration/preferences. Accept compatible formats 1–3; disclose whole-library replacement and keep the existing 10 MB import limit. No reset/history trim deletes saved practice results; optional-label changes do not delete examples.

Full sound reset clears the selected gun's positive examples and reset/noise/cue calibration atomically, while preserving sessions, configuration and other guns. Category reset removes only its calibration examples. An unsaved review keeps its Retry action accessible and prevents navigating away until the result is saved; a browser shutdown can recover only the last durable snapshot.

## Revised flow

1. Learn: primary Trigger card, optional sound cards with recognition controls, and reset/noise/external-cue calibration.
2. Drills: six practice cards plus the preserved sequence-drill catalog/custom editor.
3. Practice Configure: mode-relevant target/timing/endpoints/start-source controls and explicit readiness/Start.
4. Practice Run: state, countdown or external-cue waiting, functional **STOP** while running with the real microphone indicator below when capture is active, attempts/clicks/time, Pause/Resume, mode-dependent Next, and End. Paused capture does not show a live meter; End remains available.
5. Review/History: per-gun mode/configuration snapshots, hits/misses/partials, accepted-click intervals and saved-state status.

Reuse the approved dark/orange brand, light/system settings, shared cards and Configure/Run/Review direction. This text flow is the implementation design under the user's explicit automatic-work instruction. Capture the working UI for final feedback; retain older approved mockups as historical references rather than silently replacing them.

## Optimized execution and acceptance

1. **Shared recognition first:** one-class positive matching, rejection calibration, per-mode readiness and optional-label preferences; regression fixtures precede logic changes.
2. **One practice engine and integration:** implement all six mode rules with shared capture/cue/lifecycle/saving/review. Add the discriminated portable record and backup compatibility together, avoiding repeated migrations.
3. **Complete validation and publication:** test deadlines, reset/noise/cue rejection, distinct repeated clicks, pause/background/refresh, gun ownership, old records/backups and atomic invalid imports; check production assets and mobile layouts; publish directly to `main` and update history.
4. **Production/device evidence:** verify deployment when gateway/dashboard evidence becomes available; use the confirmed iPhone Safari/Home Screen target. Hardware observations remain separate from local checks. User reviews final app and supplies feedback; no repeated step confirmations.

The user's third-party-app reference is context, not verified benchmarking or permission to copy artwork. No competitor assets are used. Specifications and implementation history remain under `docs/design`.

## CHG-016 — User feedback: missed triggers and visible microphone input

Approved direct instruction, 2026-10-11: the user reported **“trigger pulls are not recognised”** during a practice mode, then stated **“add indicator”** and **“after a starts it leaves GO button visible, make this button change to microphone level indicator, so it clearly be visible.”** This explicitly authorizes the display correction under the existing automatic-work instruction; no further confirmation is needed.

Corrected direct instruction, 2026-10-11: **“nom replace GO with STOP, after it started, and add microphone indicator bellow”**, followed by **“prepare a design, add designs to github.”** This supersedes the earlier meter-in-place-of-GO layout and authorizes its implementation and design publication without another confirmation.

Design revision: keep the existing Configure / Run / Review layout, gun context, counters, orange brand and timing rules. Before start, the central panel shows countdown/connection. Once active, replace the central GO circle with a prominent orange **STOP** button. Directly below STOP, show a microphone icon/label, input-level bar and numeric relative level driven by captured PCM. STOP ends capture and saves completed and partial results; hide the duplicate bottom End Practice action while STOP is visible. Pause remains below the latest result. External-cue waiting also shows STOP and input while retaining its waiting explanation; timing starts only on the calibrated cue. Pause/result/finishing show their explicit state and do not present an active meter. The active screen marks the start in silent mode; app beep scheduling is unchanged. Expose matched versus heard-but-unmatched feedback so the user can distinguish received audio from recognition. No fake animated input, probability label or raw-audio persistence. Capture stops/reset states clear the level. See the [revised Run design](../design/archive/chg-016/practice-input.md); preserve earlier approved screenshots.

Recognition corrections within PRACTICE-02/11: preserve all saved feature-version-2 examples, normalize microphone gain for comparison, ignore the click's arbitrary position within its recording window, account for the half-frame alignment of brief clicks, retain captured room background in compatible streaming windows and align the detector's minimum peak with accepted Learn captures. Distance rejection and calibrated-negative vetoes remain; near-identical reset/press sounds may still be rejected together. These restore intended recognition rather than changing shot-count semantics.

Acceptance: expected-failing early-capture, gain-change, quiet-click and room-noise regressions pass; distinct reset/noise/cue and ambiguous-negative rejection remain tested; a short input spike appears on the meter; pause/end stop input and clear the display; a saved legacy model works without retraining; all six practice modes/mobile themes use the same input display; updated service-worker cache preserves IndexedDB. Real iPhone accuracy/deployment are recorded separately from synthetic checks. Earlier approved screens remain preserved; revised actual Run captures are in the design catalog and published in `9b24b7d`. Implementation: locally complete. Final Node 22 acceptance: **227 Jest / 17 suites**, **16 smoke**, build/asset checks and **seven browser suites / 35 checks**, zero page errors. [Validation](../development/PRACTICE_VALIDATION.md) records source output and remaining release evidence.

## Current design mapping

See [Practice screen and all six mode configurations](../design/screens/practice/README.md), [Learn](../design/screens/learn/README.md), [Drills](../design/screens/drills/README.md) and [History](../design/screens/history/README.md). Current captures reflect CHG-017; older CHG-015/016 images are archived evidence, not the latest run state.
