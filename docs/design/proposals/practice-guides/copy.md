# Draft guide copy — CHG-042/043

Generated from [manuals.json](manuals.json) by [render.mjs](render.mjs). Design proposal, not implemented app content. Default app-signal examples are shown; calibrated external-cue wording must reflect the actual configuration.

## Single trigger press

Measure the time from each start signal to your first recognized trigger click.

**What it measures:** Reaction time per attempt, plus completed and failed attempts.

**How it works**

1. Choose repetitions and a fixed or random ready delay.
2. Start, watch the countdown and wait for the signal before one trigger press.
3. Read the result. A fresh countdown starts automatically until the target is reached.

**Good to know:** A recognized trigger before the app signal fails that attempt. Each attempt accepts one click.

**Before you start:** Learn Trigger pull for the selected gun. Other sound types are optional. Verify unloaded, remove live ammunition and use a safe direction and backstop.

**Illustration:** Microphone ready → 2.4 s countdown → beep → Click at 0.50 s → Automatic 3.2 s countdown → second beep → 0.60 s click. The exported animation follows these example timings at 1× speed; detections are synthetic, not live audio.

[Dark page](screens/single.dark.png) · [Light page](screens/single.light.png) · [Silent GIF](animations/single.gif)

## Repeated trigger presses

Count separate recognized trigger clicks and see the time between them.

**What it measures:** Accepted click count and the intervals between consecutive clicks.

**How it works**

1. Choose the number of clicks and your ready delay.
2. After one start signal, perform separate trigger presses as your equipment permits.
3. Listening continues without a new beep for every click. Review appears at the target.

**Good to know:** Reset and handling sounds should not count as shots. Pause stops capture; Resume excludes paused time.

**Before you start:** Learn Trigger pull. Optional reset/noise examples can help reject other clicks. Verify unloaded, remove live ammunition and use a safe direction and backstop.

**Illustration:** Microphone ready → 2.4 s countdown → one beep → Three clicks: 0.50 / 1.30 / 2.10 s → Two intervals: 0.80 / 0.80 s. The exported animation follows these example timings at 1× speed; detections are synthetic, not live audio.

[Dark page](screens/repeated.dark.png) · [Light page](screens/repeated.light.png) · [Silent GIF](animations/repeated.gif)

## Par-time practice

Check whether a recognized trigger click arrives within your chosen time limit.

**What it measures:** Time from the start signal to a click, with an in-time or missed outcome.

**How it works**

1. Set a par time, repetitions and ready delay.
2. Wait for the signal, then make one trigger press within the limit.
3. Read the result, then select Next repetition when ready for another countdown.

**Good to know:** No accepted click by the deadline is a miss. The app may briefly finish processing audio captured before the deadline.

**Before you start:** Learn Trigger pull. Example: a 0.64 s click is in time for a 1.50 s limit. Verify unloaded, remove live ammunition and use a safe direction and backstop.

**Illustration:** Microphone ready → Countdown → beep → 0.60 s hit within 1.50 s → User selects Next repetition → Fresh countdown → beep → no click → miss. The exported animation follows these example timings at 1× speed; detections are synthetic, not live audio.

[Dark page](screens/par.dark.png) · [Light page](screens/par.light.png) · [Silent GIF](animations/par.gif)

## Trigger control

Compare how consistent the timing is between your recognized trigger clicks.

**What it measures:** Click intervals and their timing spread. It does not measure firearm movement.

**How it works**

1. Choose a click target and ready delay.
2. After the start signal, perform separate presses at a comfortable, repeatable pace.
3. Keep going until the target, then compare the recorded intervals in review.

**Good to know:** One signal starts continuous listening. A microphone cannot grade aim, movement or trigger technique.

**Before you start:** Learn Trigger pull. Optional reset/noise calibration can improve discrimination. Verify unloaded, remove live ammunition and use a safe direction and backstop.

**Illustration:** Microphone ready → 2.4 s countdown → one beep → Three distinct clicks → 0.80 s intervals → review. The exported animation follows these example timings at 1× speed; detections are synthetic, not live audio.

[Dark page](screens/control.dark.png) · [Light page](screens/control.light.png) · [Silent GIF](animations/control.gif)

## Reload practice

Measure the time between two mechanical sounds you choose.

**What it measures:** Elapsed time between the first and second recognized event, in that order.

**How it works**

1. Choose two different sound endpoints, such as Rack slide and Change magazine.
2. After the signal, perform the selected actions in the displayed order.
3. Read the interval, then select Next repetition when ready to continue.

**Good to know:** Handling events are not shots. Only an explicitly selected Trigger endpoint can add an accepted shot.

**Before you start:** Learn both selected endpoint sounds. Trigger is needed only when it is a selected endpoint. Verify unloaded, remove live ammunition and use a safe direction and backstop.

**Illustration:** Microphone ready → Countdown → beep → Rack at 0.40 s → Magazine at 1.60 s → 1.20 s interval → user selects Next → repeat. The exported animation follows these example timings at 1× speed; detections are synthetic, not live audio.

[Dark page](screens/reload.dark.png) · [Light page](screens/reload.light.png) · [Silent GIF](animations/reload.gif)

## Free practice

Practice for a chosen duration without a fixed click target.

**What it measures:** Total recognized trigger clicks and active practice time.

**How it works**

1. Choose the session duration and ready delay.
2. After one start signal, practice at your own pace while the app counts clicks.
3. The session ends at the duration limit. You can also use STOP to save and finish early.

**Good to know:** Pause stops microphone capture and pauses active time. There is no new beep for each click.

**Before you start:** Learn Trigger pull. No extra mechanical sound categories are required. Verify unloaded, remove live ammunition and use a safe direction and backstop.

