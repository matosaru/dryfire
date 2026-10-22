# Refactor working context

Updated 2026-10-22 UTC. Refactor implementation and automated acceptance are complete on **b only**; main/dev remain frozen. Do not merge or deploy without new release instructions.

Accepted application: **8a8906e42c3d9342c9343f2e096ee5f5469d5f68**, [CI 39598533411](https://github.com/matosaru/dryfire/actions/runs/39598533411), all six jobs successful: validate, public/preview screenshots, public/preview performance and aggregate acceptance. Local full coverage959 tests/140 suites; original coverage/image/performance gates preserved. Earlier failures remain in evidence/history.

CHG-051 delegates architecture judgement: retain tested native startup adapters plus exclusive guarded lazy React owners. No eager React-only startup. All13 pages and25 UI components have source/CSS/tests/exports; browser entry is src/main.js, typed static markup is composed by tools/page-templates.mjs. Stable native input/file/meter/service/rollback islands intentionally remain. Cleanup removed12 templates,25 CSS wrappers and unused/test-only helpers, sharing preparation/text/history models. Catalogs move inert template nodes; no runtime HTML-string parser. Cache v68. No visual/data/schema/edition behavior change.

Original payload budgets pass: public JS166414raw/50609gzip, preview167988/51082; CSS61451/13011. Memory checks show stable warmed DOM/listener counts with disclosed React heap overhead/growth; no zero-leak/flat-heap claim. Physical iPhone acceptance, deployment and owner release remain separate. No more implementation is required by this refactor plan.

[Plan](plan.md) · [Spec](spec.md) · [Architecture/entry guide](../../architecture/application-structure.md) · [Evidence](final-acceptance-evidence.json) · [History](../implementation-history.md) · [Execution archive](execution-history.md) · [Component map](../../architecture/component-map.json)

## Active product task — CHG-052 final acceptance

Three multi-action sequences, six matching icon/title/description/Start Drill practice cards; legacy trigger sessions/history/repeat preserved.16 pinned Drills baselines/four current captures reviewed. a190f9a CI39726986360:963/140 validate and both complete screenshot jobs PASS; preview performance PASS, public WebKit warm38→44 ms FAIL. No gate/reference changes.

v74 candidate: compiler-escaped catalog payload on existing host data-catalog (no extra script/template nodes), quoted attributes retained with safe boolean compaction. Practice prepares after usable paint with synchronous first-entry fallback; calibration before Learn. OXC/LightningCSS unchanged. Exact DOM/escaping/actions tests and full963/140 coverage+ratchet pass;14 preview workflows pass. Preview critical JS168088raw/51099gzip; CSS61451/13011. Pinned crossed-source advisory39728971313 passes, sampled ready54→48ms; NOT canonical acceptance. Remove standalone diagnostic/patch, publish current source to b and observe full original CI. Main/dev frozen; no deployment claim.

Configuration hover diagnosis and corrected soft-step interpretation remain in CHG052 evidence/history. Explicit logical native-field hover preserves all original configuration references; do not rebaseline them. Only actual raw test outcomes plus whole-job/run results establish success.

Next: Live Listen readiness after CHG052 green. Future tests are /tmp/listeningReadiness.test.js.pending and /tmp/live-listen-readiness.spec.js.pending; restore when implementation starts. Future local approval-log/requirements-index/new requirement file are not part of current source correction. Shared navigation should open guidance for valid loaded gun even with0/2 trigger recordings; actual capture needs3 and no busy/loading/pending/timed/unsaved action. Pure reason-code model, centralized Home/Drills/nav/capture states; visible trainingSummary counts/recovery. Preserve active Stop, safety, optional sounds, data/schema/editions. Plan: ../live-listen-readiness-plan.md. Continue autonomously on b only.
