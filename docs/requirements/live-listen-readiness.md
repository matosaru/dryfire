# Live Listen availability — CHG-053

Approved by direct user instruction on 2026-10-22: review intermittent availability, synchronize all entry points and visibly explain unavailable controls. Implementation is queued after CHG-052 acceptance. This preserves the existing three-trigger-example requirement; it does not add a new numeric restriction.

| ID | Requirement |
| --- | --- |
| LIVE-01 | Home, Drills free-listening and the bottom menu use the same navigation rule. A valid loaded gun can open Live Listen before training so the user can read setup guidance. Existing busy/profile-loading navigation guards apply consistently. |
| LIVE-02 | Capture requires at least three current trigger examples for the selected gun. Other positive sounds and optional calibration must not block free listening. |
| LIVE-03 | Capture controls reflect profile loading, recording, saved-preference updates, microphone connection, active timed sessions and unsaved results. Keep an active continuous listener's Stop action available. |
| LIVE-04 | Show a visible explanation beside capture controls using the existing training summary. Missing training includes the current count/minimum and an instruction to open Learn; loading/connection/operation/save states give the relevant next step. |
| LIVE-05 | Navigation alone never requests microphone permission or safety confirmation. Starting capture retains the existing safety/permission flow. Browser permission/support errors remain visible runtime feedback. |
| LIVE-06 | Recompute from the current gun after learning, reset, switching, asynchronous loading and stop. Native startup and React owners display the same state through their existing exclusive ports. |
| LIVE-07 | Preserve sound profiles, history, sessions, gun limits, storage schema, Free/Full boundaries, recognition thresholds and common page layout. |

Use a pure reason-code/navigation model shared by all presenters. Keep user-facing copy with the shared Live Listen page; its prerendered metadata supplies the native adapter as well. Never parse user text as HTML to show a reason.

Acceptance: unit state/priority cases; actual 0/2/3-example navigation/capture flows; optional-sound independence; reset/switch/stop recovery; native/React handoffs; both editions/themes and narrow layouts. Review current [Live Listen designs](../design/screens/live-listen/README.md), update affected screenshots/state registry, and retain original performance/visual gates. Publication, CI and deployment are separate statuses.
