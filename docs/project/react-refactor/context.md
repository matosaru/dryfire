# Refactor working context

Updated 2026-10-22 UTC. Refactor implementation and automated acceptance are complete on **b only**; main/dev remain frozen. Do not merge or deploy without new release instructions.

Accepted application: **8a8906e42c3d9342c9343f2e096ee5f5469d5f68**, [CI 39598533411](https://github.com/matosaru/dryfire/actions/runs/39598533411), all six jobs successful: validate, public/preview screenshots, public/preview performance and aggregate acceptance. Local full coverage959 tests/140 suites; original coverage/image/performance gates preserved. Earlier failures remain in evidence/history.

CHG-051 delegates architecture judgement: retain tested native startup adapters plus exclusive guarded lazy React owners. No eager React-only startup. All13 pages and25 UI components have source/CSS/tests/exports; browser entry is src/main.js, typed static markup is composed by tools/page-templates.mjs. Stable native input/file/meter/service/rollback islands intentionally remain. Cleanup removed12 templates,25 CSS wrappers and unused/test-only helpers, sharing preparation/text/history models. Catalogs move inert template nodes; no runtime HTML-string parser. Cache v68. No visual/data/schema/edition behavior change.

Original payload budgets pass: public JS166414raw/50609gzip, preview167988/51082; CSS61451/13011. Memory checks show stable warmed DOM/listener counts with disclosed React heap overhead/growth; no zero-leak/flat-heap claim. Physical iPhone acceptance, deployment and owner release remain separate. No more implementation is required by this refactor plan.

[Plan](plan.md) · [Spec](spec.md) · [Architecture/entry guide](../../architecture/application-structure.md) · [Evidence](final-acceptance-evidence.json) · [History](../implementation-history.md) · [Execution archive](execution-history.md) · [Component map](../../architecture/component-map.json)

## Active product task — CHG-052 final acceptance

Three multi-action sequences, six matching icon/title/description/Start Drill practice cards; legacy trigger sessions/history/repeat preserved.16 pinned Drills baselines/four current captures reviewed. a190f9a CI39726986360:963/140 validate and both complete screenshot jobs PASS; preview performance PASS, public WebKit warm38→44 ms FAIL. No gate/reference changes.

v74 application854d0a0 CI39812900361:963/140 validation and both complete screenshot jobs pass; preview primary timing and all controls pass; public WebKit warm36→43ms fails. Top-level statuses lagged detailed completed steps; inspect actual step outcomes, not queued summaries. No thresholds/readiness/reference changes.

b application HEADc3c8903 (v75) CI39817683863: validation and preview primary timing pass; public WebKit warm40→46ms (39/40 slower, DOMInteractive16→23) fails. Superseded remaining CI cancellation requested. Onboarding guard alone is not the startup fix. No policy/threshold/image/readiness changes.

Local v76 candidate: load shared src/sessionPresentation.js before Practice/Sequence configuration or saved review (not startup), retain the same models/renderers. Recoveries await read-only review preparation. Navigation/reset/gun changes invalidate pending imports; failures leave current data/page intact, allow retry and do not announce stale cancelled-review errors. Restore established inert-template catalog movement; remove experimental runtime HTML-string parsing.106 focused tests/5 suites,987 full tests/140 suites+coverage ratchet,20 public browser workflows (native/React parity, guides, session lifetime and installed offline refresh) pass. Public critical JS156872raw/47683gzip; CSS61451/13011. Preview20 workflows pass; critical JS158445raw/48147gzip. Type/lints/architecture/docs and16 smoke pass. Docs/fingerprints reviewed. Publish b and observe unchanged canonical CI. Main/dev frozen. No deployment claim.

Configuration hover diagnosis and corrected soft-step interpretation remain in CHG052 evidence/history. Explicit logical native-field hover preserves all original configuration references; do not rebaseline them. Only actual raw test outcomes plus whole-job/run results establish success.

Next: Live Listen readiness after CHG052 green. Future tests are /tmp/listeningReadiness.test.js.pending and /tmp/live-listen-readiness.spec.js.pending; restore when implementation starts. Future local approval-log/requirements-index/new requirement file are not part of current source correction. Shared navigation should open guidance for valid loaded gun even with0/2 trigger recordings; actual capture needs3 and no busy/loading/pending/timed/unsaved action. Pure reason-code model, centralized Home/Drills/nav/capture states; visible trainingSummary counts/recovery. Preserve active Stop, safety, optional sounds, data/schema/editions. Plan: ../live-listen-readiness-plan.md. Continue autonomously on b only.
