# Session ownership notes

P6 implementation notes within CHG-049, not new product behavior. [Plan](plan.md) and [spec](spec.md) remain authoritative.

## Verified structural preparation

- PracticeRun/PracticeReview/SequenceRun/SequenceReview supply identical live and `example-` structures through `app/renderSessionFragments`. Frozen original fragments and complete-frame digests cover all12 scenarios/1,333 frames. Native controllers and `sessionPresentation.js` still own initialized DOM; typed prerender alone is not a runtime migration.
- The Practice controller already has actual-controller tests. `tests/sequenceController.test.js` now covers actual Sequence setup, numeric drafts/bounds, safety/training guards, late permission cancellation, cue/countdown/onset/persistence/review, pause/resume, owned review, failed save/retry and stale configuration reads before its runtime handoff. Storage/capture/feedback are injected test boundaries; the session engine, classifier and synthetic PCM recognition are real. This is not hardware verification.

## Next extraction and handoff

1. **Verified:** shared typed repetition-result presentation/model, comparing both Practice and Sequence details with frozen native output, including early/late/no-click/partial and ordered detection/split values. The native fallback now reuses the pure formatter/model supplied to typed UI; do not move acoustic classification or timing into components.
2. **Verified model extraction:** pure run/review models now feed the native adapters, with38 frozen-renderer write-contract cases and unchanged complete guide-frame digests. Next extend the four structural components to consume those models. Preserve all existing phase texts/classes/disabled controls, counters, cue-source disclosures, durable-save state and retry/owner guards. Run all complete-frame signatures after each change.
3. Transfer Practice/Sequence pages through explicit later unlocked entry, before capture starts. Retain the exact numeric/config form nodes (badInput cannot be reconstructed from `.value`) and native form/listener/queue lifetime until deliberately handed off. Never replace fields when an asynchronous module finishes or during pending capture/safety.
4. Transfer the synthetic guide through the same read-only component/model path. It must remain independent of capture/storage/feedback APIs; preserve prefixed IDs/ARIA, initial pause, endpoints, early example, navigation/background pause, review/replay and all12 exports.

## Critical lifetime contracts

- Controllers set Run/Review/Configure visibility outside `sessionPresentation`; transfer those flags with their page ownership, rather than leaving competing native/React class writes.
- Practice microphone levels have a dedicated high-frequency path (`renderInput`); preserve direct scoped meter/ARIA updates instead of rerendering the whole page on each sample. Timing/recognition timestamps remain engine/controller-owned.
- `sessionPresentation` currently replaces latest/review detail nodes on refresh. Match original disclosure reset semantics where observable; stable React keys must not silently change behavior.
- Sequence has a controller-created retry button and handler. Hand off that guarded action deliberately; a detached native button must not retain stale disabled state or become the dispatch target. Practice retry already has a stable ID.
- Sequence `announce` deduplicates unchanged status text. Keep that screen-reader behavior while updating the countdown. Real announcements remain live; all synthetic guide announcements remain disabled.
- Preserve each existing controller's readiness and cue guard behavior independently; do not unify their timing policy during structural refactoring. Practice retains input-readiness/early-miss/80ms cue exclusion; Sequence uses its current connect/countdown/300ms guard path. Flag proposed behavioral changes separately rather than changing them through a shared component.
- Save failures must retain the owned review and block unsafe navigation until retry succeeds. Configuration and save queues, stale gun/route/read tokens, abort/stop cleanup and background interruption stay authoritative.
- Keep native startup fallback retirement and original payload/timing acceptance in P7. Do not change original performance/image baselines or suppress failures.

## Live Run/Review handoff checkpoint (2026-10-20)

Stateful contents and explicit later-entry live Practice/Sequence ports are implemented. `app/sessionContents` owns atomic two-host rendering/rollback and epoch-based result refresh. The dedicated Practice/Sequence adapters format results and preserve class-token order. Controllers cache pure models, own outer visibility and invoke original action handlers after handoff. Practice retains the exact high-frequency meter subtree. Sequence retry is an explicit action, never a detached native-button click. Actual controller suites execute both presentation paths. Parent Configure/heading/sequence sources and guide runtime are the next P6 extraction; this does not claim full page migration.

Strict generic UI audit currently reports34 findings (4 unresolved native-select declarations,30 violations across native validation/static actionless-button rules). This is not an audit compliance pass. Existing controls and delegated bindings are preserved under RF-11; no native-validation redesign or control replacement is authorized by this structural scope. Runtime tests remain authoritative for working handlers.
