# Refactor working context

Updated 2026-10-22 UTC. Refactor implementation and automated acceptance are complete on **b only**; main/dev remain frozen. Do not merge or deploy without new release instructions.

Accepted application: **8a8906e42c3d9342c9343f2e096ee5f5469d5f68**, [CI 39598533411](https://github.com/matosaru/dryfire/actions/runs/39598533411), all six jobs successful: validate, public/preview screenshots, public/preview performance and aggregate acceptance. Local full coverage959 tests/140 suites; original coverage/image/performance gates preserved. Earlier failures remain in evidence/history.

CHG-051 delegates architecture judgement: retain tested native startup adapters plus exclusive guarded lazy React owners. No eager React-only startup. All13 pages and25 UI components have source/CSS/tests/exports; browser entry is src/main.js, typed static markup is composed by tools/page-templates.mjs. Stable native input/file/meter/service/rollback islands intentionally remain. Cleanup removed12 templates,25 CSS wrappers and unused/test-only helpers, sharing preparation/text/history models. Catalogs move inert template nodes; no runtime HTML-string parser. Cache v68. No visual/data/schema/edition behavior change.

Original payload budgets pass: public JS166414raw/50609gzip, preview167988/51082; CSS61451/13011. Memory checks show stable warmed DOM/listener counts with disclosed React heap overhead/growth; no zero-leak/flat-heap claim. Physical iPhone acceptance, deployment and owner release remain separate. No more implementation is required by this refactor plan.

[Plan](plan.md) · [Spec](spec.md) · [Architecture/entry guide](../../architecture/application-structure.md) · [Evidence](final-acceptance-evidence.json) · [History](../implementation-history.md) · [Execution archive](execution-history.md) · [Component map](../../architecture/component-map.json)

## Current product work — CHG-052 and queued Live Listen

CHG-052 implementation complete locally: three displayed multi-action sequences, six matching icon/title/description/Start Drill practice cards, unchanged Configure/capture/legacy history semantics, cache v69.960/140 tests, static/type/lints/architecture/docs/smoke,13 public layout/help browser workflows, both-edition catalog workflow and4 preview runtime cases pass. Payload: public166465/50631raw/gzip; preview168041/51104; CSS61451/13011 unchanged.16 pinned image candidates from successful39721556553 reviewed/promoted; four design captures updated. Failed collector39721234330 title grep and39721357879 obsolete count assertion retained in review. Temporary collector/patch/candidate code removed. Existing GIF bytes retained after frame/guide equivalence; sources reviewed. Two preexisting generic audit native-select ownership metadata findings remain outside this change; no comprehensive compliance claim.

Documentation-only e9057b7 CI39719816877 independently fails original WebKit warm38→46ms despite unchanged application source. Preserve this checkpoint; final new-source canonical CI still required. Earlier implementation8a8906e acceptance remains true for its exact run only. Finish publishing CHG-052 on b and observe actual normal CI, then execute the next user task below. Main/dev frozen, no release/manual deployment.

Next user task: [Live Listen readiness plan](../live-listen-readiness-plan.md). Home checks busy+trigger readiness, bottom nav only gun/loading; actual listening applies pending/timed guards, and two rendering paths overlap. Synchronize Home/Drills/nav/capture controls, visibly explain unavailable reason/count and preserve active Stop/safety/selected-gun state. Directly requested, no new confirmation needed.
