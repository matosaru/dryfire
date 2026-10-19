# Refactor working context

Updated 2026-10-19 (Europe/Vilnius). Compact handoff; detailed scope/results stay in the linked documents.

## Durable rules

- Continue approved refactor steps automatically; publish verified increments to **b only**. **Main and dev stay unchanged.** No deployment or repeated step approvals.
- Preserve visuals, behavior, saved data, Free/Full boundaries and final performance. Keep source minified and original test/image/performance baselines intact.
- Give progress updates at least every 60 seconds during active work. Save credits by avoiding redundant runs/dev synchronization.
- Report local checks, push, canonical CI and deployment separately. Never turn pending/failed evidence into “passed” or imply unattended background progress.

## Current work

Source: b HEAD (`git log -1` identifies the exact increment). Previous published milestone: Settings `6a32cb1`.

P0/P1 are complete. P2 shared presentation and P3 Home/gun page handoffs are verified. Initial native fallback retirement remains P7.

**Active: P4. Settings and Learn runtime are implemented.** Settings retains exact native file/preview islands; Learn uses shared SoundCard/CalibrationCatalog with guarded feature callbacks. Both load on first visit and transfer only on a later explicit unlocked entry. Update ports own presentation; root failure restores native nodes/focus/events. Learn preserves disclosure drafts, semantic focus, limits/optional/calibration/reset/safety. Learn mount coverage is 100% statement/function/line and 96% branch. Native startup fallbacks remain P7. Live Listen and P5–P7 remain pending.

## Next action

Observe canonical Learn CI after publication; characterize and migrate Live Listen. Preserve continuous detection, ignored unknowns, sensitivity/sequence drafts, capture/safety guards, background/stop and microphone cleanup. Continue automatically on b, then P5–P7; no new approval is needed.

## Verification and open debt

This increment: **577 tests / 86 suites**, coverage/type/lint/architecture/docs, smoke and both minified artifacts pass. Public/Full-preview workflows cover profiles, drafts, backup/reset and actual mounted Settings/Learn. Native/React Dark/Light pixels match exactly with the existing SVG-clock fixture. CSS remains 61451 raw / 13011 gzip; current screenshots and encoded guide media are unchanged. Learn canonical CI is not yet observed.

Settings 6a32cb1: canonical validation and both screenshot editions pass; performance fails. Preserve 390 image references, 83 captures and 12 guide exports. Local system Chromium is diagnostic; pinned Chromium/WebKit owns canonical comparisons. Initial JS now public 51709 gzip / preview 52053, +902/+907 vs original; keep this debt visible.

CHG-050 defers optimization until structural work is done. Original gzip/timing gates remain unchanged and failing honestly; see the plan's ledger. Do not claim fresh timing after a size gate stops measurement. Resolve all debt before final release.

## Sources of truth

- [Repository rules](../../../AGENTS.md) and [approved specification](spec.md)
- [Active plan/checklist](plan.md) and [implementation history](../implementation-history.md)
- [Approvals](../approval-log.md), [requirements](../../requirements/README.md), [designs](../../design/README.md)
- [Ownership map](../../architecture/component-map.json), [page handoffs](../../architecture/page-templates.md), [screen/source registry](../../architecture/screen-map.json)

## After every completed task

Replace this summary's current work, evidence, open issues and next action; do not append a timeline. Offload details to their authoritative document and link them. Remove superseded status while retaining user constraints, approval pointers and unresolved failures. Keep this handoff compact (roughly 40–60 lines), then resume by reading it, the relevant linked section and git state.
