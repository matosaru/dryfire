# P7 retained owner and memory audit

Reviewed 2026-10-21 against b application revision `496c850`.

## Canonical acceptance checkpoint

[Run 39556414876](https://github.com/matosaru/dryfire/actions/runs/39556414876) completed successfully for `496c85062242b52afa1b0c92ccbe8bd7ca15113d`: validation, public/preview screenshots, public/preview performance and aggregate acceptance all passed. Both editions compared Chromium/WebKit against the unchanged original references and performance policy. The public deliberate-slowdown control passed too. Earlier failed runs remain historical evidence; this checkpoint supersedes their status for this exact revision. It does not complete the remaining cleanup or physical-device checks.

## Consumer-based cleanup findings

An exact-content scan of 305 nonempty JavaScript/TypeScript/TSX/CSS files under src, apps/web/src, packages/ui/src and tools found zero duplicate-file groups. This narrow result does not establish absence of semantic duplication or dead exports.

| Retained implementation | Active consumer and reason | Retirement condition |
| --- | --- | --- |
| Native History/evaluation writers in src/main.js | renderHistory renders saved text before lazy HistoryPage owns it; asynchronous reads keep gun/generation guards. React setResults replaces the native path after explicit handoff. | One first-entry owner preserving immediate text, native verification drafts and failures; original startup/navigation gates must still pass. |
| Native learning and drill cards in src/main.js and src/uiComponents.js | renderClassCards/renderCalibrationCards/renderDrillCatalog/renderCustomCatalog serve first entry and pending/failed module loads. Later typed owners receive exclusive updates. | Replace each first-entry path with measured equivalent, retain recording locks and custom-editor draft lifetimes. |
| Native Settings/live status ports in src/main.js | Preference/capability and meter/status changes work before optional page modules are ready; each port selects exactly one current owner. | Preserve original native picker, meter and preview simulation nodes, capture cleanup and unsupported-browser feedback. |
| Native Practice/Sequence run/review rendering | practiceController/sessionController serve live capture immediately; connectView and connectPage transfer ownership only when unlocked. | Preserve independent engines, save/retry behavior, input drafts and original cue/click timing. |
| Native guide renderer | Lazy guide bridge creates it only for current explicit Open; connectPage/connectView transfer paused examples on later entry. | Preserve silent frame clock, guide context and all frozen frame/GIF comparisons. |
| Rollback node backups in typed page adapters | Initial React commit failure restores exact native nodes, listeners and focus. | Retire with the corresponding native startup path, never remove recovery independently. |
| Native input/context islands | File picker, invalid numeric drafts, meter, safety/capture context and private test controls have approved platform lifetimes. | Intentional boundaries, not generally dead code; a redesign needs independent behavioral evidence. |

The 68 matching native/typed ownership references inspected in main, Practice, Sequence and guide controllers confirm active paths. They are not permission to delete fallback renderers. No product implementation, stylesheet, data schema, screenshot/GIF or original gate changed during this audit.

## Next structural slice

Start with History's read-only evaluation and recognition presentation, keeping async history/gun ownership and native verification controls characterized. Share pure formatting/model decisions before replacing the first-entry owner. Verify first-entry, pending/failed chunks, native drafts, stale reads, both themes/editions, offline and original performance before deleting its fallback. Do not eagerly import React at startup merely to remove source duplication.

## Memory results and limits

[Raw samples and scan evidence](p7-memory-owner-evidence.json) retain two local system-Chromium diagnostics. The committed CI benchmark/policy was not modified.

- 60 Single repetitions: synthetic capture released after every attempt in both original and candidate. Both heaps grow while deliberately saving more results. This test cannot separate intended saved-data retention from a leak.
- 30 fixed-data navigation cycles, with forced GC after each: no page errors. Original nodes/listeners stay2581/450; candidate stabilizes at2302/1742 by cycle5 and remains there through29. More event listeners are consistent with mounted React roots, but this test does not prove every retained listener necessary.
- Candidate heap cycle5→29 grows3808772→4075964 bytes, original2824568→2924672. No ongoing DOM/listener accumulation was observed across these routes. Heap equality, zero leaks, practice lifecycle stability without new saved data, private graph/editor memory and physical Safari behavior are not established.

This resolves the missing fixed-data measurement, not every memory question. Retain these limitations during first-entry retirement; compare again after the relevant owner changes. P7 is still open; P8's final architecture handoff starts only after cleanup acceptance.
