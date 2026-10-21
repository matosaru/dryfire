# Refactor working context

Updated 2026-10-21 (Europe/Vilnius).

## Durable constraints

Approved autonomous refactor. Push **b only**; main/dev frozen, no deployment/release PR. Preserve design/behavior/data/schema/edition/minification and all original coverage/image/performance gates. Update user every60 seconds while active; no unobserved CI/deployment/background claims. Keep this handoff compact; details belong in plan/history/evidence.

## Current architecture and work

P0–P6 structural/presentation/runtime work is verified. CHG-051: after renderer/performance explanation the owner said **“use your judgement”**. Selected retained progressive startup adapters plus guarded lazy React owners, original performance budgets unchanged. [Decision001](../../architecture/decisions/001-progressive-react-startup.md) resolves unconditional first-entry retirement; this is not React-only runtime rendering or a waiver of other requirements.

Cleanup:12 obsolete templates,25 import-only CSS wrappers, test-only runtime helpers, unused declarations and duplicate preparation/text helpers removed/consolidated. All13 pages/25 shared UI packages have colocated source/CSS/test/export; module/presentation/controller ownership is mapped. Native/React History formatting now shares the typed model. Active startup, rollback and platform-input islands remain intentional; exact305-file scan found no duplicate files, not proof of zero semantic duplication. Known strict UI audit/native-validation findings are not silently declared compliant.

P7 final optimization uses direct ID lookup for the same13 screen hosts; cache v65. P8 factual guide prepared: [application structure and entry points](../../architecture/application-structure.md). P7/P8 completion awaits final implementation CI.

## Verification and outstanding evidence

Prior History implementation:953 tests /138 suites, unchanged coverage ratchet, type/lint/architecture/docs,16 smoke checks, both static payload gates and4 public +8 preview browser workflows pass. Original CSS61451/13011 raw/gzip,390 image references,83 captures,12 GIFs unchanged.

CI39584821542 at48466f8: validate and both screenshot editions pass, public performance page.goto timeout, preview confirmed navigation27.6→29ms (37/40 slower). Do not replace this with older green checkpoint496c850 or05733a1. Current direct-ID fix passes20 affected tests,10 public browser workflows, static public JS166223/50557 raw/gzip and a4-pair local original-revision timing diagnostic; new canonical CI must be observed. [Final evidence](final-acceptance-evidence.json).

Memory:60 repetitions release capture but save growing results;30 fixed-data navigation cycles stabilize DOM/listeners after lazy initialization. Candidate heap overhead/growth remains disclosed; no zero-leak/equal-memory claim. See [samples](p7-memory-owner-evidence.json). Private editor/graph fixed-data heap and physical iPhone acceptance remain outside this measurement. Original public worktree:/tmp/dryfire-original-public at6c38bff, independently installed/built.

## Next action

Publish final navigation/architecture increment to b. Run final full coverage/ratchet and both-edition artifact/runtime checks; observe canonical both-edition CI without weakening gates. Fix any observed reproducible failure. Once green, mark P7 automated and P8 architecture handoff complete, preserve hardware/production-release limitations, update plan/history/context and push documentation on b. No main/dev changes or live deployment.

## Sources

[Spec](spec.md), [plan](plan.md), [history](../implementation-history.md), [approvals](../approval-log.md), [component registry](../../architecture/component-map.json), [screens](../../architecture/screen-map.json), [architecture](../../architecture/application-structure.md).
