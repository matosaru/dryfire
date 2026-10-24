# Automatic practice, progress history, navigation and input limits

CHG-032 current public availability is governed by [build editions](build-editions.md): two-gun public creation under CHG-034, no new custom creation or advanced graphs publicly; full preview retains them. Existing data/preset editing/use/export/restore remain available. This overrides earlier all-free availability statements for these actions without implementing billing or deleting data. Publication/deployment are tracked separately.

Revision 1.2 · CHG-017 · 2026-10-11

Approval: automatic single-click repetition, statistical/graphical history, no new unknown-detection records and logical screen history are **approved by direct user instruction**. Recording/numeric limits below are **approved** by the user's explicit reply “Approve all proposed limits” to the complete table, including preservation of older over-cap profiles. Existing automatic-work and direct-main instructions remain in force for approved scope.

## Outcome and execution plan

1. Numeric audit/review complete: the complete table below was approved explicitly before limit source edits or code push.
2. Fix Single trigger press with automatic, freshly timed repetitions through the shared engine/controller. Save each result before advancing, show seconds until the next signal, play a fresh beep when Sound at start is enabled (default On), then accept the first matching trigger. Default timing remains random 2–5 seconds; explicitly selected fixed timing and external-cue behavior remain meaningful.
3. Stop adding unknown/unmatched live detections to new recent recognition history or new saved session detections. Keep transient microphone/match feedback, explicit rejection/noise calibration, and previous saved records intact. Known out-of-order events remain reviewable. The sentence “this information is useful” does not override the explicit instruction “Do not record unknown sounds”; no historical deletion is inferred.
4. Add a gun-specific History progress section derived from saved sessions, with a drill/mode selector, time-range selector, statistical cards, trend chart and accessible data table. Compute it from existing local data; no schema migration or extra chart dependency is needed.
5. Add app and browser screen history: Back returns to the actual prior screen, Forward restores a valid screen, duplicate navigation is ignored, and leaving active capture stops/saves it. Invalid/stale practice contexts return to Drills; inaccessible gun contexts return to current Home/onboarding. Unsaved results keep their existing recovery guard. Refresh never restarts microphone capture.
6. Enforce the approved bounds consistently in controls and validated save/start/record paths, preserving old compatible records/backups. Run baseline/regression/full CI checks and focused browser checks, publish directly to main, capture revised screens, and update delivery status with observed outcomes.

## Requirements

| ID | Requirement | Approval |
| --- | --- | --- |
| UPDATE-01 | Single click automatically completes all configured repetitions, with a fresh configured delay/countdown and signal before each; each repetition records its first accepted trigger only | Direct instruction |
| UPDATE-02 | Countdown is visible between repetitions; completion/remaining counts and STOP/Pause work during the waiting interval; saved results survive refresh | Direct instruction |
| UPDATE-03 | Unknown/unmatched/rejected live detections are transient and add no new history/session detection records. Preserve existing history, positive events and intentional calibration | Direct instruction |
| UPDATE-04 | History shows per-gun, comparable-session statistics and graphical trends, with truthful insufficient-data states and accessible alternatives | Direct instruction |
| UPDATE-05 | App Back and browser Back/Forward follow visited screens, stop/save active capture, avoid duplicate entries and honor ownership/unsaved-result guards | Direct instruction |
| UPDATE-06 | An unconfirmed capture action opens an accessible safety modal; explicit acknowledgement continues the original action once, with cancel/stale-intent protection | Direct instruction |
| LIMIT-01 | New positive recordings are capped at 10 for each sound type per gun; proposed equivalent per-category cap for rejection/cue calibration | Approved complete-table reply |
| LIMIT-02 | Every numeric input has the reviewed bounds/steps and helpful errors; blank, nonfinite, fractional integer and out-of-range values do not start/save invalid settings | Approved complete-table reply |
| LIMIT-03 | Existing compatible data above a new recording cap remains intact and restorable; no silent truncation, replacement or destructive migration | Approved complete-table reply and preservation requirement |

## Approved limits

There are **11 numeric input controls**: six in Practice, four in legacy Drill Session and one in History. No numeric microphone-sensitivity input exists; its setting is Low/Medium/High. The meter is output, not editable. Most suggested numeric bounds already exist; this change makes their validation/errors consistent and reviews them explicitly.

| Input(s) | Suggested allowed values | Default / notes |
| --- | --- | --- |
| Positive recording examples: Trigger, Draw, Rack, Magazine, separately for each gun | 10 maximum per type | 3 needed to recognize; 8–10 recommended |
| Reset, background-noise and external-beep calibration examples, separately per gun/category | 10 maximum per category | Optional; external-beep start needs 3 cue examples |
| Practice repetitions/click target (`practiceRepetitions`); Drill Session repetitions (`sessionRepetitions`) | 1–100, whole numbers | 10 |
| Par-time seconds (`practicePar`) | 0.1–30, steps of 0.1 seconds | 1.5 |
| Fixed start-delay seconds (`practiceFixedDelay`, `sessionFixedDelay`) | 0–30, steps of 0.1 seconds | 3; zero deliberately permits immediate start |
| Random minimum seconds (`practiceMinDelay`, `sessionMinDelay`) | 0–30, steps of 0.1 seconds | 2; must not exceed maximum |
| Random maximum seconds (`practiceMaxDelay`, `sessionMaxDelay`) | 0–30, steps of 0.1 seconds | 5; must not be below minimum |
| Recent recognized results retained (`maxResults`) | 1–500, whole numbers | 50; applies only to recent event history, never saved drill sessions/statistics |

