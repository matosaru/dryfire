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

**Active: P5 History.** Drills/editor presentation is implemented. History foundation now includes seven existing-controller characterization cases and an isolated SavedSessionList component, with exact native/typed DOM parity and escaped stored-title tests. The component is not connected to the live page yet; no runtime/CSS/media behavior changed in this increment. Keep History unchecked until its actual handoff and both-edition integration checks pass.

## Next action

Continue **P5 History runtime handoff** automatically on b. Read [History ownership notes](history-ownership-notes.md): preserve exact invalid numeric input, progress filter/control nodes and private-only graph loading; port saved/evaluation/recognition UI with stale-owner checks and distinct clear scopes. Then P6 shared live/example pages and P7 cleanup/performance. No new approval is needed.

## Verification and open debt

This increment: **627 tests / 98 suites**, full coverage ratchet, type/lint/architecture/docs, 16 smoke checks and public minified artifact verification pass. SavedSessionList has 100% measured coverage. 26 isolated UI/page packages are checked. No new screenshot comparison was run because the new component is not wired into runtime; no visual baseline changed.

Published editor `91d9d01`: canonical validation and both screenshot edition jobs pass; both performance jobs and the public deliberate-slowdown proof fail. Aggregate screenshots fails because it requires performance. Prior editor browser evidence remains 23 public +22 preview Chromium workflows. Preserve 390 image references, 83 captures, 12 guide exports. Local Chromium is diagnostic; pinned Chromium/WebKit owns canonical comparisons.

Initial JS remains public 173511/52662 raw/gzip, preview 174752/53007; +2594/+1855 and +2669/+1861 vs original. No fresh timing claimed after payload gate failure. See plan ledger for performance/probe debt.

CHG-050 defers optimization until structural work is done. Original gzip/timing gates remain unchanged and failing honestly; see the plan's ledger. Do not claim fresh timing after a size gate stops measurement. Resolve all debt before final release.

## Sources of truth

- [Repository rules](../../../AGENTS.md) and [approved specification](spec.md)
- [Active plan/checklist](plan.md) and [implementation history](../implementation-history.md)
- [Approvals](../approval-log.md), [requirements](../../requirements/README.md), [designs](../../design/README.md)
- [Ownership map](../../architecture/component-map.json), [page handoffs](../../architecture/page-templates.md), [screen/source registry](../../architecture/screen-map.json)

## After every completed task

Replace this summary's current work, evidence, open issues and next action; do not append a timeline. Offload details to their authoritative document and link them. Remove superseded status while retaining user constraints, approval pointers and unresolved failures. Keep this handoff compact (roughly 40–60 lines), then resume by reading it, the relevant linked section and git state.
