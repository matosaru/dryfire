# Working context

Updated2026-10-24. Details: [history](../implementation-history.md), [SEO plan](../../seo/indexable-routes-plan.md), [proof](../../design/baselines/chg-060-public-review.json).

## Authorization / invariants

Work on b. Latest owner explicitly authorizes promotion to main **once green**, via protected [PR#26](https://github.com/matosaru/dryfire/pull/26). Dev remains frozen. No direct main push/protection bypass. Main base78be09b merges cleanly; merged application tree matches b. Protection-read API403 is not permission to bypass it.

Require complete candidate unit/coverage/integration, both-edition minified artifacts/payload, pinned Chromium/WebKit screenshots and original performance gates/controls before application publication. Review-only patches are allowed on b. Never weaken limits, rebaseline existing images, fish for a passing retry, or treat diagnostic/pending/cancelled checks as acceptance. Retain ADR001 progressive startup, all data/schema/audio/draft/edition behavior. No subagents. Frequent concise updates.

Canonical.com; owner reports .app301 created. Public HTTP is workspace-proxy403 CONNECT denied; no bypass/site-failure inference. Cloudflare owner-managed. Commercial/native/F1–F7 structural work remains separate.

## Published CHG-060

Source ed7e2c8 on b:11prerendered public pages/metadata/XML/robots, readable noindex /app/ paths and favicon.ico. Shared chrome/manuals/GIFs, no public client JS; nonprod root remains app, /welcome/ landing preview. No schema/engine changes; cache83, manifest id/scope retained.398existing app baselines byte-identical;56new public refs/11captures;10GIFbytes unchanged.

Acceptance40098705431 all8green; actual push40099688597 also all8green. Cloudflare b build4ee565e3-add1-4948-b1d7-375e5e7dbff6 SUCCESS. **PR40099821636 fails WebKit warm39→43ms despite identical source tree**. Do not merge yet. Prior failures40082119786/40083144281/40097912906 remain recorded. Classic SW import/eager path inventory fixed; app explicit ICO removed, root fallback/public icon declarations retained.

## Published critical-styles source / remaining returning-startup failure

All8candidate40100798238 passed before publishing31825d7 to b (critical CSS before modules; cache84). Cloudflare b build22396edb-b185-468b-91c5-ba861d57df9f SUCCESS. Push40101754914 and PR40101758094 run on31825d7. Both WebKit comparisons pass; **PR Chromium returning190.1→200.2ms fails**. No merge. Previous explicit-ICO removal and CSS priority did not eliminate every timing failure; do not claim completion from a passing candidate alone.

## Active Home startup candidate

Found init awaited openEntry even for default Home after loading saved gun, unlike pre-SEO startup. Restore non-awaited serialized switchView(home) for legacy/default and explicit Home; keep non-Home deep links awaited and missing/incomplete gun setup guards intact. Actual usability observer and all performance policies unchanged.

Added8VM characterization cases using actual initializer/openEntry source:2Home cases fail before fix, all8 pass afterward; combined25profile/route/startup cases pass. Extended real-browser /app/ returning Home/profile/title assertion. Local artifact/docs pass. The await-only Chromium40102567458 still failed returning182→190.1ms. Candidate now also skips duplicate initial Home history read (loadActiveGun already awaited/rendered statistics); later Home visits still refresh. Two added display cases:1fails/1passes before fix, both pass afterward;34focused tests green. Real browser assertion checks restored Home event count. Cache85 ensures update. Source changes LOCAL, not published: src/main.js, workers/sw.js, new tests/initialEntry.test.js and tests/homeInitialDisplay.test.js, visual-tests/public-site.spec.js, DEPLOY current cache/source fingerprints.

Review-onlyaddaa49 updates patch docs/design/review-inputs/chg-060-home-startup.patch SHA25699e7f75bc44fdaa49e29f9574bffc4d3e712f3fe1b1c48b40afc7c26335aba0d and advisory workflow optional browser input (defaultwebkit; original gate command/policy unchanged). Isolated original Chromium40103350936 SUCCESS; refreshed local Chromium public/deep-link/Home-statistics suite3passed. current patch reverse-check passes. No visible styles/screenshots/GIFframes changed.

## SEO documentation request

Owner additionally requests XML sitemap/all-path documentation on GitHub. Build already emits XML/robots. Added generated docs/seo/routes.md with11public,16app paths, redirects/errors/endpoints/static assets, linked from SEO/architecture indexes. docs generator verifies registry/Worker inventory and rejects drift. Documentation-only b publication; no production endpoint claim before main release.

## Next

If focused gate passes, require complete all8candidate acceptance before application b publication. Remove review patch after acceptance; update PR#26, require all push+PR jobs green and merge only matching tested head. Retain b; dev untouched. Verify main tested source and production Cloudflare build. Record outcomes, keep context concise. No main merge while any current check fails. No F1–F7/commercial/native work during closure.
