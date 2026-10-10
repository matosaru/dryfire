# Drill session page — proposed design

![Drill session mockup: Configure, Run, and Review](drill-session-mockup.png)

This mockup proposes three states of one dedicated drill page. It is a design proposal; the session flow shown here has not yet been implemented. The authoritative behavior and approval states are in [drill-sessions.md](requirements/drill-sessions.md); see the [design catalog](README.md) and [approval log](requirements/approval-log.md).

- **Configure:** select or edit a drill, set repetitions, choose a fixed or random start delay, and start the session once sound profiles are ready.
- **Run:** show the countdown, completed and remaining repetitions, and the latest repetition result, with Pause and End Session controls.
- **Review:** show the session summary and saved repetition results, with Repeat Session and Back to Drills controls.

Times describe sound detection, not verified physical actions. The mockup contains illustrative sample results.

## Clarified sequence and start controls

- Use **Drill Session** as the page title. Show the complete action sequence once, in the colored sequence strip beneath the title. These chips describe the ordered actions; they are not separate Start buttons.
- Keep the timing breakdowns in a completed repetition's result: they show individual intervals rather than repeating the full drill heading.
- User-approved clarification: rename the ambiguous Start cue control to **Sound at start**, with the explanation **Play a beep when GO appears**.
- With this switch on, play a short beep as each repetition's countdown ends and the visual **GO** signal appears. With it off, show the same countdown and GO signal silently.
- The visual start signal remains available in both modes. The sound switch does not control microphone permission, recording, the start delay or whether a repetition begins.
- Starting the session remains an explicit **Start Session** action. A fixed or random delay is applied before each repetition.
