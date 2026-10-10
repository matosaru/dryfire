# Drill selection, configuration and sessions

Revision: 1.0 · Scope: requested by the user · Implementation: partial

The current app has built-in drill selection and continuous sequence recognition. A dedicated configurable session runner, custom editor and saved repetition results are not yet implemented.

Design: [current Configure / Run / Review mockup](../design/drill-session-mockup.png). Approval evidence and unresolved details are recorded in [CHG-002](approval-log.md#chg-002--dedicated-drill-sessions), [CHG-004](approval-log.md#chg-004--show-the-sequence-once) and [CHG-005](approval-log.md#chg-005--optional-start-sound-clarification).

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

## Proposed interaction details awaiting confirmation

- Use one page with **Configure**, **Run** and **Review** states.
- Allow a repetition target, fixed delay or random minimum/maximum, with clear numeric validation. The mockup's ten repetitions and two-to-five-second delay are examples, not mandated defaults.
- Apply a new delay before each repetition, show a countdown and a visual **GO**, and advance automatically after displaying a completed result.
- Rename the ambiguous **Start cue** toggle to **Sound at start**, with **Play a beep when GO appears** underneath. On plays a short beep at GO; off is silent. The visual countdown and GO remain present in both modes. This setting does not enable recording or replace Start Session.
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
7. If the start-sound proposal is approved, both beep-on and silent modes retain the visual start signal; the generated beep must not be recorded as a learned action.
