# Drill selection, configuration and sessions

Revision: 1.2 · Scope: requested by the user · Implementation: partial; custom presets implemented and locally validated (CHG-012), dedicated sessions pending

The current app has built-in drill selection and continuous sequence recognition. CHG-012 implements a gun-owned custom sequence editor and saved presets. A dedicated configurable session runner and saved repetition results remain pending.

Design: [current Configure / Run / Review mockup](../drill-session-mockup.png). Approval evidence and unresolved details are recorded in [CHG-002](approval-log.md#chg-002--dedicated-drill-sessions), [CHG-004](approval-log.md#chg-004--show-the-sequence-once) and [CHG-005](approval-log.md#chg-005--optional-start-sound-clarification) and [CHG-008](approval-log.md#chg-008--start-sound-approved).

| ID | Requirement | State |
| --- | --- | --- |
| DRILL-01 | Once required sounds are trained, allow the user to select a built-in drill or create a custom drill, then start it. | Requested |
| DRILL-02 | Provide an editable drill configuration and an explicit Start button. | Requested |
| DRILL-03 | Allow fixed or random timing until a drill begins. | Requested |
| DRILL-04 | Display completed and remaining drill counts. | Requested |
| DRILL-05 | Store and show information after each completed repetition. Results remain available to the user afterward. | Requested |
| DRILL-06 | Custom drills have an editable action sequence and saved presets belonging to the selected gun. | Requested |
| DRILL-07 | Keep the full sequence visible once. Use **Drill Session** as the generic heading and a single ordered sequence strip. Timing splits inside a result are separate information. | Explicitly requested revision |
| DRILL-08 | Label reported timings as sound-detection timings. Do not imply verification of physical actions. | Existing accuracy constraint |
| DRILL-09 | **Sound at start** controls only a short beep when GO appears. On plays the beep; off starts silently. The visual countdown and GO remain present in both modes. | Approved by the user |

## Approved start-sound clarification

The user approved **Sound at start** with “Sound at start is ok.” Use **Play a beep when GO appears** as helper text. The setting controls the beep only; it does not enable microphone access, change the delay or replace Start Session. See CHG-008 for the approval record. Other proposed session details below retain their existing status.

## Custom preset implementation slice

DRILL-06 implements the user's earlier explicit instruction that custom drills need a sequence editor and saved presets. The editor accepts a nonblank preset name and a nonempty ordered sequence of the existing `draw`, `rack`, `trigger` and `reload` actions. Repeated actions are allowed; controls can add, remove and reorder actions. Saved presets belong to one gun, can be edited, and are selectable alongside the unchanged built-in drills. Selected drill ownership is preserved after a refresh.

Routine validation trims the title to 1–80 characters and accepts 1–32 actions. Custom stable IDs must not collide with built-in IDs; unknown action IDs and empty sequences are rejected before saving.

Starting a selected preset uses the current explicit, safety-gated continuous recognition flow. This does not implement fixed/random starts, repetition targets, countdown/GO, the approved beep, pause/end rules or dedicated session summaries. Editable session defaults in the design remain proposed; the current custom editor only saves the requested name and action sequence.

Acceptance for this slice: a preset saved for gun A reopens after reload and cannot appear in or affect gun B; editing its name/order updates that preset; repeated actions retain their order; a preset with a blank name or empty sequence cannot be saved; built-in definitions remain intact; only the selected gun's trained model is used during recognition.

## Proposed interaction details awaiting confirmation

- Use one page with **Configure**, **Run** and **Review** states.
- Allow a repetition target, fixed delay or random minimum/maximum, with clear numeric validation. The mockup's ten repetitions and two-to-five-second delay are examples, not mandated defaults.
- Apply a new delay before each repetition, show a countdown and a visual **GO**, and advance automatically after displaying a completed result.
- Lock configuration while a session is running. Offer Pause and End Session, with explicit interruption/resume rules.
- Save session identity, selected gun, expected sequence, start/end timestamps, each repetition's outcome, detections, sound-detection timings and unknown/out-of-order events.
- Show a final summary, expandable repetition records, Repeat Session and Back to Drills. Save incomplete sessions accurately rather than reporting them as completed.
- Provide a selected-gun custom editor with a name, ordered actions, repeated actions, reorder/remove controls and editable session defaults.

These details must receive explicit approval before they are treated as fixed requirements. The user requesting publication of the revised mockup authorizes publication; it does not approve every proposed interaction.

## Acceptance criteria for requested scope

1. A trained gun can reach configuration from either a selected built-in preset or its saved custom preset.
2. Start is available when the selected gun meets training and safety prerequisites; otherwise explain what is missing.
3. Changes to supported configuration affect the subsequent session, including fixed/random timing.
4. Completed/remaining counts reflect actual session outcomes and never increment for an unknown event alone.
5. Completed repetition information is saved against the same gun and session and can be read after a refresh.
6. The full action sequence is not duplicated in the page title and strip.
7. Both beep-on and silent modes retain the visual start signal; the generated beep must not be recorded as a learned action.
