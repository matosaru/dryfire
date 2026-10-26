# Release asset updates

Status: approved task; implementation pending H2. The owner requested automatic resource refresh after releases and subsequently authorized all remaining plan tasks. This does not authorize deletion of saved user data or a performance exception.

| ID | Requirement |
| --- | --- |
| UPDATE-01 | Every production build has a deterministic release identity derived from the source revision and actual application/public-asset content. Rebuilding identical input must not add a wall-clock timestamp. Changed public images must also change release identity. |
| UPDATE-02 | Keep Vite content-hashed JS/CSS URLs. Revalidate HTML, service-worker code and release metadata. Do not add timestamp queries to every request or clear all browser storage. |
| UPDATE-03 | Install a complete new offline asset set into its own release cache. A failed or inconsistent install leaves the previous working release usable. Validate metadata edition and release identity before activation. |
| UPDATE-04 | A running drill, microphone capture, permission request, save/import, safety dialog, unsaved result or configuration/edit draft must never be interrupted by an automatic reload. Prefer a safe Home boundary after the pending operation finishes. |
| UPDATE-05 | Coordinate open tabs before activating an update automatically. A busy/unresponsive/older client postpones activation; it must not lose lazy bundles because another tab deletes its release cache. Normal worker lifecycle remains a safe fallback. |
| UPDATE-06 | After a safe update, reload each consenting client at most once per release. Prevent controller-change reload loops. An offline client keeps the complete previous release and can retry when online. |
| UPDATE-07 | Delete only obsolete application asset caches when no client still needs them. Never erase IndexedDB, local preferences, gun profiles, learned examples, histories or backups. Unrelated caches remain untouched. |
| UPDATE-08 | Private preview keeps its existing authenticated no-store policy and offline-cache retirement. Public update coordination must not enable private offline assets or add public Full access. |
| UPDATE-09 | Preserve routes, page appearance, native drafts and accessibility. Update behavior is infrastructure; no new banner or blocking confirmation is required by this task. |

## Verification before release

- Unit-test release identity, complete/failed installs, edition mismatch, exact URL cache keys, cache ownership, client acknowledgements, safe-state decisions and one-reload behavior.
- Browser-test two releases with distinct real assets: idle update, active drill deferral, edit/save deferral, two-tab disagreement, offline restart, retry and unchanged IndexedDB records.
- Verify both build editions, minification, payload budgets, screenshots and all original performance gates. A diagnostic script or mocked service-worker unit test alone does not demonstrate a browser upgrade.

Implementation owners: build metadata in `vite.config.js`; offline caching in `workers/sw.js`; a focused release-update coordinator wired by `src/main.js`. Reuse current capture/navigation/save ownership rather than creating a second source of busy state.
