# Refactor working context

Updated 2026-10-23 UTC. Refactor implementation and automated acceptance are complete on **b only**; main/dev remain frozen. Do not merge or deploy without new release instructions.

Accepted application: **8a8906e42c3d9342c9343f2e096ee5f5469d5f68**, [CI 39598533411](https://github.com/matosaru/dryfire/actions/runs/39598533411), all six jobs successful: validate, public/preview screenshots, public/preview performance and aggregate acceptance. Local full coverage959 tests/140 suites; original coverage/image/performance gates preserved. Earlier failures remain in evidence/history.

CHG-051 delegates architecture judgement: retain tested native startup adapters plus exclusive guarded lazy React owners. No eager React-only startup. All13 pages and25 UI components have source/CSS/tests/exports; browser entry is src/main.js, typed static markup is composed by tools/page-templates.mjs. Stable native input/file/meter/service/rollback islands intentionally remain. Cleanup removed12 templates,25 CSS wrappers and unused/test-only helpers, sharing preparation/text/history models. Catalogs move inert template nodes; no runtime HTML-string parser. Cache v68. No visual/data/schema/edition behavior change.

Original payload budgets pass: public JS166414raw/50609gzip, preview167988/51082; CSS61451/13011. Memory checks show stable warmed DOM/listener counts with disclosed React heap overhead/growth; no zero-leak/flat-heap claim. Physical iPhone acceptance, deployment and owner release remain separate. No more implementation is required by this refactor plan.

[Plan](plan.md) · [Spec](spec.md) · [Architecture/entry guide](../../architecture/application-structure.md) · [Evidence](final-acceptance-evidence.json) · [History](../implementation-history.md) · [Execution archive](execution-history.md) · [Component map](../../architecture/component-map.json)

## Current work — CHG-058 shared configuration candidate

**b only; main/dev frozen; owner-managed Cloudflare.** CHG057 cards and CHG053 Live Listen publishedda08937, all8 post-push39904517004 jobs green.1000 prior tests/144suites. Handoff906d42d.

Owner now requests Sequence setup template reused by Single trigger drills; shared PracticePage serves all4 retained trigger modes. Requirements docs/requirements/drill-setup-template.md, approvalCHG058. New DrillSetup component owns form/fieldset, numeric card row and ordered steps; Sequence retains exact frozen DOM, canonical setup CSS relocated byte-for-byte. Practice uses compact count/Par cards, signal/delay cards, separate switch card, ordered sound labels. App/external visibility, native retained forms, values/bounds/focus/capture/safety/storage/editions unchanged. Old practice-only step-margin override removed; complete CSS equals prior cascade with only that rule removed.

Baseline install/1000unit+16smoke/build/verify pass.65focused unit+8parity checks and 320/390all-mode configuration browser checks pass;6microphone/automatic-repeat browser workflows pass. First coverage checkpoint had2intentional frozen reference failures; reviewed new practice fixture plus explicit unchanged controls/run/review invariants added, Sequence reference unchanged. Final coverage pending. Public JS47205gzip/CSS12990gzip within original limits. Local screenshot reviewed. Need pinned collection/review, both-edition full tests, original performance gate before application commit. Generic UI audit same2 preexisting native-select findings documented in ui-contract-map.

Next: publish review-only patch/collector metadata, collect affected Practice references, remove collection bypass before complete acceptance patch, run all8CI jobs then publish source only on success. Main/dev/deployment unchanged; never claim pending/cancelled/diagnostic tests pass. Preserve all original gates/baselines/controls/sample counts.
