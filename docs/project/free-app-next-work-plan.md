# Free application next-work plan

Updated 2026-11-07 (Europe/Vilnius). This plan tracks approved Free-product work on `b`. Production promotion remains a fully checked `b` → `main` change. Physical microphone evidence and live Cloudflare deployment remain separately observed.

## Execution order

| Order | Change | Status | Completion criteria |
| --- | --- | --- | --- |
| 1 | Persisted Metric / Imperial measurement preference (CHG-066) | Implemented; full acceptance running | One device-wide preference in Settings; one shared normalizer/formatter; all applicable distance copy follows it; backup/restore and existing libraries remain compatible; unit, integration and reviewed mobile visual evidence pass. |
| 2 | Delete individual History records (CHG-068) | Implemented; full acceptance running | Each saved session and recognized-sound record exposes an accessible Delete action. Confirmation identifies the selected record and active gun. Confirm removes only that owned record atomically; Cancel and failures preserve it; progress, lists and empty states refresh without clearing other history. |
| 3 | Reduce screenshot regression matrix (CHG-069) | Implemented; canonical image review pending | Keep one canonical mobile Chromium screenshot per distinct page type, at the existing 390 px phone viewport unless a page requires the narrower supported width. Remove duplicate theme, edition, engine and transient-state image baselines after an audited mapping proves every page retains one owner. Preserve nonvisual unit/integration/browser assertions for themes, editions, responsive behavior, state transitions, WebKit-specific behavior and accessibility. CI continues to publish failure screenshots/diffs for the retained cases. |
| 4 | Free release stabilization | Pending | Full unit/coverage/integration, both optimized editions, artifact/profile/docs/architecture checks, retained Chromium visuals and unchanged performance gates pass on the exact candidate before pushing or promoting. |
| 5 | Physical iPhone audio acceptance | Owner test pending | Confirm first-click capture, early-trigger result, false detections and cue audibility; export labelled Sound Check evidence before any v3 classifier promotion claim. |

## CHG-068 boundaries

- “Individual History records” covers the two durable lists already shown by History: saved practice/sequence sessions and recognized-sound events. It does not delete learned examples, gun profiles, presets or another gun's data.
- Reuse the existing app-owned confirmation and selected-gun ownership rules. Do not use a browser-native destructive prompt in new UI.
- Keep the existing scoped clear-all actions available for users who intentionally want a bulk reset.
- Add storage tests for ownership, missing/stale identifiers, atomic failure and preservation of unrelated records; add page tests for confirmation, cancellation, refresh and empty states.

## CHG-069 visual-test policy

The retained image suite is a page-level appearance guard, not the only functional test layer. One screenshot represents each navigable page type in Chromium on a mobile viewport. Variants that change behavior without defining a different page type move to semantic browser assertions, component tests or integration workflows rather than keeping another approved PNG.

Before deleting references, produce a page → retained-case → removed-case audit. Keep an additional screenshot only when two URLs are different page types or when a state changes the page's durable structure enough that semantic assertions cannot protect it. Record any exception explicitly instead of silently growing the matrix again.
