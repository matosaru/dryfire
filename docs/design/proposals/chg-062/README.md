# CHG-062 — unpublished header candidate

Approved direction: About → @ Contact → Settings in the shared header, consistent24px icons/44px targets. These104screen/animation assets describe the unpublished candidate, not the current production code.

The b→main merge PR28 included review assets before application-source acceptance. Canonical references are restored to c4e751c, whose application source still matches main71ae074. This package preserves the new designs without making shipping tests expect unshipped UI.

[Review record](review.json) · [complete source patch](../../review-inputs/chg-062-complete.patch). The patch is based on b84ceb4, with that commit's matching proposed canonical assets. Do not apply it directly to a newer checkout without restoring/rebasing those references. Full candidate40204682532 tests that exact source; it is not permission to waive timing failures. No10ms timing exception is approved or implemented. Historical engine-specific baselines remain in b84ceb4.

Next: compare current production and this candidate on the same pinned runner, isolate the rendering regression, then promote source and its reviewed references together only after complete acceptance.
