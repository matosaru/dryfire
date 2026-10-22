# Refactor working context

Updated 2026-10-22 UTC. Refactor implementation and automated acceptance are complete on **b only**; main/dev remain frozen. Do not merge or deploy without new release instructions.

Accepted application: **8a8906e42c3d9342c9343f2e096ee5f5469d5f68**, [CI 39598533411](https://github.com/matosaru/dryfire/actions/runs/39598533411), all six jobs successful: validate, public/preview screenshots, public/preview performance and aggregate acceptance. Local full coverage959 tests/140 suites; original coverage/image/performance gates preserved. Earlier failures remain in evidence/history.

CHG-051 delegates architecture judgement: retain tested native startup adapters plus exclusive guarded lazy React owners. No eager React-only startup. All13 pages and25 UI components have source/CSS/tests/exports; browser entry is src/main.js, typed static markup is composed by tools/page-templates.mjs. Stable native input/file/meter/service/rollback islands intentionally remain. Cleanup removed12 templates,25 CSS wrappers and unused/test-only helpers, sharing preparation/text/history models. Catalogs move inert template nodes; no runtime HTML-string parser. Cache v68. No visual/data/schema/edition behavior change.

Original payload budgets pass: public JS166414raw/50609gzip, preview167988/51082; CSS61451/13011. Memory checks show stable warmed DOM/listener counts with disclosed React heap overhead/growth; no zero-leak/flat-heap claim. Physical iPhone acceptance, deployment and owner release remain separate. No more implementation is required by this refactor plan.

[Plan](plan.md) · [Spec](spec.md) · [Architecture/entry guide](../../architecture/application-structure.md) · [Evidence](final-acceptance-evidence.json) · [History](../implementation-history.md) · [Execution archive](execution-history.md) · [Component map](../../architecture/component-map.json)

## Active product task — CHG-054/055 four-mode catalog and complete retirement

Owner supersedes preserving removed-mode history: **“Only Reload/Free sessions”** must be deleted; remove their code/manuals/media and optimize remaining structure. Trigger Press Group has single/repeated/par/control, then unchanged Sequence drills. b only; main/dev frozen. No Cloudflare deployment.

Application changes are local pending final checks: one shared four-mode list, retired engine/config/guide/statistics branches removed, schema 4 removes only retired sessions/settings across guns, imports filter those records while validating supported data atomically. Necessary retirement IDs/old config keys remain only at storage boundary and regression fixtures. Magazine-change sounds/sequence drills retained.

Pinned candidate collector39825212092 success, bot commitbb2befa. Reviewed/promoted40 intended images and removed28 retired golden PNGs/seven current captures; ten retained GIFs/full-frame characterizations unchanged. Temporary collectors/candidates/patches removed locally. Review: docs/design/baselines/chg-055-retirement-review.json.

Local acceptance complete:964/141 and unchanged coverage ratchet pass (/tmp/chg055-frozen-coverage.log), plus4/4 selective migration/import tests (/tmp/chg055-retained-import.log). Public12/12 and preview10/10 browser checks pass;16smoke,typecheck,lints,architecture/docs/visual manifest pass. Original payload budgets pass public153864/46860gzip,preview155435/47325,CSS61451/13011. No retained animation frame/media change;40 pinned intended candidates reviewed. Intermediate failures/corrections retained in history. No more runtime changes before publication.

Next publish the actual application changes to b and observe full remote CI. Update this handoff with application SHA/run. Main/dev unchanged. Physical device and Cloudflare unverified.

CHG-053 Live Listen remains queued. Requirements draft tracked with approval/index; implementation notes /tmp/live-listen-implementation-notes.md and test drafts /tmp/listeningReadiness.test.js.pending, /tmp/live-listen-readiness.spec.js.pending. No runtime implementation.

Next: complete checks, publish actual application to b; leave main/dev unchanged. Earlier unresolved performance evidence stays in chg-052-card-review.json; original gates/baselines remain unchanged.
