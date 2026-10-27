# Reusable presentation checkpoint

2026-10-26 · source prepared, not accepted for release or deployed.

## Prepared code

- GunContext: the same contextual paragraph reused by eight pages.
- SettingsSection: six Settings groups, with native child identity and layout containment.
- SettingsAction: three existing icon actions, with unchanged names, callbacks and disabled behavior.
- PreferenceToggle: three Settings switches and both drill start-sound controls, preserving uncontrolled native values and accessible descriptions.
- Colocated CSS/tests/exports and feature-component architecture verification;45 component/page packages.
- One lazy pageFields chunk groups tiny common primitives without eagerly loading React. Removed one emptied legacy CSS file; no duplicate style declarations added.

There are no new product controls, storage keys, routes, numeric limits or paid features. The shared native startup adapters remain under ADR001.

## Evidence

-1103 tests /161 suites and the existing coverage ratchet pass.
- Type checking, component lint, architecture, docs and smoke checks pass.
- Eight page documents are byte-identical before/after extraction.
-32 local theme/toggle cases across eight pages:1872 elements, full-page pixels identical; computed element/pseudo styles identical except the intentional Settings layout-containment property. This is local equivalence evidence, not pinned-browser acceptance.
- Public critical JS50630gzip /CSS12902gzip; preview JS51114gzip /CSS12902gzip. Both original payload budgets and both build/artifact verifications pass.

Pinned screenshots/integration and the complete original timing gate are still required. The earlier header flat-box candidate failed40392249158; the fixed-menu advisory40393289420 did not show sufficient improvement. Both header experiments were removed. The current Settings containment must still be measured; no performance exception is approved.

## Reproduction

Preserved local detached candidate commit:010054438727a03095e299f82f7679dd50224969 in /workspace/dryfire-header-release. It is not an application branch publication.

Portable source chain:

1. Check out immutable b84ceb4a26c5cb0afb33cadf1ca45ed9eedd06ff in an isolated checkout.
2. Apply docs/design/review-inputs/chg-062-complete.patch.
3. Apply [f2-reusable-components.patch](../../design/review-inputs/f2-reusable-components.patch). Its base tree after step2 is dedbc6c31950258e9f8bdc7d9e3594d7f8235a55.

The [h1-f2-runtime.patch](../../design/review-inputs/h1-f2-runtime.patch) is a separate runtime-only benchmark input against current shipping b. It deliberately excludes matching design references and must not be treated as a complete release candidate or applied as a production release.

Keep code, canonical media and source-review metadata together during eventual application promotion. H2 remains specified, not implemented; F3–F7 remain to finish. Main promotion requires full acceptance.
