# Startup investigation and next steps

Updated2026-10-25. The original acceptance gate remains unchanged. No timing allowance is approved or implemented.

## Findings

- Production merge PR28 is main71ae074. Its application source/configuration/package files match c4e751c; the new header code was not included. Cloudflare's Worker check succeeded; live content was not independently fetched.
- Main run40204833714 passes all four original performance jobs. Its validation fails at docs:check because the merged guide-export fingerprints describe unpublished code. The new canonical screenshot references also expect the unpublished header.
- This mismatch originated from review assets published to b ahead of the application candidate. Canonical references must accompany the matching code, rather than being independently promoted.
- Unpublished candidate is b84ceb4 plus docs/design/review-inputs/chg-062-complete.patch. Complete run40204682532 passes validation, both pinned screenshot/integration editions and both WebKit performance jobs; both Chromium jobs fail. Current local candidate checks were1096tests/157suites, original coverage and8browser workflows. These are candidate results, not production results.
- Original Chromium run40201179821 measured first Settings interaction median45.4→52.3ms and p9548.8→55ms under4×CPU/40msnetwork latency,39/40slower pairs. This does not establish a live microphone/capture slowdown.
- Pinned phase run40201901424 measured faster navigation dispatch8.2→4.4ms but more layout19.621→22.678ms. Phase metrics include the browser interaction/layout interval; they do not identify the responsible element by themselves.
- Grid/masks/wordmark constraints, frozen header, original Settings markup, forced scrolling and footer paragraph/containment did not demonstrate a sufficient improvement. No experimental layout was applied. Avoid repeating this unsuccessful search.

## Prioritized work

1. **Restore source/reference consistency.** Preserve104proposed screens/GIFs in [the proposal package](../../design/proposals/chg-062/README.md), restore canonical media/manifests to c4e751c and verify against the unchanged app. Publish this correction on b. Do not merge main while checks still fail.
2. **Run one controlled production comparison.** On one pinned Chromium runner, compare immutable main71ae074, exact candidate b84ceb4+patch, and that candidate with only production's original navigation-scroll ordering restored. Keep10rotating diagnostic samples per artifact, CPU4/network40ms, fresh profiles and blocked SWs. This is advisory; acceptance remains20/40paired samples with its original immutable baseline/controls.
3. **Test the navigation-order hypothesis.** The unpublished candidate moved/skipped the explicit scroll reset. Handler speed improved but browser layout grew. Restore the original ordering only inside the diagnostic checkout first; compare layout/DOM/frame timings and identical output screenshots. Do not change application code merely because a hypothesis is plausible.
4. **Make one evidenced correction.** If the controlled test supports it, preserve final scroll position, active view, preferences, data/capture/draft guards and page layout. Characterize final user behavior, rather than retaining an ordering test written solely around the unsuccessful optimization. If it does not help, capture targeted layout invalidation/trace evidence before another change.
5. **Accept source and designs together.** Rebase the preserved candidate, restore its proposed canonical references in the candidate only, regenerate matching examples/fingerprints, then run units/coverage/integration, both builds, both pinned screenshot editions and all four original performance jobs. No timing-budget change or retry fishing.
6. **Release b first.** Publish only after complete candidate acceptance. Main remains a checked PR promotion; dev is outside scope. H2automatic cache refresh and F2–F7 follow-up remain pending.

## Preservation and reproducibility

The complete candidate patch remains committed. Local stash2d7adb5ee2108d1423afa6c144ab0018b31e39d3 and /tmp/dryfire-chg062-unpublished.patch preserve the working candidate as additional local recovery copies. The patch's base b84ceb4 contains the exact proposed engine-specific references; applying it to a different canonical-reference state requires rebasing/restoring them first. Do not discard the stash until the candidate is safely reconstructed.

The existing Advisory startup diagnosis workflow has a separate compare_production mode. It builds immutable production/candidate snapshots and modifies only an isolated candidate checkout for the scroll-order comparison. Reports/screenshots are downloadable artifacts; bounded metrics appear in job step output. The normal performance acceptance harness is unchanged.

## Completed steps and next trace

- Source/reference correction published on b1ec2c75; draft PR29 preserves main. Shipping-source1077tests, docs and450fingerprints passed locally.
- Full repair run40206628358 passes validation, both pinned screenshot/integration editions, both WebKit performance jobs and preview Chromium. Public Chromium reports returning184.7→188.4ms and firstAction27.8→29.1ms. Application source still matches main71ae074, whose earlier four performance jobs passed. This is an existing timing signal/variation, not an application-code regression introduced by reference restoration; do not rerun unchanged builds merely to obtain green.
- Controlled run40206453744 succeeded: production frame median/p9539.4/43.9ms, candidate42.3/53.5ms, original-scroll variant44.8/51.9ms. Layout medians24.839/27.987/30.020ms respectively. Candidate/scroll-variant screenshots are byte-identical. Restoring original scroll order is rejected as a fix.
- Next: collect one separately traced context per artifact, excluded from the10sample diagnostic statistics, and map layout roots/invalidation reasons to DOM nodes. Compare production/current candidate with an isolated root flex-sizing variant. This targets the shared column's automatic minimum-size calculation; it is a hypothesis, not an identified cause or an application change. The local protocol smoke produced identical Settings pixels. Full visual/function/performance acceptance remains mandatory before applying any fix.