Approved recording-cap preservation: keep profiles with more than 10 existing examples usable/exportable/restorable. Block **additional** recording for a category already at or above 10, with count and explanation. Never delete older examples automatically or reject an otherwise compatible older backup solely for exceeding the new recording cap. Intentional category/full resets retain their existing confirmations. No free-version one-gun limit is introduced.

## Progress and visual design

History order: selected-gun context → **Practice progress** → mode/drill and range selectors → metrics → trend chart/table → existing saved-session list → recent recognized events/verified recognition quality.

Statistics use completed repetitions from saved sessions. Group by gun, practice mode or exact sequence, and comparable settings that materially affect scoring (e.g. par time, reload endpoints, start source and beep policy). Do not combine single-click reaction times with repeated-click intervals or reload times. Interrupted sessions may contribute completed rows only; partial rows do not become successes.

- Single: session median/mean signal-to-click time, sample count and timing spread; graph session medians over dates. Lower detected time indicates faster observed timing.
- Par: hit rate, hit/miss counts and in-time reaction median. Graph success rate; display par setting and misses so a faster subset cannot hide declining success.
- Repeated/control: median/mean consecutive accepted-click interval and spread. Show interval consistency as measured timing, without technique/movement claims.
- Reload/legacy sequences: completed sequence or endpoint durations, median/mean/spread, exact sequence context.
- Free: recognized clicks per active minute and session duration/count, without calling a higher rate better trigger technique.

Compare the recent half of at least four comparable sessions with the earlier half using medians; show direction/percentage in the metric's own terms (faster/slower, higher/lower hit rate, steadier/more variable intervals). With less data, show “More sessions needed” and the actual available count. Chart points include dates/values; provide an expandable text table and empty states. Statistics describe recognized audio and cannot establish missed-click rate or physical accuracy. Omitting unknown detections narrows retained-event verification; disclose that limitation.

Run design: after a Single hit, the completed result remains visible in Latest result while the central panel displays the next countdown, then STOP and microphone input again. No Next button is required for app-start Single mode. Par/Reload retain their explicit Next behavior; repeated/control/free retain continuous listening. Single external-cue mode automatically waits for a fresh calibrated external beep and never generates a competing app beep.

Navigation design: Home → Drills → Practice → Back returns Drills; History → saved Review → Back returns History; Learn → Settings → Back returns Learn. Main tabs remain available. Browser navigation produces the same safe outcomes. Keep the current dark/orange and light/system themes, existing branding and older approved screens.

The existing Settings shortcut remains reachable in each screen's compact heading, so Learn → Settings is an actual user action. Back buttons are labelled for the previous screen. The safety disclosure reports whether the current page/session acknowledgement is confirmed; this does not replace the explicit modal acknowledgement.

## Acceptance

- Regression before fix: a first Single hit remains in result until manually advanced; the corrected engine/controller automatically counts exactly the target across fresh signals, ignores input before countdown ends, and retains each durable result.
- Beep once per start, actual countdown, random-delay bounds, first-click-only behavior, pause/stop during countdown, storage failure/late callbacks and interrupted refresh are covered. External cues remain non-shot events.
- New unknown input leaves durable event/session detection collections unchanged while live feedback still works. Known positives, prior unknown records, calibration, ownership, backups and resets remain compatible.
- Statistical fixtures independently verify metrics, empty/insufficient data, comparability, gun isolation, misses/partials, dates and improvement direction; browser layouts/charts/table work at mobile widths and both themes.
- Navigation fixtures cover Back/Forward, duplicate suppression, stale context, gun changes, capture cleanup and unsaved-result protection. No capture restarts from refresh/history traversal.
- After approval, each numeric boundary/invalid input and concurrent cap recording is checked; existing over-cap backups/models remain preserved. Final CI and publication/deployment/device outcomes are recorded separately.

## Added direct request — safety confirmation modal

Revision 1.2 addition, 2026-10-11: the user explicitly requested a clearly visible safety modal when a drill or other action is started without confirmation, and continuation of the requested action after confirming. UPDATE-06 is directly approved; it does not reopen the approved numeric table.

Before microphone permission/capture, display a native accessible modal with the existing safety checklist and explicit acknowledgement. Confirm is disabled until acknowledged. Confirmation updates the existing page/session safety state and automatically continues the originally requested Train/Test/Listen/Start/Resume action once. Cancel performs no action and acquires no microphone. Confirm once per current page/app session; a refresh/new page requires fresh acknowledgement, and switching the selected gun also resets the existing acknowledgement. This preserves existing nonpersistent safety behavior. Do not create a permanent legal waiver or suggest that the microphone verifies safety. Pending actions retain their gun/screen ownership; cancelled/stale intents cannot start capture. Keep the existing visible safety disclosure available for review.

Acceptance: unconfirmed capture actions open the dialog without requesting a microphone; keyboard/VoiceOver labels and modal focus work; Cancel leaves capture stopped; confirming proceeds once; subsequent actions in that page do not prompt again; refresh resets acknowledgement; leaving/cancelling never starts a stale action.

## Implemented screen references

Actual local production captures, 2026-10-11: [automatic countdown](../design/archive/chg-017/practice/countdown.png), [safety modal](../design/archive/chg-017/shared/safety-modal.png), [recording limit/preserved old profile](../design/archive/chg-017/learn/recording-limit.png), [Dark progress](../design/archive/chg-017/history/progress.dark.png), [Light progress](../design/archive/chg-017/history/progress.light.png). Test names/counts/timings are illustrative. Earlier approved images remain preserved; these new captures implement the directly requested scope and the separately approved limits. [Validation](../development/PRACTICE_VALIDATION.md) and [delivery tracker](../project/implementation-history.md) distinguish local tests, publication, CI, production and physical-device results.
