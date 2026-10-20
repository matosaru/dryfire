# Refactor working context

Updated 2026-10-20 (Europe/Vilnius). Compact handoff; detailed scope/results stay in the linked documents.

## Durable rules

- Continue approved refactor steps automatically; publish verified increments to **b only**. **Main and dev stay unchanged.** No deployment or repeated step approvals.
- Preserve visuals, behavior, saved data, Free/Full boundaries and final performance. Keep source minified and original test/image/performance baselines intact.
- Give progress updates at least every 60 seconds during active work. Save credits by avoiding redundant runs/dev synchronization.
- Report local checks, push, canonical CI and deployment separately. Never turn pending/failed evidence into “passed” or imply unattended background progress.

## Current work

Source: b HEAD (`git log -1` identifies the exact increment). Published editor milestone: `91d9d01`.

P0/P1 are complete; P2 shell, P3 profiles and P4 Settings/Learn/Live Listen presentation/handoffs are verified. Native startup fallback retirement remains P7.

**Active: P5 private progress content.** HistoryPage, SavedSessionList, RecognitionList and EvaluationPanel now own result presentation after guarded later entry. Session queries return guarded records without native painting after handoff. Numeric row and private graph/filter section retain exact nodes/lifetimes; locks, outcomes and gun context use the History port. Native initial renderers remain P7. The production raw History template is removed; frozen parity fixtures stay in tests.

## Next action

Continue the **private-only graph-content renderer** automatically on b, then P6 shared live/example pages and P7 cleanup/performance. Keep graph implementation outside the public dependency graph and avoid eager React at private startup; retain filter nodes and first native presentation until explicit later entry. No approval needed. See [History ownership notes](history-ownership-notes.md).

## Verification and open debt

This increment: **650 tests /104 suites**, coverage/type/lint/architecture/docs,16 smoke checks and both minified artifacts pass. **26 public +25 preview Chromium workflows** include exact Dark/Light History pixels, badInput node identity, filters, verification, review, separate clearing, profile switch and offline. 29 UI/page packages checked. History/model components100% coverage; adapter100% statements/functions/lines,87.5% branches. CSS remains61451/13011 with identical expanded bytes/hash; all image/GIF baselines unchanged.

Published editor `91d9d01`: canonical validation and both screenshot edition jobs pass; both performance jobs and the public deliberate-slowdown proof fail. Aggregate screenshots fails because it requires performance. Prior editor browser evidence remains 23 public +22 preview Chromium workflows. Preserve 390 image references, 83 captures, 12 guide exports. Local Chromium is diagnostic; pinned Chromium/WebKit owns canonical comparisons.

Initial JS now public174375/52969 raw/gzip, preview175600/53320; +3458/+2162 and+3517/+2174 vs original. No fresh timing claimed after payload gate failure. See plan ledger for performance/probe debt.

CHG-050 defers optimization until structural work is done. Original gzip/timing gates remain unchanged and failing honestly; see the plan's ledger. Do not claim fresh timing after a size gate stops measurement. Resolve all debt before final release.

## Sources of truth

- [Repository rules](../../../AGENTS.md) and [approved specification](spec.md)
- [Active plan/checklist](plan.md) and [implementation history](../implementation-history.md)
- [Approvals](../approval-log.md), [requirements](../../requirements/README.md), [designs](../../design/README.md)
- [Ownership map](../../architecture/component-map.json), [page handoffs](../../architecture/page-templates.md), [screen/source registry](../../architecture/screen-map.json)

## After every completed task

Replace this summary's current work, evidence, open issues and next action; do not append a timeline. Offload details to their authoritative document and link them. Remove superseded status while retaining user constraints, approval pointers and unresolved failures. Keep this handoff compact (roughly 40–60 lines), then resume by reading it, the relevant linked section and git state.
