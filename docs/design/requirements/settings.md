# Audio, appearance and feedback settings

Revision: 1.0 · Scope: requested · Implementation: not implemented

User evidence: **“after a publish, proceed with”** custom presets and working Noise Filter, Auto Gain, Appearance and Vibration Feedback controls, connected to browser capabilities and stored preferences. Environment publication was a sequencing condition; this specification does not claim it occurred.

| ID | Requirement | State |
| --- | --- | --- |
| SET-01 | Provide a working Noise Filter control connected to supported browser audio processing. | Requested |
| SET-02 | Provide a working Auto Gain control connected to supported browser audio processing. | Requested |
| SET-03 | Provide an Appearance control that changes the app's presentation. | Requested |
| SET-04 | Provide Vibration Feedback connected to actual device/browser support. | Requested |
| SET-05 | Persist preferences across refreshes and compatible app updates. Explain unsupported capabilities accurately rather than displaying nonfunctional controls. | Requested |

## Proposed details awaiting confirmation

- Noise Filter maps to supported `noiseSuppression` constraints. Auto Gain maps to supported `autoGainControl` constraints. The existing capture defaults disable both; do not silently change a learned model's capture behavior.
- Explain that browser processing can affect sound recognition and may require collecting compatible samples again. Exact defaults and whether preferences are per gun or global remain to be specified.
- Appearance offers System, Dark and Light, with accessible contrast and persisted selection. These exact options are proposed rather than approved.
- Vibration defaults and triggering events must be agreed. Disable or mark unsupported where the browser does not provide usable vibration; do not assume iPhone Safari supports it.
- Define whether changes apply to the next recording/session or restart an active capture. Do not silently alter settings in the middle of a session.

## Acceptance criteria

1. Supported audio controls change the requested capture settings on a subsequent capture and persist on reload.
2. An unsupported setting provides an accurate explanation and does not block the core recording workflow.
3. An approved appearance choice changes the UI and is restored on reload without harming readability.
4. Approved feedback triggers obey the saved preference; unsupported vibration is not reported as successful.
5. Existing sound data and history are retained when preferences change.
