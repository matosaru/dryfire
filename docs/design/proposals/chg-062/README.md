# CHG-062 — unpublished header candidate

Approved direction: About → @ Contact → Settings in the shared header, consistent24px icons/44px targets. These104screen/animation assets describe the unpublished candidate, not the current production code.

The b→main merge PR28 included review assets before application-source acceptance. Canonical references are restored to c4e751c, whose application source still matches main71ae074. This package preserves the new designs without making shipping tests expect unshipped UI.

[Review record](review.json) · [complete source patch](../../review-inputs/chg-062-complete.patch). The patch is based on b84ceb4, with that commit's matching proposed canonical assets. Do not apply it directly to a newer checkout without restoring/rebasing those references. Full candidate40204682532 tests that exact source; it is not permission to waive timing failures. No10ms timing exception is approved or implemented. Historical engine-specific baselines remain in b84ceb4.

Next: compare current production and this candidate on the same pinned runner, isolate the rendering regression, then promote source and its reviewed references together only after complete acceptance.


## Resumed header candidate — 2026-10-27

Owner resumed H1, removed duplicate bottom information links and added clickable Home branding. The new [header preview](resume-screens/header.dark.390.png) and [53 capture files](resume-screens/capture.json) cover all13 page types, both themes and320/390px. These are actual local system-Chromium captures, not canonical pinned references. [Source/style review](header-resume-review.json) records the scoped audit and cleanup parity. Historical captures above remain separate; main/b still use the shipping header until full acceptance.

Current candidate uses one BrandHeader for About / drawn @ Contact / Settings and one Home logo/wordmark link. Icons are24px with44px targets, active/focus states, names and keyboard/pointer labels. The data/copyright/private notice and fixed five-item navigation remain. Old footer controls/exports, unused legacy icon/brand/status styling and obsolete footer CSS are removed. No new route, schema or private feature is introduced.

The owner paused WebKit startup diagnosis. A separate reproduced Lighthouse issue is also addressed in the candidate: avoid startup's redundant scrollTo and perform later scroll resets before page-state writes. Its local traced app-attributed41.155ms forced layout disappears. This does not prove a total performance speedup or eliminate required CSS loading. Full pinned screenshots and original performance checks remain unverified; no timing/baseline relaxation is implied.


### Run the complete review candidate

On GitHub Actions, run **Test and build** on branch **b**:

- `candidate_patch`: `docs/design/review-inputs/header-home-layout.patch`
- `candidate_design_ref`: `b84ceb4a26c5cb0afb33cadf1ca45ed9eedd06ff`

The helper restores only the existing proposed H1 PNG references; it deliberately retains current guide GIFs. Two Git-backed helper regression tests protect that boundary. Do not use the older complete H1 source patch, which predates the structural release. The current patch hash and local1135-test/both-edition evidence are in [the review record](header-resume-review.json). All original CI checks remain enabled. Apply this exact source/reference candidate only after acceptance; review-only publication is not an app deployment.
