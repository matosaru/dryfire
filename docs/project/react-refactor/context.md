# Refactor working context

Updated 2026-10-20 (Europe/Vilnius). Compact handoff; detailed scope/results stay in the linked documents.

## Durable rules

- Continue approved refactor steps automatically; publish verified increments to **b only**. **Main and dev stay unchanged.** No deployment or repeated step approvals.
- Preserve visuals, behavior, saved data, Free/Full boundaries and final performance. Keep source minified and original test/image/performance baselines intact.
- Give progress updates at least every 60 seconds during active work. Save credits by avoiding redundant runs/dev synchronization.
- Report local checks, push, canonical CI and deployment separately. Never turn pending/failed evidence into “passed” or imply unattended background progress.

## Current work

Source: b HEAD (`git log -1` identifies the exact increment). Published History milestone: `d7cc053`.

P0/P1 are complete; P2 shell, P3 profiles and P4 Settings/Learn/Live Listen presentation/handoffs are verified. Native startup fallback retirement remains P7.

**P5 presentation/runtime handoffs verified.** Drills/editor and History/results/optional graphs now have typed presentation owners. Private ProgressContent prepares/mounts only on explicit later entry; grouping/statistics/filters stay feature-owned. Free simulation clears through the renderer; public JS excludes it. Exact numeric/filter nodes and native startup fallbacks remain protected. Final fallback retirement remains P7.

## Next action

Continue **P6 Practice/Sequence/shared live-guide components** automatically on b. Characterize controllers/fragment snapshots before each handoff; preserve capture/readiness/early click/beep, engine clocks, automatic repetitions, invalid numeric forms, save retries, background cleanup and all12 guide exports. Start with shared run/review source packages and frozen live/example DOM parity; then explicit runtime ownership. No approval needed.

## Verification and open debt

Latest P5 increment: **678 tests /109 suites**, coverage/type/lint/architecture/docs,16 smoke checks and both minified artifacts pass. **7 public +8 preview targeted Chromium workflows** include exact Dark/Light chart pixels, filters, Free/Full transitions, clearing and offline/edition ownership. Earlier History increment passed26/25 browser workflows. New graph model/component/adapter100% measured coverage;30 UI/page packages checked. CSS61451/13011 and all image/GIF baselines unchanged.

Published editor `91d9d01`: canonical validation and both screenshot edition jobs pass; both performance jobs and the public deliberate-slowdown proof fail. Aggregate screenshots fails because it requires performance. Prior editor browser evidence remains 23 public +22 preview Chromium workflows. Preserve 390 image references, 83 captures, 12 guide exports. Local Chromium is diagnostic; pinned Chromium/WebKit owns canonical comparisons.

Initial JS now public174408/52975 raw/gzip, preview175703/53347; +3491/+2168 and+3620/+2201 vs original. No fresh timing claimed after payload gate failure. See plan ledger for performance/probe debt.

CHG-050 defers optimization until structural work is done. Original gzip/timing gates remain unchanged and failing honestly; see the plan's ledger. Do not claim fresh timing after a size gate stops measurement. Resolve all debt before final release.

## Sources of truth

- [Repository rules](../../../AGENTS.md) and [approved specification](spec.md)
- [Active plan/checklist](plan.md) and [implementation history](../implementation-history.md)
- [Approvals](../approval-log.md), [requirements](../../requirements/README.md), [designs](../../design/README.md)
- [Ownership map](../../architecture/component-map.json), [page handoffs](../../architecture/page-templates.md), [screen/source registry](../../architecture/screen-map.json)

## After every completed task

Replace this summary's current work, evidence, open issues and next action; do not append a timeline. Offload details to their authoritative document and link them. Remove superseded status while retaining user constraints, approval pointers and unresolved failures. Keep this handoff compact (roughly 40–60 lines), then resume by reading it, the relevant linked section and git state.
