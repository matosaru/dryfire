# Refactor working context

Updated 2026-10-19 (Europe/Vilnius). Compact handoff; detailed scope/results stay in the linked documents.

## Durable rules

- Continue approved refactor steps automatically; publish verified increments to **b only**. **Main and dev stay unchanged.** No deployment or repeated step approvals.
- Preserve visuals, behavior, saved data, Free/Full boundaries and final performance. Keep source minified and original test/image/performance baselines intact.
- Give progress updates at least every 60 seconds during active work. Save credits by avoiding redundant runs/dev synchronization.
- Report local checks, push, canonical CI and deployment separately. Never turn pending/failed evidence into “passed” or imply unattended background progress.

## Current work

Source: b HEAD (`git log -1` identifies the exact increment). Previous published milestone: Drills composition `7879bd7`.

P0/P1 are complete; P2 shell, P3 profiles and P4 Settings/Learn/Live Listen presentation/handoffs are verified. Native startup fallback retirement remains P7.

**Active: P5. Drills/editor presentation is implemented.** DrillsPage/DrillCard/PracticeCatalog own catalog UI. CustomDrillEditor supplies shared full prerender/live fields; its original form host retains one submit/visibility lifetime while the feature owns steps, permissions and save. A field port prevents competing native child writes; ordinary drafts/selection, explicit Open/Reset and failed-commit recovery are protected. RetainedNode preserves form/Settings platform lifetimes and the existing sibling-spacing contract. History and P6/P7 remain.

## Next action

Publish/observe this increment, then continue **P5 History** automatically on b. Read [History ownership notes](history-ownership-notes.md): preserve exact invalid numeric input, progress filter/control nodes and private-only graph loading; port saved/evaluation/recognition UI with stale-owner checks and distinct clear scopes. Then P6 shared live/example pages and P7 cleanup/performance. No new approval is needed.

## Verification and open debt

This increment: **616 tests / 96 suites**, coverage/type/lint/architecture/docs, 16 smoke checks and both minified artifacts pass. **23 public + 22 Full-preview** Chromium workflows protect exact Dark/Light editor pixels, saved edits, Full creation/simulation and all previously migrated pages/offline loads. Native and React editor behavior share 14 characterization cases; UI coverage 100%, adapter branches 95%. CSS remains 61451 raw /13011 gzip; every image/GIF baseline stays unchanged. Canonical CI for this source is not yet observed.

P4 a9c0a8b: canonical validation and both screenshot editions pass; performance fails. Prior deliberate-slowdown proof failure (run39268272972) stays in final-gate ledger. Preserve 390 image references, 83 captures, 12 guide exports. Local Chromium is diagnostic; pinned Chromium/WebKit owns canonical comparisons. Current initial JS public 173511/52662 raw/gzip, preview 174752/53007; +2594/+1855 and +2669/+1861 vs original. Keep debt visible.

CHG-050 defers optimization until structural work is done. Original gzip/timing gates remain unchanged and failing honestly; see the plan's ledger. Do not claim fresh timing after a size gate stops measurement. Resolve all debt before final release.

## Sources of truth

- [Repository rules](../../../AGENTS.md) and [approved specification](spec.md)
- [Active plan/checklist](plan.md) and [implementation history](../implementation-history.md)
- [Approvals](../approval-log.md), [requirements](../../requirements/README.md), [designs](../../design/README.md)
- [Ownership map](../../architecture/component-map.json), [page handoffs](../../architecture/page-templates.md), [screen/source registry](../../architecture/screen-map.json)

## After every completed task

Replace this summary's current work, evidence, open issues and next action; do not append a timeline. Offload details to their authoritative document and link them. Remove superseded status while retaining user constraints, approval pointers and unresolved failures. Keep this handoff compact (roughly 40–60 lines), then resume by reading it, the relevant linked section and git state.
