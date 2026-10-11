# Core application behavior

Revision: 1.2 · State: existing compatibility behavior to preserve; CHG-015 optional-sound correction authorized

Evidence: existing repository instructions, implementation and the requested reference-design update. This document is a baseline, not a claim that future features have shipped.

| ID | Requirement |
| --- | --- |
| CORE-01 | Provide an offline-first web PWA with readable development sources and bundled production assets. |
| CORE-02 | Keep Home, Learn, Drills, Live Listen and History navigation, with Settings accessible from the compact header. Preserve the dark/orange reference design and DF monogram; use **Dry Fire With Ease** branding according to [BRAND-01 through BRAND-05](branding.md). |
| CORE-03 | Preserve four distinct sound identifiers: `draw`, `rack`, `trigger`, `reload`. Display `reload` as magazine change. Do not rename stored identifiers or silently reinterpret learned data. |
| CORE-04 | Learn at least three examples per required sound; recommend eight to ten. Keep the existing maximum of fifty examples per sound until an approved change replaces it. |
| CORE-05 | Store derived acoustic features, not playable raw audio. Recognition runs locally. Raw-audio storage or upload is separate, unapproved scope. |
| CORE-06 | Require the safety acknowledgement before recording or recognition. Retain the warning that acoustic detection cannot establish that equipment is unloaded or verify physical actions. |
| CORE-07 | Continuous recognition detects successive events until the user stops, leaves recognition or hides the app. Keep a distinct single-shot test. Do not assume background microphone operation. |
| CORE-08 | Reset one sound independently with confirmation. Reset all learned sounds separately with confirmation. Both preserve history. In the multi-gun version these operations must be scoped to the selected gun. |
| CORE-09 | Preserve backup import/export, compatible learned profiles, IndexedDB data and manual verification labels. Validate an import before replacing data and require confirmation of replacement. |
| CORE-10 | Base accuracy on manually verified retained detections. Scores are not calibrated probabilities; reported accuracy cannot measure missed events. |
| CORE-11 | Learning animations must have a reduced-motion alternative. Labels, focus states and disabled-state explanations must remain understandable. |
| CORE-12 | Preserve existing built-in drill sequences and their order. A design-only update must not silently replace the recognition engine or data format. |
| CORE-13 | Deploy only minified `dist/`, including bundled service worker and audio worklet, without raw source modules or source maps. Keep the static-assets Wrangler configuration and `previews` block needed by branch previews. |

## Authorized optional-sound correction

The user's CHG-015 instruction supersedes all-four training prerequisites for trigger-based practice. [practice-modes.md](practice-modes.md) records the implemented mode-aware readiness, negative/cue calibration and six modes. Stable four-class identifiers and compatible data are retained; enabling optional recognition is separate from deleting calibration. Validation, publication and deployment are recorded separately in [implementation history](../implementation-history.md).

## Validation

For behavior changes, run the repository's relevant smoke/Jest checks, production build and `verify:dist`, plus meaningful functional checks. A synthetic audio test does not verify real-device microphone behavior or classifier accuracy. Documentation-only edits do not require rerunning the application suite.

## References

- [Existing implementation and previous validation](../development/DESIGN_CHANGES.md)
- [Repository agent instructions](../development/AGENTS.md)
- [Deployment instructions](../development/DEPLOY.md)
