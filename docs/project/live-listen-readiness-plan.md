# Live Listen readiness correction

Requested 2026-10-22, queued after CHG-052 card acceptance. Scope is directly authorized: review intermittent availability, synchronize Home/Drills/bottom-navigation/capture entry states and visibly explain unavailable actions. Work stays on b; main/dev remain unchanged.

## Observed cause

Home currently checks busy state plus a named gun and at least three trigger examples. Bottom navigation only checks gun details/profile loading, so it can open Live Listen when Home is disabled. The actual listening/single-shot controls apply additional microphone-pending and timed-session guards. Two rendering paths also write those controls independently. Selected-gun training counts, profile loads and active capture therefore produce inconsistent visible states.

## Implementation steps

- [ ] Characterize missing/incomplete gun, 0–2/3+ trigger samples, gun switching/loading, recording, connecting, active capture and timed/unsaved-session states before changing logic.
- [ ] Separate navigation availability from capture readiness consistently. Home, Drills and bottom-menu entries open the same Live Listen page for a valid loaded gun, even before training; disable navigation during existing busy/profile-load guards. Capture requires three trigger samples and no pending/busy/timed/unsaved operation; retain an active listener's Stop control and existing safety/permission flow.
- [ ] Show setup guidance and a concise visible reason beside disabled capture controls on Live Listen; explain the selected-gun minimum/count, loading or active operation as appropriate. Training remains trigger-only; optional sounds must not block free listening.
- [ ] Test recovery after training/reset/switch/stop, native and React owners, keyboard/navigation, both editions and narrow/light/dark screens.
- [ ] Update affected requirements, shared/page designs, screen mappings and reviewed images. Run local tests/build/payload checks and pinned CI; publish only observed results.

No browser permission is requested merely to navigate. Browser microphone permission/support errors remain honest runtime feedback, separate from the training requirement. No data/schema, safety, billing or native-app change.
