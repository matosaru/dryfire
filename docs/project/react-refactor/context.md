# Refactor working context

Updated 2026-10-19 (Europe/Vilnius). Compact handoff; detailed scope/results stay in the linked documents.

## Durable rules

- Continue approved refactor steps automatically; publish verified increments to **b only**. **Main and dev stay unchanged.** No deployment or repeated step approvals.
- Preserve visuals, behavior, saved data, Free/Full boundaries and final performance. Keep source minified and original test/image/performance baselines intact.
- Give progress updates at least every 60 seconds during active work. Save credits by avoiding redundant runs/dev synchronization.
- Report local checks, push, canonical CI and deployment separately. Never turn pending/failed evidence into “passed” or imply unattended background progress.

## Current work

Source: b HEAD (`git log -1` identifies the exact increment). Previous published milestone: Learn `5ce8b77`.

P0/P1 are complete. P2 shared presentation, P3 Home/gun and P4 Settings/Learn/Live Listen presentation/handoffs are verified locally. Initial native fallback retirement remains P7.

Settings retains native file/preview islands; Learn uses shared SoundCard/CalibrationCatalog; Live Listen has pure sequence/distance models and one presentation update port plus a direct meter path. Each loads on first visit and transfers only on a later explicit unlocked entry. Feature controllers still own data, capture, safety and cleanup. Roots preserve values/focus/drafts and restore native nodes/events on failed commit. Native startup/late-CSS cleanup and P5–P7 remain pending.

## Next action

Publish/observe P4 canonical CI, then continue **P5 Drills and History** automatically on b. Preserve built-ins/custom saved data, Free/Full guards, filters, charts and separate history/session reset scopes. Characterize existing owners before transfer; then P6 shared live/example pages and P7 cleanup/performance. No new approval is needed.

## Verification and open debt

This increment: **585 tests / 89 suites**, coverage/type/lint/architecture/docs, 16 smoke checks and both minified artifacts pass. **21 public + 20 Full-preview** Chromium workflows cover mounted Settings/Learn/Live Listen, profiles/drafts/backup/safety and repeated/unknown recognition/verification/Stop/navigation/background. Native/React Dark/Light pixels match exactly; CSS stays 61451 raw / 13011 gzip. Live adapter/models have 100% measured coverage. Canonical P4 CI is not yet observed; no deployment/device-mic claim.

Learn 5ce8b77: canonical validation and both screenshot editions pass. Performance fails on raw/gzip budgets; public deliberate-slowdown proof also failed (run39268272972), with probe-specific diagnosis outstanding. Preserve all 390 image references, 83 captures and 12 guide exports. Local Chromium is diagnostic; pinned Chromium/WebKit owns canonical comparisons. Current initial JS public 171670/52133 raw/gzip, preview172865/52474; +753/+1326 and +782/+1328 vs original. Keep debt visible.

CHG-050 defers optimization until structural work is done. Original gzip/timing gates remain unchanged and failing honestly; see the plan's ledger. Do not claim fresh timing after a size gate stops measurement. Resolve all debt before final release.

## Sources of truth

- [Repository rules](../../../AGENTS.md) and [approved specification](spec.md)
- [Active plan/checklist](plan.md) and [implementation history](../implementation-history.md)
- [Approvals](../approval-log.md), [requirements](../../requirements/README.md), [designs](../../design/README.md)
- [Ownership map](../../architecture/component-map.json), [page handoffs](../../architecture/page-templates.md), [screen/source registry](../../architecture/screen-map.json)

## After every completed task

Replace this summary's current work, evidence, open issues and next action; do not append a timeline. Offload details to their authoritative document and link them. Remove superseded status while retaining user constraints, approval pointers and unresolved failures. Keep this handoff compact (roughly 40–60 lines), then resume by reading it, the relevant linked section and git state.
