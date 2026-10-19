# Refactor working context

Updated 2026-10-19 (Europe/Vilnius). Compact handoff; detailed scope/results stay in the linked documents.

## Durable rules

- Continue approved refactor steps automatically; publish verified increments to **b only**. **Main and dev stay unchanged.** No deployment or repeated step approvals.
- Preserve visuals, behavior, saved data, Free/Full boundaries and final performance. Keep source minified and original test/image/performance baselines intact.
- Give progress updates at least every 60 seconds during active work. Save credits by avoiding redundant runs/dev synchronization.
- Report local checks, push, canonical CI and deployment separately. Never turn pending/failed evidence into “passed” or imply unattended background progress.

## Current work

Source: b HEAD (`git log -1` identifies the exact increment). Previous published milestone: P4 `a9c0a8b`.

P0/P1 are complete; P2 shell, P3 profile pages and P4 Settings/Learn/Live Listen presentation/handoffs are verified. Native startup fallback retirement remains P7.

**Active: P5. Drills composition is implemented.** DrillsPage/DrillCard and PracticeCatalog own presets/collections/mode choices after a later unlocked entry. The custom editor retains its exact native form/private draft/handlers/validation/selection inside reusable RetainedNode (also used by Settings). An explicit non-layout structural class preserves the editor-adjacent spacing selector. Full-caption/simulation changes use the page port. Four numbered headings reuse PageHeading with unchanged startup Back bindings. Custom-editor UI, History and P6/P7 remain pending.

## Next action

Publish/observe this increment's canonical CI, then continue **P5 native custom-editor UI transfer and History** automatically on b. Preserve reorder/limits/invalid drafts/saved IDs and Free edit/use vs Full creation; then history/saved-session scopes/graphs and stale-owner guards. Continue P6 shared live/example pages, then P7 cleanup/performance. No new approval is needed.

## Verification and open debt

This increment: **596 tests / 93 suites**, coverage/type/lint/architecture/docs, 16 smoke checks and both minified artifacts pass. **23 public + 22 Full-preview** Chromium workflows cover all mounted pages, open invalid editor parity/draft retention, saved preset edits/selection, Full creation and private simulation. Offline refresh imports/mounts Drills from the original cache. UI packages have 100% measured coverage; Drills mount branches 94%. CSS remains 61451 raw/13011 gzip and every image/GIF baseline is unchanged. Canonical CI for this source is not yet observed.

P4 a9c0a8b: canonical validation and both screenshot editions pass; performance fails. Prior public deliberate-slowdown proof failure (run39268272972) remains in the final-gate ledger. Preserve 390 image references, 83 captures, 12 guide exports. Local Chromium is diagnostic; pinned Chromium/WebKit owns canonical comparisons. Current initial JS public 172841/52448 raw/gzip, preview 174082/52790; +1924/+1641 and +1999/+1644 vs original. Keep debt visible.

CHG-050 defers optimization until structural work is done. Original gzip/timing gates remain unchanged and failing honestly; see the plan's ledger. Do not claim fresh timing after a size gate stops measurement. Resolve all debt before final release.

## Sources of truth

- [Repository rules](../../../AGENTS.md) and [approved specification](spec.md)
- [Active plan/checklist](plan.md) and [implementation history](../implementation-history.md)
- [Approvals](../approval-log.md), [requirements](../../requirements/README.md), [designs](../../design/README.md)
- [Ownership map](../../architecture/component-map.json), [page handoffs](../../architecture/page-templates.md), [screen/source registry](../../architecture/screen-map.json)

## After every completed task

Replace this summary's current work, evidence, open issues and next action; do not append a timeline. Offload details to their authoritative document and link them. Remove superseded status while retaining user constraints, approval pointers and unresolved failures. Keep this handoff compact (roughly 40–60 lines), then resume by reading it, the relevant linked section and git state.
