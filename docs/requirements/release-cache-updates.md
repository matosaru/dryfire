# Release asset updates

Status: approved task; H2 implementation candidate prepared, browser upgrade acceptance pending. The owner requested automatic resource refresh after releases and subsequently authorized all remaining plan tasks. This does not authorize deletion of saved user data or a performance exception.

| ID | Requirement |
| --- | --- |
| UPDATE-01 | Every production build has a deterministic release identity derived from the source revision and actual application/public-asset content. Rebuilding identical input must not add a wall-clock timestamp. Changed public images must also change release identity. |
| UPDATE-02 | Keep Vite content-hashed JS/CSS URLs. Revalidate HTML, service-worker code and release metadata. Do not add timestamp queries to every request or clear all browser storage. |
| UPDATE-03 | Install a complete new offline asset set into its own release cache. A failed or inconsistent install leaves the previous working release usable. Validate metadata edition and release identity before activation. |
| UPDATE-04 | Never automatically reload an open tab. Active drills, microphone permission, saves, safety dialogs and configuration drafts continue uninterrupted. |
| UPDATE-05 | Use the normal waiting-worker lifecycle. Preserve older release caches while any window or waiting/installing worker may need them. Do not force activation or claim public clients. |
| UPDATE-06 | Online full-page loads revalidate HTML and stable asset URLs; content-hashed bundles remain immutable. New app launches adopt fresh resources without timestamp queries or controller-change reload loops. Offline clients retain the last complete release. |
| UPDATE-07 | Delete only obsolete application asset caches when no client still needs them. Never erase IndexedDB, local preferences, gun profiles, learned examples, histories or backups. Unrelated caches remain untouched. |
| UPDATE-08 | Private preview keeps its existing authenticated no-store policy and offline-cache retirement. Public update coordination must not enable private offline assets or add public Full access. |
| UPDATE-09 | Preserve routes, page appearance, native drafts and accessibility. Update behavior is infrastructure; no new banner or blocking confirmation is required by this task. |

## Verification before release

- Unit-test release identity, complete/failed installs, edition mismatch, exact URL cache keys, cache ownership, normal activation, open-client cache retention and no forced reload behavior.
- Browser-test two releases with distinct real assets: fresh-load adoption, open-session preservation, two-tab cache retention, offline restart, failed install recovery and unchanged IndexedDB records.
- Verify both build editions, minification, payload budgets, screenshots and all original performance gates. A diagnostic script or mocked service-worker unit test alone does not demonstrate a browser upgrade.

Implementation owners: build metadata in `vite.config.js`; offline caching in `workers/sw.js`; a minimal registration adapter wired by `src/main.js`. There is no second busy-state coordinator or automatic tab reload. Existing v87/v88 registrations may require closing old tabs once to adopt the new normal-lifecycle policy.
