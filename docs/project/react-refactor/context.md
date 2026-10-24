# Working context

Updated2026-10-24. [History](../implementation-history.md), [proof](../../design/baselines/chg-060-public-review.json), [URL catalog](../../seo/routes.md), [PR#26](https://github.com/matosaru/dryfire/pull/26).

## Authorization / invariants

Work on b; owner explicitly/repeatedly authorizes **merge b→main once all green**, through PR#26. Dev untouched. No direct main push/protection bypass. Main78be09b merges cleanly and its merged application tree matches b. Admin protection-read403; do not bypass.

Before application publication require complete candidate unit/coverage/integration, both-edition minified artifact/payload, pinned Chromium/WebKit screenshots and original performance gates/controls. Review-only patches allowed; no weakened thresholds/samples/timeouts, replacement of existing images or passing retry fishing. Retain ADR001 startup/data/schema/audio/drafts/edition behavior. No subagents; concise frequent updates.

Canonical.com; owner reports .app301. Live external HTTP is workspace-proxy403 CONNECT denied, not a site failure; no bypass. Log download redirect also403; no alternate download workaround. Cloudflare owner-managed; observe GitHub check results. Commercial/native/F1–F7 separate later.

## Accepted CHG-060 / publication

11public prerendered pages/metadata/XML/robots, readable noindex /app/, favicon.ico, shared chrome/manuals/GIFs and no public JS. Legacy nonprod root remains app; /welcome/ landing preview. Manifest id/scope/data schema unchanged.398app baselines byte-identical;56new public refs/11captures;10GIFbytes unchanged. docs/seo/routes.md generated all11public/16app/aliases/resources and drift-checked; published3dead9d.

Current Home fix: original non-awaited Home initialization restored (non-Home entries still awaited/guarded); first Home reuses stats already awaited in loadActiveGun, later visits refresh. Cache85.34focused tests and3local Chromium workflows pass (restored profile/title/event count). Isolated original Chromium40103350936 and **all8complete candidate40104091922 SUCCESS**. Review08c6fce patch SHA256be736c3ed5f9f1fec10b97f3b846024aa343d581b652f39ff5070b11070cb5ea, removed only after acceptance. No layout/readiness/gate changes.

Earlier accepted31825d7 deployed b (Cloudflare22396edb-b185-468b-91c5-ba861d57df9f), all8push40101754914 pass but PR40101758094 Chromium returning failed. Earlier failures/partial fixes retained in history; do not erase them.

## Next

Finish publishing this exact accepted source b and update PR#26 body. Wait for **all push+PR jobs green** on matching current head; merge PR#26 retaining b, verify main tested source and production Cloudflare build. No main merge with failed/pending current checks. Record real release outcome and keep context concise. Dev unchanged; no structural/commercial/native implementation. Production live HTTP/favicon/Search Console independent from build success.
