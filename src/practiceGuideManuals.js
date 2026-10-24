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
      "2.4 s countdown \u2192 beep",
      "Click at 0.50 s",
      "Automatic 3.2 s countdown \u2192 second beep \u2192 0.60 s click"
    ],
    "sequence": [
      "trigger"
    ],
    "exampleConfig": "2 attempts \u00b7 random 2\u20135 s delay \u00b7 app beep on"
  },
  {
    "id": "repeated",
    "kind": "practice",
    "title": "Repeated trigger press",
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
      "2.4 s countdown \u2192 one beep",
      "Three clicks: 0.50 / 1.30 / 2.10 s",
      "Two intervals: 0.80 / 0.80 s"
    ],
    "sequence": [
      "trigger",
      "trigger",
      "trigger"
    ],
    "exampleConfig": "3 clicks \u00b7 random 2\u20135 s delay \u00b7 app beep on"
  },
  {
    "id": "par",
    "kind": "practice",
    "title": "Par time practice",
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
      "Countdown \u2192 beep \u2192 0.60 s hit within 1.50 s",
      "User selects Next repetition",
      "Fresh countdown \u2192 beep \u2192 no click \u2192 miss"
    ],
    "sequence": [
      "trigger"
    ],
    "exampleConfig": "2 attempts \u00b7 random 2\u20135 s delay \u00b7 app beep on"
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
      "2.4 s countdown \u2192 one beep",
      "Three distinct clicks",
      "0.80 s intervals \u2192 review"
    ],
    "sequence": [
      "trigger",
      "trigger",
      "trigger"
    ],
    "exampleConfig": "3 clicks \u00b7 random 2\u20135 s delay \u00b7 app beep on"
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
      "2.4 s countdown \u2192 beep",
      "trigger",
      "Result \u2192 automatic 3.2 s countdown \u2192 repeat"
    ],
    "sequence": [
      "trigger"
    ],
    "exampleConfig": "2 attempts \u00b7 random 2\u20135 s delay \u00b7 app beep on"
  },
  {
    "id": "sequence-rack-trigger",
    "kind": "sequence",
    "title": "Rack slide \u2192 Trigger pull",
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
      "2.4 s countdown \u2192 beep",
      "rack \u2192 trigger",
      "Result \u2192 automatic 3.2 s countdown \u2192 repeat"
    ],
    "sequence": [
      "rack",
      "trigger"
    ],
    "exampleConfig": "2 attempts \u00b7 random 2\u20135 s delay \u00b7 app beep on"
  },
  {
    "id": "sequence-mag-trigger",
    "kind": "sequence",
    "title": "Magazine change \u2192 Trigger pull",
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
      "2.4 s countdown \u2192 beep",
      "reload \u2192 trigger",
      "Result \u2192 automatic 3.2 s countdown \u2192 repeat"
    ],
    "sequence": [
      "reload",
      "trigger"
    ],
    "exampleConfig": "2 attempts \u00b7 random 2\u20135 s delay \u00b7 app beep on"
  },
  {
    "id": "sequence-draw-mag-trigger",
    "kind": "sequence",
    "title": "Draw \u2192 Magazine \u2192 Trigger",
    "setupTitle": "Draw from holster \u2192 Magazine change \u2192 Trigger pull",
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
      "2.4 s countdown \u2192 beep",
      "draw \u2192 reload \u2192 trigger",
      "Result \u2192 automatic 3.2 s countdown \u2192 repeat"
    ],
    "sequence": [
      "draw",
      "reload",
      "trigger"
    ],
    "exampleConfig": "2 attempts \u00b7 random 2\u20135 s delay \u00b7 app beep on"
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
    "expect": "This example uses Rack \u2192 Trigger \u2192 Trigger. The real guide must reflect the selected saved preset, not a generic fixed sequence.",
    "requires": "Learn only the sounds referenced by this preset. Creating a new custom preset remains a Full-only feature.",
    "stages": [
      "Microphone connected",
      "2.4 s countdown \u2192 beep",
      "rack \u2192 trigger \u2192 trigger",
      "Result \u2192 automatic 3.2 s countdown \u2192 repeat"
    ],
    "sequence": [
      "rack",
      "trigger",
      "trigger"
    ],
    "exampleConfig": "2 attempts \u00b7 random 2\u20135 s delay \u00b7 app beep on"
  }
];