**Illustration:** Microphone ready → Countdown → one beep → Three clicks during a 6 s example session → Deadline → finish captured audio → 3 clicks in 6 s. The exported animation follows these example timings at 1× speed; detections are synthetic, not live audio.

[Dark page](screens/free.dark.png) · [Light page](screens/free.light.png) · [Silent GIF](animations/free.gif)

## Trigger pull sequence

Complete a one-step ordered drill by matching the learned trigger sound after the signal.

**What it measures:** Signal-to-click time for each completed sequence repetition.

**How it works**

1. Choose repetitions and the sequence runner's ready delay.
2. After the start signal, make one trigger press for the displayed Trigger pull step.
3. Read the result. The sequence runner begins a new countdown until the target is reached.

**Good to know:** This is the legacy ordered runner, not Single practice. It does not mark pre-signal clicks as failed Single attempts.

**Before you start:** Learn Trigger pull. Sounds in the initial 0.30 s after the app beep are excluded to reject the cue. Verify unloaded, remove live ammunition and use a safe direction and backstop.

**Illustration:** Microphone connected → 2.4 s countdown → beep → trigger → Result → automatic 3.2 s countdown → repeat. The exported animation follows these example timings at 1× speed; detections are synthetic, not live audio.

[Dark page](screens/sequence-trigger-only.dark.png) · [Light page](screens/sequence-trigger-only.light.png) · [Silent GIF](animations/sequence-trigger-only.gif)

## Rack slide → Trigger pull

Complete the learned Rack slide and Trigger pull sounds in the displayed order.

**What it measures:** Time from the start signal to sequence completion, plus the time at each matched step.

**How it works**

1. Learn both listed sounds, then choose repetitions and ready delay.
2. After the signal, complete Rack slide followed by Trigger pull.
3. Read the matched-step result. A fresh countdown begins automatically for the next repetition.

**Good to know:** Only recognized sounds in the displayed order complete a repetition. End Session stops capture and saves results.

**Before you start:** Learn Rack slide and Trigger pull. The first 0.30 s after the app beep is ignored to reject the beep. Verify unloaded, remove live ammunition and use a safe direction and backstop.

**Illustration:** Microphone connected → 2.4 s countdown → beep → rack → trigger → Result → automatic 3.2 s countdown → repeat. The exported animation follows these example timings at 1× speed; detections are synthetic, not live audio.

[Dark page](screens/sequence-rack-trigger.dark.png) · [Light page](screens/sequence-rack-trigger.light.png) · [Silent GIF](animations/sequence-rack-trigger.gif)

## Magazine change → Trigger pull

Complete the learned magazine-change and trigger sounds in the displayed order.

**What it measures:** Signal-to-completion time and the detected timing of each sequence step.

**How it works**

1. Learn Change magazine and Trigger pull, then set repetitions and ready delay.
2. After the signal, complete Magazine change followed by Trigger pull.
3. Read the result. The next repetition starts with a fresh countdown automatically.

**Good to know:** A magazine sound does not count as a shot. A repetition completes only when its ordered sounds match.

**Before you start:** Learn Change magazine and Trigger pull. The first 0.30 s after the app beep is ignored to reject the beep. Verify unloaded, remove live ammunition and use a safe direction and backstop.

**Illustration:** Microphone connected → 2.4 s countdown → beep → reload → trigger → Result → automatic 3.2 s countdown → repeat. The exported animation follows these example timings at 1× speed; detections are synthetic, not live audio.

[Dark page](screens/sequence-mag-trigger.dark.png) · [Light page](screens/sequence-mag-trigger.light.png) · [Silent GIF](animations/sequence-mag-trigger.gif)

## Draw → Magazine → Trigger

Match the three learned sounds in one ordered sequence.

**What it measures:** Time from the signal to the final recognized trigger, plus detected step timings.

**How it works**

1. Learn all three listed sounds, then choose repetitions and ready delay.
2. After the signal, complete the displayed Draw, Magazine change and Trigger pull sequence.
3. Read the result. The runner automatically starts a fresh countdown for the next repetition.

**Good to know:** Sound matching confirms an acoustic order only. It cannot verify how a physical action was performed.

**Before you start:** Learn Draw, Change magazine and Trigger pull. The first 0.30 s after the app beep is ignored to reject the beep. Verify unloaded, remove live ammunition and use a safe direction and backstop.

**Illustration:** Microphone connected → 2.4 s countdown → beep → draw → reload → trigger → Result → automatic 3.2 s countdown → repeat. The exported animation follows these example timings at 1× speed; detections are synthetic, not live audio.

[Dark page](screens/sequence-draw-mag-trigger.dark.png) · [Light page](screens/sequence-draw-mag-trigger.light.png) · [Silent GIF](animations/sequence-draw-mag-trigger.gif)

## Your saved sequence

Match the sounds in your selected saved drill, in the order you defined.

**What it measures:** Signal-to-completion time and detected timings for the steps in this preset.

**How it works**

1. Check the selected preset's actual steps and learn each required sound.
2. Choose repetitions and delay, then follow that displayed order after the signal.
3. A matching sequence completes a repetition; the next countdown starts automatically.

**Good to know:** This example uses Rack → Trigger → Trigger. The real guide must reflect the selected saved preset, not a generic fixed sequence.

**Before you start:** Learn only the sounds referenced by this preset. Creating a new custom preset remains a Full-only feature. Verify unloaded, remove live ammunition and use a safe direction and backstop.

**Illustration:** Microphone connected → 2.4 s countdown → beep → rack → trigger → trigger → Result → automatic 3.2 s countdown → repeat. The exported animation follows these example timings at 1× speed; detections are synthetic, not live audio.

[Dark page](screens/sequence-custom.dark.png) · [Light page](screens/sequence-custom.light.png) · [Silent GIF](animations/sequence-custom.gif)

