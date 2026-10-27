# Independent structural/cache release

Status: prepared, complete CI acceptance pending. H1's header icon request remains separately blocked by confirmed Chromium Settings timing regressions; it is not abandoned or included in this release.

Candidate: [structural-cache-complete.patch](../../design/review-inputs/structural-cache-complete.patch), based on b2e26f2192401d49f879001f83fc6748c450291c. Restore matching canonical PNG/GIF files from that same immutable commit through the existing complete Test and build workflow:

```text
candidate_patch=docs/design/review-inputs/structural-cache-complete.patch
candidate_design_ref=b2e26f2192401d49f879001f83fc6748c450291c
```

Do not use main71ae's prematurely promoted H1 media as the current shipping image baseline. The b repair restored the images matching the unchanged shipping app; this release retains them. No canonical PNG/GIF changes are needed for structural work.

Included: F2 common context/Settings components, F3 shared setup fields, F4 three Live Listen panels, F5 pure validation/platform operations behind the stable38export persistence facade, F6 preference/library coordinators, H2 deterministic verified release caches and no forced public reload. Complete48component source/CSS/test/public-entry inventory is generated and checked; the entry remains index.html → src/main.js with ADR001 startup/lazy ownership. Both editions and schema4/formats1–4 remain supported.

The shipping header/footer, About template representation and original navigation scroll contract are retained. Unproven Settings layout containment was removed. Actual old/new computed styles and pixels match32page/theme/checked cases with no exception;14compiled header cases match markup, geometry and pixels. Eight page SSR documents remain byte-identical.

Local evidence:1112tests/167suites plus unchanged coverage floors pass, followed by focused release-identity collation and policy/parity checks.16smoke checks, type/lint/architecture/docs and both-edition build/artifact/payload checks pass. The storage logical-owner floor keeps all extracted logic/constants in its full denominator; no floor lowered. Public49587/preview50021gzipJS and12885gzipCSS pass original limits. These are local observations, not pinned acceptance or deployment.

Before publication: all validation, both-edition pinned Chromium/WebKit screenshot/integration jobs, diff probes and all four original timing jobs must pass. Then publish source plus matching current-design metadata together to b and promote through a checked b→main PR. Dev excluded. Preserve the H1 candidate/checkpoints for later isolated correction; never reapply its entire old source tree over this structural release.

Run40477061834 passes validation and all four full performance jobs/controls. Screenshot jobs stopped on an inherited H1 manifest before rendering. The existing shipping manifest is restored (no image changes); fresh-worktree application of the corrected patch/media passes visual:review for all450images, docs and architecture. Restart complete acceptance; the failed run is not final acceptance.
