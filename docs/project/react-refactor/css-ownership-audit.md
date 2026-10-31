# CSS ownership and cleanup audit

Audited 2026-10-31 on `b` after the accepted `8e85e41` release. The audit follows the ordered import graph from `src/styles.css`; changing that order is outside this cleanup because it is part of the verified visual cascade.

## Shipping ownership map

| Owner | Sources | Responsibility |
| --- | ---: | --- |
| `src/styles.css` | 1 | Ordered application stylesheet entry point only |
| `apps/web/src/pages/*` | 13 | Complete page-specific layout and states |
| `packages/ui/src/*` | 28 | Reusable component styles colocated with their component |
| `apps/web/src/styles/*` shared owners | 6 | Shell, navigation, shared session/theme behavior |
| `apps/web/src/styles/legacy-*` | 26 | Preserved cascade fragments awaiting evidence-based migration or deletion |

`tools/style-sources.mjs` is the authoritative import walker used by source contracts and media fingerprints. There are 74 sources in the current graph. A source is not moved merely to improve its name: visual ownership and cascade order must remain demonstrably unchanged.

## Proven-unused cleanup

The first cleanup searched application source, page templates, UI packages, workers, tests and visual fixtures for every class or ID referenced by candidate rules. It also checked partial names and dynamic class construction before deletion. The following selectors had no possible shipping producer and represented removed layouts:

- Home and generic copy: `.subhead`, `.home-kicker`, `.stat-icon`, `.home-steps`.
- Sound/gun/custom drill remnants: `.class-symbol`, `.gun-card-chevron`, `.custom-step-number`.
- Retired session presentation: `.session-record-header`, `.session-record-meta`, `.session-summary-stats`, `.practice-mode-tag`.

The cleanup removes 23 rule/selectors across 12 owners, including dead members of light-theme and responsive selector groups. `tests/styleSources.test.js` prevents these retired selectors from silently returning. The public application stylesheet changes from 61,405 to 59,685 raw bytes (1,720 bytes smaller); its built gzip measurement is 12,617 bytes. The separate public-site stylesheet remains 1,318 raw / 554 gzip bytes.

The first pinned candidate exposed an unrelated one-byte preview critical-JavaScript overage caused by changed release/chunk identities. The unchanged budget was retained. The private React ownership attribute `data-react-back` is now `data-r-back` across its single runtime contract and tests, reducing the preview entry chunk by eight raw bytes and restoring payload headroom without changing markup semantics, styling or user behavior.

## Safe continuation

1. Keep removing rules only when no runtime producer exists and exact Chromium/WebKit screenshots remain unchanged.
2. Migrate a `legacy-*` fragment to a page or component owner only when all its selectors share that owner and preserving import position keeps the cascade identical.
3. Consider route CSS splitting only after first-run, returning, deep-route, theme, offline and Back/Forward loading states are characterized. A page must never become visible before its styles.
4. Retain the accepted blocking stylesheet load order until a candidate passes the original payload and browser timing gates. Lighthouse alone is not an acceptance result.

