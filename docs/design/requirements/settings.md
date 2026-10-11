# Audio, appearance and feedback settings

Revision: 1.1 · Scope: approved including CHG-014 detailed choices · Implementation: implemented and locally validated on 2026-10-11; physical-device/deployment verification separate

User evidence: **“after a publish, proceed with”** working browser controls; the subsequent implementation was published in `b19aa4d`. The user now explicitly replied **“proceed”** to the detailed settings/session proposal published in `ebac22b`, approving CHG-014 revision 1.0. This records GitHub publication, not Cloudflare deployment.

| ID | Requirement | State |
| --- | --- | --- |
| SET-01 | Provide a working Noise Filter control connected to supported browser audio processing. | Approved; CHG-014 |
| SET-02 | Provide a working Auto Gain control connected to supported browser audio processing. | Approved; CHG-014 |
| SET-03 | Provide an Appearance control that changes the app's presentation. | Approved; CHG-014 |
| SET-04 | Provide Vibration Feedback connected to actual device/browser support. | Approved; CHG-014 |
| SET-05 | Persist preferences across refreshes and compatible app updates. Explain unsupported capabilities accurately rather than displaying nonfunctional controls. | Approved; CHG-014 |

## Approved ownership, defaults and capability behavior

These choices are approved in the [immutable CHG-014 proposal](https://github.com/matosaru/dryfire/blob/ebac22b/docs/design/requirements/next-implementation.md); confirmation is appended in [approval-log.md](approval-log.md).

- Noise Filter and Auto Gain are **per-gun**, initially **Off**, preserving current capture behavior. Request supported `noiseSuppression`/`autoGainControl` on the next training, test, free-listen or drill capture. Echo cancellation remains off. Changes never alter an active capture.
- Clearly report unsupported controls or settings that the acquired audio track does not confirm, while keeping core capture usable. Explain that changing processing can affect recognition and may require fresh examples; preference changes themselves never delete samples.
- Appearance is **device-wide**, with **Dark** initially, **Light** and **System**. System follows the device preference. All choices retain readable controls and persist through refresh.
- Vibration Feedback is **device-wide**, initially **Off**. When enabled and supported, request a short vibration at **GO** and **repetition completion**. Mark unavailable when the API is absent or returns failure; do not claim iPhone support or physical verification from browser tests.
- Include these preferences in whole-library backup/restore and retain same-origin persistence. Accounts/cloud synchronization remain outside this implementation.

## Acceptance criteria

1. Supported audio controls change the requested capture settings on a subsequent capture and persist on reload.
2. An unsupported setting provides an accurate explanation and does not block the core recording workflow.
3. An approved appearance choice changes the UI and is restored on reload without harming readability.
4. Approved feedback triggers obey the saved preference; unsupported vibration is not reported as successful.
5. Existing sound data and history are retained when preferences change.
