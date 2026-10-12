# Public and full development editions

Revision 1.1 · CHG-032 / CHG-034 · 2026-10-12. Implementation is authorized by the user's request to temporarily remove future paid options while retaining their code, followed by the explicit answer **“Temporarily hide future paid features publicly (Recommended)”**. CHG-034 changes the public creation limit to two with **“btw, for free version allow max 2 guns”**. No billing, account, price or permanent paid allocation is implemented by this change.

| ID | Requirement |
| --- | --- |
| EDITION-01 | Default production builds expose basic practice for free. Full preview is an explicit build edition, with no URL, localStorage, email or browser-console plan switch. Record the edition in the build artifact. Unknown edition values fail the build. |
| EDITION-02 | Public users can create their first and second guns. Hide Add at two or more saved guns and reject creating a third, including concurrent or direct form attempts. Preview retains the existing five-gun creation capacity. Enforce the selected creation limit in the save transaction as well as the visible controls. Deleting down to one permits a second again; editing does not consume capacity. |
| EDITION-03 | Preserve every existing gun, sound, preference, custom preset and saved result. Existing multi-gun libraries remain selectable, editable, deletable, usable and exportable. Restore valid compatible backups without treating a backup as payment proof. No storage migration or record deletion is introduced. |
| EDITION-04 | Public users cannot create new custom drills; hide creation controls and guard direct form submission. Preserve running and editing an existing saved preset. Full preview retains creation and editing. Built-in drills and all six basic practice modes remain available. |
| EDITION-05 | Hide advanced progress graphs and their range/group controls in public. Keep saved sessions, per-session text timing summaries, recognition history and backup recovery available. Full preview retains the current charts/table. |
| EDITION-06 | Keep optional editor/chart code in a clearly documented feature package within the source tree. Charts are omitted from the public bundle; the editor remains available for legacy preset editing. Document the temporarily disabled actions, retained data and commands for both editions. |
| EDITION-07 | Verify both editions with synthetic old/new libraries, direct creation attempts, valid backup restore, navigation, saved data and appropriate screenshots. Normal public deployment accepts only a verified public artifact. Offline app-shell caching includes every bundled asset, including full-preview lazy charts, and refresh preserves the restored library. Full preview can run locally; a hosted preview must be protected on every reachable URL before deployment. |

## Transition and boundaries

This is temporary public product availability, not payment enforcement or DRM. The repository is public and the app runs locally; no client-only rule can establish paid ownership. Existing preset editing is retained to avoid freezing saved workflows, but it cannot create a new preset. Browser storage formats stay at IndexedDB schema 3 / backup format 4. Existing valid backups remain restorable, including multi-gun libraries.

`npm run build` is public. `npm run build:preview` produces the full edition for local or protected testing. The development server defaults to loopback. Ordinary dev/main deployment remains public unless a separately verified hosted-preview deployment is configured. No production trial grants, payment provider or login is invented.

Cloudflare Access (or equivalent server authentication) must deny unauthenticated requests to the preview custom hostname, Workers URL and aliases. Configuration files do not prove live protection. Account/billing/cloud/SEO implementations remain paused except for this specific edition slice and the already authorized About/Contact screens.

Design ownership: [My Guns](../design/screens/guns/README.md), [Drills](../design/screens/drills/README.md), [History](../design/screens/history/README.md) and [About](../design/screens/about/README.md). [Implementation guide](../development/free-preview-testing.md) and [delivery tracker](../project/implementation-history.md) distinguish local verification, publication and external protection/deployment.
