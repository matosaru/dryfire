export const GUIDE_MANUALS = [
  {
    "id": "single",
    "kind": "practice",
    "title": "Single trigger press",
    "purpose": "Measure the time from each start signal to your first recognized trigger click.",
    "measures": "Reaction time per attempt, plus completed and failed attempts.",
    "steps": [
      "Choose repetitions and a fixed or random ready delay.",
      "Start, watch the countdown and wait for the signal before one trigger press.",
      "Read the result. A fresh countdown starts automatically until the target is reached."
    ],
    "expect": "A recognized trigger before the app signal fails that attempt. Each attempt accepts one click.",
    "requires": "Learn Trigger pull for the selected gun. Other sound types are optional.",
    "stages": [
      "Microphone ready",
      "2.4 s countdown → beep",
      "Click at 0.50 s",
      "Automatic 3.2 s countdown → second beep → 0.60 s click"
    ],
    "sequence": [
      "trigger"
    ],
    "exampleConfig": "2 attempts · random 2–5 s delay · app beep on"
  },
  {
    "id": "repeated",
    "kind": "practice",
    "title": "Repeated trigger presses",
    "purpose": "Count separate recognized trigger clicks and see the time between them.",
    "measures": "Accepted click count and the intervals between consecutive clicks.",
    "steps": [
      "Choose the number of clicks and your ready delay.",
      "After one start signal, perform separate trigger presses as your equipment permits.",
      "Listening continues without a new beep for every click. Review appears at the target."
    ],
    "expect": "Reset and handling sounds should not count as shots. Pause stops capture; Resume excludes paused time.",
    "requires": "Learn Trigger pull. Optional reset/noise examples can help reject other clicks.",
    "stages": [
      "Microphone ready",
      "2.4 s countdown → one beep",
      "Three clicks: 0.50 / 1.30 / 2.10 s",
      "Two intervals: 0.80 / 0.80 s"
    ],
    "sequence": [
      "trigger",
      "trigger",
      "trigger"
    ],
    "exampleConfig": "3 clicks · random 2–5 s delay · app beep on"
  },
  {
    "id": "par",
    "kind": "practice",
    "title": "Par-time practice",
    "purpose": "Check whether a recognized trigger click arrives within your chosen time limit.",
    "measures": "Time from the start signal to a click, with an in-time or missed outcome.",
    "steps": [
      "Set a par time, repetitions and ready delay.",
      "Wait for the signal, then make one trigger press within the limit.",
      "Read the result, then select Next repetition when ready for another countdown."
    ],
    "expect": "No accepted click by the deadline is a miss. The app may briefly finish processing audio captured before the deadline.",
    "requires": "Learn Trigger pull. Example: a 0.64 s click is in time for a 1.50 s limit.",
    "stages": [
      "Microphone ready",
      "Countdown → beep → 0.60 s hit within 1.50 s",
      "User selects Next repetition",
      "Fresh countdown → beep → no click → miss"
    ],
    "sequence": [
      "trigger"
    ],
    "exampleConfig": "2 attempts · random 2–5 s delay · app beep on"
  },
  {
    "id": "control",
    "kind": "practice",
    "title": "Trigger control",
    "purpose": "Compare how consistent the timing is between your recognized trigger clicks.",
    "measures": "Click intervals and their timing spread. It does not measure firearm movement.",
    "steps": [
      "Choose a click target and ready delay.",
      "After the start signal, perform separate presses at a comfortable, repeatable pace.",
      "Keep going until the target, then compare the recorded intervals in review."
    ],
    "expect": "One signal starts continuous listening. A microphone cannot grade aim, movement or trigger technique.",
    "requires": "Learn Trigger pull. Optional reset/noise calibration can improve discrimination.",
    "stages": [
      "Microphone ready",
      "2.4 s countdown → one beep",
      "Three distinct clicks",
      "0.80 s intervals → review"
    ],
    "sequence": [
      "trigger",
      "trigger",
      "trigger"
    ],
    "exampleConfig": "3 clicks · random 2–5 s delay · app beep on"
  },
  {
    "id": "reload",
    "kind": "practice",
    "title": "Reload practice",
    "purpose": "Measure the time between two mechanical sounds you choose.",
    "measures": "Elapsed time between the first and second recognized event, in that order.",
    "steps": [
      "Choose two different sound endpoints, such as Rack slide and Change magazine.",
      "After the signal, perform the selected actions in the displayed order.",
      "Read the interval, then select Next repetition when ready to continue."
    ],
    "expect": "Handling events are not shots. Only an explicitly selected Trigger endpoint can add an accepted shot.",
    "requires": "Learn both selected endpoint sounds. Trigger is needed only when it is a selected endpoint.",
    "stages": [
      "Microphone ready",
      "Countdown → beep",
      "Rack at 0.40 s → Magazine at 1.60 s",
      "1.20 s interval → user selects Next → repeat"
    ],
    "sequence": [
      "rack",
      "reload"
    ],
    "exampleConfig": "2 attempts · random 2–5 s delay · app beep on"
  },
  {
    "id": "free",
    "kind": "practice",
    "title": "Free practice",
    "purpose": "Practice for a chosen duration without a fixed click target.",
    "measures": "Total recognized trigger clicks and active practice time.",
    "steps": [
      "Choose the session duration and ready delay.",
      "After one start signal, practice at your own pace while the app counts clicks.",
      "The session ends at the duration limit. You can also use STOP to save and finish early."
    ],
    "expect": "Pause stops microphone capture and pauses active time. There is no new beep for each click.",
    "requires": "Learn Trigger pull. No extra mechanical sound categories are required.",
    "stages": [
      "Microphone ready",
      "Countdown → one beep",
      "Three clicks during a 6 s example session",
      "Deadline → finish captured audio → 3 clicks in 6 s"
    ],
    "sequence": [
      "trigger",
      "trigger",
      "trigger"
    ],
    "exampleConfig": "6 s duration · random 2–5 s delay · app beep on"
  },
  {
    "id": "sequence-trigger-only",
    "kind": "sequence",
    "title": "Trigger pull sequence",
    "setupTitle": "Trigger pull",
    "purpose": "Complete a one-step ordered drill by matching the learned trigger sound after the signal.",
    "measures": "Signal-to-click time for each completed sequence repetition.",
    "steps": [
      "Choose repetitions and the sequence runner's ready delay.",
      "After the start signal, make one trigger press for the displayed Trigger pull step.",
      "Read the result. The sequence runner begins a new countdown until the target is reached."
    ],
    "expect": "This is the legacy ordered runner, not Single practice. It does not mark pre-signal clicks as failed Single attempts.",
    "requires": "Learn Trigger pull. Sounds in the initial 0.30 s after the app beep are excluded to reject the cue.",
    "stages": [
      "Microphone connected",
      "2.4 s countdown → beep",
      "trigger",
      "Result → automatic 3.2 s countdown → repeat"
    ],
    "sequence": [
      "trigger"
    ],
    "exampleConfig": "2 attempts · random 2–5 s delay · app beep on"
  },
  {
    "id": "sequence-rack-trigger",
    "kind": "sequence",
    "title": "Rack slide → Trigger pull",
    "purpose": "Complete the learned Rack slide and Trigger pull sounds in the displayed order.",
    "measures": "Time from the start signal to sequence completion, plus the time at each matched step.",
    "steps": [
      "Learn both listed sounds, then choose repetitions and ready delay.",
      "After the signal, complete Rack slide followed by Trigger pull.",
      "Read the matched-step result. A fresh countdown begins automatically for the next repetition."
    ],
    "expect": "Only recognized sounds in the displayed order complete a repetition. End Session stops capture and saves results.",
    "requires": "Learn Rack slide and Trigger pull. The first 0.30 s after the app beep is ignored to reject the beep.",
    "stages": [
      "Microphone connected",
      "2.4 s countdown → beep",
      "rack → trigger",
      "Result → automatic 3.2 s countdown → repeat"
    ],
    "sequence": [
      "rack",
      "trigger"
    ],
    "exampleConfig": "2 attempts · random 2–5 s delay · app beep on"
  },
  {
    "id": "sequence-mag-trigger",
    "kind": "sequence",
    "title": "Magazine change → Trigger pull",
    "purpose": "Complete the learned magazine-change and trigger sounds in the displayed order.",
    "measures": "Signal-to-completion time and the detected timing of each sequence step.",
    "steps": [
      "Learn Change magazine and Trigger pull, then set repetitions and ready delay.",
      "After the signal, complete Magazine change followed by Trigger pull.",
      "Read the result. The next repetition starts with a fresh countdown automatically."
    ],
    "expect": "A magazine sound does not count as a shot. A repetition completes only when its ordered sounds match.",
    "requires": "Learn Change magazine and Trigger pull. The first 0.30 s after the app beep is ignored to reject the beep.",
    "stages": [
      "Microphone connected",
      "2.4 s countdown → beep",
      "reload → trigger",
      "Result → automatic 3.2 s countdown → repeat"
    ],
    "sequence": [
      "reload",
      "trigger"
    ],
    "exampleConfig": "2 attempts · random 2–5 s delay · app beep on"
  },
  {
    "id": "sequence-draw-mag-trigger",
    "kind": "sequence",
    "title": "Draw → Magazine → Trigger",
    "setupTitle": "Draw from holster → Magazine change → Trigger pull",
    "purpose": "Match the three learned sounds in one ordered sequence.",
    "measures": "Time from the signal to the final recognized trigger, plus detected step timings.",
    "steps": [
      "Learn all three listed sounds, then choose repetitions and ready delay.",
      "After the signal, complete the displayed Draw, Magazine change and Trigger pull sequence.",
      "Read the result. The runner automatically starts a fresh countdown for the next repetition."
    ],
    "expect": "Sound matching confirms an acoustic order only. It cannot verify how a physical action was performed.",
    "requires": "Learn Draw, Change magazine and Trigger pull. The first 0.30 s after the app beep is ignored to reject the beep.",
    "stages": [
      "Microphone connected",
      "2.4 s countdown → beep",
      "draw → reload → trigger",
      "Result → automatic 3.2 s countdown → repeat"
    ],
    "sequence": [
      "draw",
      "reload",
      "trigger"
    ],
    "exampleConfig": "2 attempts · random 2–5 s delay · app beep on"
  },
  {
    "id": "sequence-custom",
    "kind": "sequence",
    "title": "Your saved sequence",
    "setupTitle": "My practice sequence",
    "purpose": "Match the sounds in your selected saved drill, in the order you defined.",
    "measures": "Signal-to-completion time and detected timings for the steps in this preset.",
    "steps": [
      "Check the selected preset's actual steps and learn each required sound.",
      "Choose repetitions and delay, then follow that displayed order after the signal.",
      "A matching sequence completes a repetition; the next countdown starts automatically."
    ],
    "expect": "This example uses Rack → Trigger → Trigger. The real guide must reflect the selected saved preset, not a generic fixed sequence.",
    "requires": "Learn only the sounds referenced by this preset. Creating a new custom preset remains a Full-only feature.",
    "stages": [
      "Microphone connected",
      "2.4 s countdown → beep",
      "rack → trigger → trigger",
      "Result → automatic 3.2 s countdown → repeat"
    ],
    "sequence": [
      "rack",
      "trigger",
      "trigger"
    ],
    "exampleConfig": "2 attempts · random 2–5 s delay · app beep on"
  }
];
