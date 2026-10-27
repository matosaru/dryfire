# H1/H2 and F2–F6 candidate checkpoint

Current release: independent F2–F7/H2 accepted in [40478835224](https://github.com/matosaru/dryfire/actions/runs/40478835224); source/current-design publication tracked by [PR29](https://github.com/matosaru/dryfire/pull/29). H1 icons remain separate. Earlier checkpoint observations below are historical evidence.

Status: application source is prepared, not released. Shipping b/main source remains unchanged. Complete pinned acceptance is required before publication.

The portable text candidate is [h1-h2-f2-f6-complete.patch](../../design/review-inputs/h1-h2-f2-f6-complete.patch), based on b84366b8. Its matching canonical PNG/GIF references are the immutable H1 source commit b84ceb4a26c5cb0afb33cadf1ca45ed9eedd06ff. These are existing reviewed images, not newly accepted baselines. `tools/apply-review-candidate.mjs` restores only those media paths, then applies the text patch. No image data is embedded in tool output.

Run the complete Test and build workflow on b with:

```text
candidate_patch=docs/design/review-inputs/h1-h2-f2-f6-complete.patch
candidate_design_ref=b84ceb4a26c5cb0afb33cadf1ca45ed9eedd06ff
```

All original jobs remain mandatory: validation/coverage/integration, public/preview artifact verification, both-edition Chromium/WebKit screenshots, diff probe and original four browser performance comparisons. This checkpoint is not permission to publish pending/failing jobs.

Local evidence:1129tests/168suites and unchanged coverage floors pass;16smoke tests, typecheck/lint/dependency checks pass. Eight page HTML documents remain byte-identical;32page/style/pixel cases and14header width/theme cases match locally. Both edition artifacts/payloads pass: public50274gzipJS, preview50706gzipJS,12942gzipCSS. Local Chromium two-release test passes; no hardware microphone or live edge claim.

The persistence facade remains `src/storage.js`; platform/schema/migrations are in `storage/database.js`, normal operations in `storage/library.js`, pure validation in focused modules and confirmed import in `storage/restoreBackup.js`. Restore validation still runs synchronously before its atomic transaction. The original storage coverage minimum is retained over the full extracted logical owner, not an empty facade; policy tests enforce full weighted denominators and missing-file failure.

Cache adoption uses normal waiting-worker activation, no forced reload or public client claim. On a new full load, online HTML/fixed resources revalidate and hashed bundles remain immutable. Complete caches validate digests before being marked usable; open clients retain older caches. No IndexedDB deletion. Existing old workers may require one close/reopen to adopt this policy.

Open: final pinned acceptance, final cleanup/ownership documentation review, then source and matching media publication in one b commit and checked b→main PR promotion. Dev excluded.
