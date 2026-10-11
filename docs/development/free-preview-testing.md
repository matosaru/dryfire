# Public Free and private full preview

CHG-026 · revision 1.0 · 2026-10-11 · **Proposed, not implemented.** Addresses the user's request to stop offering every feature publicly while retaining a way to test them. Preview is an internal release/access state, not a third customer plan; customers still see Free plus one future Pro. The later explicit instruction is plans only: do not begin application implementation.

## Immediate pre-billing approach

| Environment | Build / access | Intended use |
| --- | --- | --- |
| Public production, `main` / `dryfire` | Explicit public-Free capability profile | Anonymous basic practice and recovery of existing owned local data; no public new paid-feature actions |
| Development, `dev` / `dryfire-dev` | Full staff-preview capability profile, protected by Cloudflare Access | Owner tests all current features before payment/backend service exists |
| Local/CI | Both profiles against synthetic fixtures | Reproducible Free locks plus full-feature regression; no customer identity/data |

Access must protect the **actual reachable preview Worker URL** and every alias/custom domain, not just a friendly staging hostname while workers.dev stays public. Verify unauthenticated requests cannot obtain preview through another route; disable unprotected aliases if needed. Use a server-side identity allowlist, not a hidden URL, robots/noindex or browser email comparison. The public support address is not automatic evidence of an authorized staff login. Owner Access configuration is external; a file cannot prove it is active.

The public capability proposal is one newly created gun, no new custom-preset creation and basic history/timing text, with graphs/deeper analytics in preview/future Pro. Keep built-in practice, calibration, safety, Contact and manual backup. This **specific allocation remains a proposal**, matching the user's candidates; publishing plans does not authorize applying it.

## Existing data transition

- Never delete, hide from recovery or overwrite existing guns, calibration, presets/results when selecting Free.
- Existing multi-gun libraries and custom drills remain viewable/usable/exportable; restrict disclosed future creation rather than charging to recover data. Decide editing and imported-library rules before code.
- Graph visibility may change under a disclosed commercial rule, but results and useful text summaries/export stay accessible. Existing charts are currently free; no permanent Pro grant is silently created or removed by local migration.
- Backups are not payment proof. A client-only capacity switch can be circumvented; editions control published UX, not strong licensing/DRM. Hosted paid resources need later backend authorization.

## Build and test contract

Use one capability catalog for navigation/actions and clear lock states; no CSS-only hiding, scattered hard-coded conditions or public query/localStorage unlock. Build both profiles from the same tested commit. Artifacts must identify edition/source SHA; deployment chooses the correct tested artifact for its branch. The current single-artifact workflow needs a reviewed update; it is not implemented yet.

Test fresh Free, an existing five-gun/custom/graph library, backup restoration, locks/direct navigation and full-preview behavior. Add Free lock-state baselines alongside current full screens and update registry/requirements/designs when states exist. Prove production receives Free and no dev unlock/secret ships. Preserve schema 3/backup 4 and physical microphone timing.

## Production Pro testing after accounts exist

When a backend exists, move from separate pre-billing editions to account-scoped production entitlements as specified in [monetization QA](../business/monetization.md#freepro-testing-on-dev-and-production). Separate staff-owned Free and Pro users get audited server roles/grants. Comped access validates features; a controlled real purchase/refund still validates billing. Ordinary users cannot assign roles or grant themselves Pro.

Keep dev/production keys, databases and objects separate. Review logout/account-switch caching before auth. Continue [feature PR → dev → main](../project/branching-strategy.md); do not push a Free-profile change directly to production.
