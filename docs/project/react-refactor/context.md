# Working context

Updated2026-10-24. Details: [history](../implementation-history.md), [SEO plan](../../seo/indexable-routes-plan.md), [proof](../../design/baselines/chg-060-public-review.json).

## Authorization / invariants

Work on b. Latest owner explicitly authorizes promotion to main **once green**, via protected [PR#26](https://github.com/matosaru/dryfire/pull/26). Dev remains frozen. No direct main push/protection bypass. Main base78be09b merges cleanly; merged application tree matches b. Protection-read API403 is not permission to bypass it.

Require complete candidate unit/coverage/integration, both-edition minified artifacts/payload, pinned Chromium/WebKit screenshots and original performance gates/controls before application publication. Review-only patches are allowed on b. Never weaken limits, rebaseline existing images, fish for a passing retry, or treat diagnostic/pending/cancelled checks as acceptance. Retain ADR001 progressive startup, all data/schema/audio/draft/edition behavior. No subagents. Frequent concise updates.

Canonical.com; owner reports .app301 created. Public HTTP is workspace-proxy403 CONNECT denied; no bypass/site-failure inference. Cloudflare owner-managed. Commercial/native/F1–F7 structural work remains separate.

## Published CHG-060

Source ed7e2c8 on b:11prerendered public pages/metadata/XML/robots, readable noindex /app/ paths and favicon.ico. Shared chrome/manuals/GIFs, no public client JS; nonprod root remains app, /welcome/ landing preview. No schema/engine changes; cache83, manifest id/scope retained.398existing app baselines byte-identical;56new public refs/11captures;10GIFbytes unchanged.

Acceptance40098705431 all8green; actual push40099688597 also all8green. Cloudflare b build4ee565e3-add1-4948-b1d7-375e5e7dbff6 SUCCESS. **PR40099821636 fails WebKit warm39→43ms despite identical source tree**. Do not merge yet. Prior failures40082119786/40083144281/40097912906 remain recorded. Classic SW import/eager path inventory fixed; app explicit ICO removed, root fallback/public icon declarations retained.

## Accepted critical-styles source / release next

Build-only prioritizeAppStyles discovers existing CSS after viewport/before modules; preserves attributes, stylesheet order and body. Cache84 refreshes installed shells without deleting data. Six HTML/19focused tests, local artifacts/docs pass. Isolated original WebKit40100375551 and **all8candidate40100798238 SUCCESS**. Review407c745 patch SHA2563eb494568233bbe50c2cfaf9acd153d57451c7788229fc92df230e7a624f392a removed only after acceptance. No screenshots/GIFframes or performance limits changed.

Publishing exact accepted source b, then update PR#26 and wait for all push+PR jobs green. Merge only with matching tested head; retain b branch. Verify main contains tested source and Cloudflare production build succeeds. Record real outcomes. Main promotion is authorized; dev remains untouched. Public live HTTP/Search Console still independent. Do not start F1–F7 during release closure.
