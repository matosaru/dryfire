# Audio, appearance and feedback settings

Revision: 1.3 · Scope: approved including CHG-014 and CHG-030 Dark primary text · 2026-10-12; implementation/publication in the delivery tracker, physical-device/deployment verification separate

User evidence: **“after a publish, proceed with”** working browser controls; the subsequent implementation was published in `b19aa4d`. The user now explicitly replied **“proceed”** to the detailed settings/session proposal published in `ebac22b`, approving CHG-014 revision 1.0. This records GitHub publication, not Cloudflare deployment.

| ID | Requirement | State |
| --- | --- | --- |
| SET-01 | Provide a working Noise Filter control connected to supported browser audio processing. | Approved; CHG-014 |
| SET-02 | Provide a working Auto Gain control connected to supported browser audio processing. | Approved; CHG-014 |
| SET-03 | Provide an Appearance control that changes the app's presentation. | Approved; CHG-014 |
| SET-04 | Provide Vibration Feedback connected to actual device/browser support. | Approved; CHG-014 |
| SET-05 | Persist preferences across refreshes and compatible app updates. Explain unsupported capabilities accurately rather than displaying nonfunctional controls. | Approved; CHG-014 |
| SET-07 | Main text in resolved Dark mode uses `#FFFFFF` (`rgb(255, 255, 255)`) consistently across the app: headings, primary content and neutral control labels/values, including session/practice/history text. Muted secondary copy/footer disclosure and semantic accent/status/button ink retain their colors. CHG-031 / ABOUT-05 separately makes the About/Contact controls white in Dark. Light mode retains its existing palette; System follows the resolved theme. | Direct user instruction; CHG-030 |

## Approved ownership, defaults and capability behavior

These choices are approved in the [immutable CHG-014 proposal](https://github.com/matosaru/dryfire/blob/ebac22b/docs/design/requirements/next-implementation.md); confirmation is appended in [approval-log.md](../project/approval-log.md).

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
6. Review Dark captures across the twelve screens/shared safety modal and both browser engines. Main text is pure white; muted/accent styles remain distinct. Light-mode colors/layout remain unchanged. Update the [shared design](../design/screens/shared/README.md), source/capture fingerprints and delivery history; screenshot checks prove repeatable rendering, not device microphone behavior.

## Explicit data reset — CHG-019

| ID | Requirement | Approval |
| --- | --- | --- |
| SET-06 | Settings provides a separate **Delete all guns & app data** action with clear irreversible scope and backup guidance, followed by explicit confirmation. Cancel leaves all stores untouched. Confirm atomically clears only this app's IndexedDB stores, including gun profiles, learned/calibration features, presets, settings, recent results and saved sessions; restart in first-gun setup without automatically acquiring microphone input. | Direct user report/request, CHG-019 |

Keep **Reset this gun's sounds** as a different confirmed action. It removes positive and rejection/cue examples for the selected gun only, preserving its profile, presets/configuration/results and every other gun. Display current learned/calibration counts and a visible outcome so the reset is verifiable. Destructive actions are locked during capture, saving or other active library operations. Full app reset remains usable without an active gun; a cancelled reset does not change data. Exported compatible backups can restore a cleared library. Browser permissions, origin-wide storage and service-worker caches are not cleared by this action.

Current visual design: [Settings](../design/screens/settings/README.md). The implementation plan separates destructive-action QA from any production user's data; no automatic production reset is authorized.
