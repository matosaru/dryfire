# Refactor working context

Updated 2026-10-23 UTC. Refactor implementation and automated acceptance are complete on **b only**; main/dev remain frozen. Do not merge or deploy without new release instructions.

Accepted application: **8a8906e42c3d9342c9343f2e096ee5f5469d5f68**, [CI 39598533411](https://github.com/matosaru/dryfire/actions/runs/39598533411), all six jobs successful: validate, public/preview screenshots, public/preview performance and aggregate acceptance. Local full coverage959 tests/140 suites; original coverage/image/performance gates preserved. Earlier failures remain in evidence/history.

CHG-051 delegates architecture judgement: retain tested native startup adapters plus exclusive guarded lazy React owners. No eager React-only startup. All13 pages and25 UI components have source/CSS/tests/exports; browser entry is src/main.js, typed static markup is composed by tools/page-templates.mjs. Stable native input/file/meter/service/rollback islands intentionally remain. Cleanup removed12 templates,25 CSS wrappers and unused/test-only helpers, sharing preparation/text/history models. Catalogs move inert template nodes; no runtime HTML-string parser. Cache v68. No visual/data/schema/edition behavior change.

Original payload budgets pass: public JS166414raw/50609gzip, preview167988/51082; CSS61451/13011. Memory checks show stable warmed DOM/listener counts with disclosed React heap overhead/growth; no zero-leak/flat-heap claim. Physical iPhone acceptance, deployment and owner release remain separate. No more implementation is required by this refactor plan.

[Plan](plan.md) · [Spec](spec.md) · [Architecture/entry guide](../../architecture/application-structure.md) · [Evidence](final-acceptance-evidence.json) · [History](../implementation-history.md) · [Execution archive](execution-history.md) · [Component map](../../architecture/component-map.json)

## Current work — CHG-053 candidate; full acceptance pending

Work on **b only**. Main/dev frozen; no deployment. Full required tests must pass before application publication; diagnostics and cancelled runs are not passes.

CHG-057 card alignment/removal is published as1623012 following all-eight-job pre-merge CI39900134721. Post-push39901256344 failed the unchanged public WebKit warm timing gate (37→43ms); other validation/screenshots/performance jobs passed. Timing debt remains open.

Unmerged CHG-053 candidate synchronizes Home/Drills/bottom Live Listen entries, explains three-trigger capture requirements and temporary blocking reasons, preserves active Stop and native/React ownership. Typed readiness model; no audio/storage/schema change. Timing controllers construct once when a gun exists rather than during empty onboarding; reset/restore/background paths covered. Checkpoint:1000tests/144suites+coverage and13Chromium lifecycle/readiness workflows pass. Public JS47222gzip/CSS13001gzip within original limits. Pinned screenshots, both-edition final checks and original performance acceptance remain pending.

Next: publish review-only patch/collector metadata, collect24 new pinned guidance states, review images, measure actual startup improvement, then complete full acceptance before applying source. Preserve original baseline, sample counts, thresholds and controls. Source currently remains uncommitted; review patch docs/design/review-inputs/chg-053-listening.patch. No main/dev changes.
