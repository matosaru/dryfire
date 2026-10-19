# Refactor working context

Updated 2026-10-19 (Europe/Vilnius). Compact handoff; detailed scope/results stay in the linked documents.

## Durable rules

- Continue approved refactor steps automatically; publish verified increments to **b only**. **Main and dev stay unchanged.** No deployment or repeated step approvals.
- Preserve visuals, behavior, saved data, Free/Full boundaries and final performance. Keep source minified and original test/image/performance baselines intact.
- Give progress updates at least every 60 seconds during active work. Save credits by avoiding redundant runs/dev synchronization.
- Report local checks, push, canonical CI and deployment separately. Never turn pending/failed evidence into “passed” or imply unattended background progress.

## Current work

Source: b HEAD (`git log -1` identifies the exact increment). Previous published milestone: `54e8f29`.

P0/P1 are complete. P2 shared presentation and P3 Home/gun page handoffs are verified. Initial native fallback retirement remains P7.

**Active: P4. Settings runtime is implemented.** The typed page mounts on a later explicit unlocked visit after lazy loading. Exact native file-input and private-preview nodes remain platform-owned islands; existing handlers transfer to React callbacks. One runtime update port owns preference/context/reset/lock presentation. Failed mount restores native nodes/focus/events. First-visit native fallback remains P7. Learn/Live Listen and P5–P7 remain pending.

## Next action

Finish publication/observe canonical Settings CI, then characterize and migrate Learn followed by Live Listen. Preserve ten-sample limits, optional/calibration sounds, cancellation/late permission, resets, repeated recognition, safety and teardown. Continue automatically on b; no new approval is needed.

## Verification and open debt

This increment: **567 tests / 83 suites**, coverage/type/lint/architecture/docs and both minified artifacts pass. Local public and Full-preview workflows cover actual Settings runtime, backup/import/export/reset, theme, drafts, navigation and retained file/preview controls. Delayed-module tests compare native/mounted pixels in Dark/Light without replacing any screenshot baseline. Canonical CI for this increment is not yet observed.

Previous milestone 54e8f29: canonical validation and both screenshot editions pass; performance gates fail. Preserve 390 image references, 83 captures and 12 guide exports. Local system Chromium is diagnostic; pinned Chromium/WebKit owns canonical comparisons.

CHG-050 defers optimization until structural work is done. Original gzip/timing gates remain unchanged and failing honestly; see the plan's ledger. Do not claim fresh timing after a size gate stops measurement. Resolve all debt before final release.

## Sources of truth

- [Repository rules](../../../AGENTS.md) and [approved specification](spec.md)
- [Active plan/checklist](plan.md) and [implementation history](../implementation-history.md)
- [Approvals](../approval-log.md), [requirements](../../requirements/README.md), [designs](../../design/README.md)
- [Ownership map](../../architecture/component-map.json), [page handoffs](../../architecture/page-templates.md), [screen/source registry](../../architecture/screen-map.json)

## After every completed task

Replace this summary's current work, evidence, open issues and next action; do not append a timeline. Offload details to their authoritative document and link them. Remove superseded status while retaining user constraints, approval pointers and unresolved failures. Keep this handoff compact (roughly 40–60 lines), then resume by reading it, the relevant linked section and git state.
