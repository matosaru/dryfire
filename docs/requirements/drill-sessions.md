# Drill selection, configuration and sessions

CHG-032 current public availability is governed by [build editions](build-editions.md): two-gun public creation under CHG-034, no new custom creation or advanced graphs publicly; full preview retains them. Existing data/preset editing/use/export/restore remain available. This overrides earlier all-free availability statements for these actions without implementing billing or deleting data. Publication/deployment are tracked separately.

Revision: 1.6 · Scope: CHG-014 delivered; CHG-015 optional readiness/practice extension authorized · Implementation: legacy sequences and four trigger practices implemented; deployment/device evidence separate

The current app has built-in/custom drill selection, separate free listening and the approved configurable session runner with durable repetition results/start cue. CHG-014 is implemented and locally validated on 2026-10-11; GitHub publication, production deployment and physical-device verification remain separately tracked in [implementation history](../project/implementation-history.md).

Current designs: [sequence Configure / Run / Review](../design/screens/session/README.md) and [Drills/custom editor](../design/screens/drills/README.md). The [CHG-014 mockup](../design/archive/chg-014/proposals/session-flow.png) is historical visual evidence. Approval evidence is recorded in [CHG-002](../project/approval-log.md#chg-002--dedicated-drill-sessions), [CHG-004](../project/approval-log.md#chg-004--show-the-sequence-once), [CHG-005](../project/approval-log.md#chg-005--optional-start-sound-clarification), [CHG-008](../project/approval-log.md#chg-008--start-sound-approved) and the appended CHG-014 confirmation. The [approved implementation plan](history/chg-014-approved-plan.md) records the concrete reviewed controls/defaults without replacing that visual direction.

| ID | Requirement | State |
| --- | --- | --- |
| DRILL-01 | Once required sounds are trained, allow the user to select a built-in drill or create a custom drill, then start it. | Approved; CHG-014 |
| DRILL-02 | Provide an editable drill configuration and an explicit Start button. | Approved; CHG-014 |
| DRILL-03 | Allow fixed or random timing until a drill begins. | Approved; CHG-014 |
| DRILL-04 | Display completed and remaining drill counts. | Approved; CHG-014 |
| DRILL-05 | Store and show information after each completed repetition. Results remain available to the user afterward. | Approved; CHG-014 |
| DRILL-06 | Custom drills have an editable action sequence and saved presets belonging to the selected gun. | Approved by direct instruction; implemented |
| DRILL-07 | Keep the full sequence visible once. Use **Drill Session** as the generic heading and a single ordered sequence strip. Timing splits inside a result are separate information. | Explicitly requested revision |
| DRILL-08 | Label reported timings as sound-detection timings. Do not imply verification of physical actions. | Existing accuracy constraint |
| DRILL-09 | **Sound at start** controls only a short beep when GO appears. On plays the beep; off starts silently. The visual countdown and GO remain present in both modes. | Approved by the user |

CHG-017 additionally approves the safety modal, consistent numeric bounds and no new durable unknown-detection records, while preserving known out-of-order results and older session snapshots. The automatic Single behavior belongs to the separate practice engine; legacy sequence progression remains unchanged. See [approved improvements](practice-improvements.md).

## Approved start-sound clarification

The user approved **Sound at start** with “Sound at start is ok.” Use **Play a beep when GO appears** as helper text. The setting controls the beep only; it does not enable microphone access, change the delay or replace Start Session. See CHG-008 for the original approval and CHG-014 for the approved default/cue guard below.

## Custom preset implementation slice

DRILL-06 implements the user's earlier explicit instruction that custom drills need a sequence editor and saved presets. The editor accepts a nonblank preset name and a nonempty ordered sequence of the existing `draw`, `rack`, `trigger` and `reload` actions. Repeated actions are allowed; controls can add, remove and reorder actions. Saved presets belong to one gun, can be edited, and are selectable alongside the unchanged built-in drills. Selected drill ownership is preserved after a refresh.

Routine validation trims the title to 1–80 characters and accepts 1–32 actions. Custom stable IDs must not collide with built-in IDs; unknown action IDs and empty sequences are rejected before saving.

CHG-012 starting a selected preset used the explicit, safety-gated continuous recognition flow. That delivery did not implement fixed/random starts, repetition targets, countdown/GO, beep, pause/end rules or dedicated session summaries. CHG-014 implements those separately approved session features; the custom preset editor continues saving the name and action sequence, while session configuration is saved for its gun.

Acceptance for this slice: a preset saved for gun A reopens after reload and cannot appear in or affect gun B; editing its name/order updates that preset; repeated actions retain their order; a preset with a blank name or empty sequence cannot be saved; built-in definitions remain intact; only the selected gun's trained model is used during recognition.

## Approved Configure, Run and Review behavior

The user explicitly replied **“proceed”** after publication of [CHG-014 revision 1.0](https://github.com/matosaru/dryfire/blob/ebac22b/docs/design/requirements/next-implementation.md). These choices are approved rather than inferred from earlier mockup publication.

- Retain the selected gun/current brand and **Configure**, **Run**, **Review** states. Use the heading **Drill Session** and one ordered full-sequence strip. Review timing splits are separate measured information.
- Default to **10 repetitions**, **fixed 3-second delay**, **Sound at start Off**. Switching to Random initially offers **2–5 seconds**. Validate repetitions 1–100, delays 0–30 seconds in tenths, and random minimum no greater than maximum. Save configuration for the selected gun.
- Start requires the current page-session safety confirmation and at least three compatible examples of each sound type referenced by the sequence. Explain missing training and link to Learn. Acquire the microphone before the first countdown.
- Apply a fresh fixed/random delay before every repetition, show countdown and **GO**, display a completed result for one second, then advance automatically. Finish at the target. Only a complete detected ordered sequence increases Completed/decreases Left; unknown sounds never advance, and known out-of-order sounds reset partial recognition and are retained for review.
- Lock configuration and gun switching while running or paused. Pause releases the microphone and abandons the unfinished attempt without increasing Completed; retain its partial outcome. Resume reacquires the microphone and starts that repetition with a fresh countdown. Completed results remain saved.
- End, leaving the session, backgrounding, microphone failure or refresh saves incomplete/interrupted status accurately. Refresh opens saved results and never automatically restarts the microphone. Recover abrupt shutdown from the last durable snapshot.
- Optional beep plays when visual GO appears; silent mode also shows GO. In beep mode suppress/reset detector input during a **300 ms cue guard** to exclude the synthetic cue; report that very fast sounds in this guard may be missed. Timings still start at visual GO; silent mode has no guard.
- Save gun/drill identity and title/sequence/configuration snapshots, timestamps/status, completed/partial outcomes, accepted known detected events, out-of-order counts and relative sound-detection timings/splits. New unknown/unmatched events are transient; retain older saved unknown observations. Later preset edits do not rewrite past sessions. Persist completed results before advancing.
- Review shows saved repetition details, Repeat Session and Back to Drills. Selected-gun History reopens sessions. Sound reset and recent-recognition trimming/clearing preserve them. Vibration, when explicitly enabled and supported, is requested at GO/completion according to [settings.md](settings.md).

Exact approved scope is in [next-implementation.md](history/chg-014-approved-plan.md); separate cloud/free-cap/profile-deletion/new-taxonomy scope remains excluded. Approval does not establish implementation or device validation.

## CHG-015 extension

The [consolidated practice plan](practice-modes.md) adds six modes and makes non-trigger classes optional. For sequence drills, readiness depends on the referenced steps instead of all four classes; preserve ordered definitions and old results. The historical CHG-014 all-four rule is superseded; the current Configure behavior above requires only referenced types. New practice defaults and cue policy are recorded separately and do not rewrite old session snapshots.

## Acceptance criteria for requested scope

1. A trained gun can reach configuration from either a selected built-in preset or its saved custom preset.
2. Start is available when the selected gun meets training and safety prerequisites; otherwise explain what is missing.
3. Changes to supported configuration affect the subsequent session, including fixed/random timing.
4. Completed/remaining counts reflect actual session outcomes and never increment for an unknown event alone.
5. Completed repetition information is saved against the same gun and session and can be read after a refresh.
6. The full action sequence is not duplicated in the page title and strip.
7. Both beep-on and silent modes retain the visual start signal; the generated beep must not be recorded as a learned action.


## Distinct sequence catalog — CHG-052

DRILL-10: Display the three multi-action built-in sequences (Rack → Trigger, Magazine → Trigger, Draw → Magazine → Trigger). Do not display the duplicate standalone Trigger pull card; Single trigger press remains in Dry-fire practice. Preserve the legacy `trigger-only` identifier, saved sessions, history/repeat and imported data. Existing custom one-action presets remain accessible. This is a catalog change, not a storage migration.
