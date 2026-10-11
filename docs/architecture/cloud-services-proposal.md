# Cloud recovery and account architecture proposal

CHG-026 · revision 1.0 · 2026-10-11 · **Proposed, not implemented or provider-selected.** Lithuania-based business, initial European market. [Current local persistence](../requirements/persistence.md) remains unchanged: IndexedDB schema 3, backup format 4, no accounts or uploaded raw audio.

## Recommendation and alternatives

Retain offline-first local practice. Start with managed authentication plus automatic versioned backup and explicit restoration, then add conflict-aware cross-device synchronization. Cloud preferences alone cannot restore learned sounds, gun profiles, presets and sessions after browser storage is cleared.

| Option | Components | Advantage | Cost/risk to evaluate |
| --- | --- | --- | --- |
| Cloudflare extension — working recommendation | Worker API; D1 account mapping/preferences/backup metadata/billing entitlements; private R2 snapshots; a managed consumer identity provider | Reuses hosting; small structured metadata separated from backup objects; vendor storage documentation/pricing available | Consumer auth is additional; compare auth pricing, region/data-transfer controls, access enforcement and maintenance |
| Supabase | Managed Auth, Postgres with row-level security, private Storage; Cloudflare frontend/API where needed | Integrated auth/database/storage; relational authorization options | Verify production fixed cost, backup/PITR tier, region, quotas and operations; a free quota is not a business continuity guarantee |
| Firebase | Auth, Firestore and Cloud Storage | Integrated consumer identity and synchronization tooling | Compare read/write/storage/egress billing, security rules, region and vendor coupling |

Do not maintain both D1 and Postgres as duplicate authoritative account databases without a reason. Cloudflare Access may protect staff administration, but is not assumed to be the public consumer account system. Managed-auth vendor selection remains open; do not build password recovery or store passwords locally merely to avoid a provider fee.

First-party [R2 source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/r2/pricing.mdx), checked 2026-10-11, lists Standard storage at $0.015/GB-month, Class A $4.50/million and Class B $0.36/million operations, a 10 GB-month/1 million A/10 million B monthly free tier, and no R2 Internet-egress charge. Request rounding and free-tier eligibility apply. [D1 source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/d1/platform/pricing.mdx) confirms row-read/write and storage billing; its numeric table is an imported component and was not verified in this review. These are storage observations, not a full-stack quote: include Workers, auth, email, logging, operator backups, support, tax and overages. Free tiers are shared account allowances, not per-customer guarantees.

## Data and recovery contract

| Data | Proposed handling |
| --- | --- |
| Appearance/vibration and audio preferences | Back up values, but re-evaluate capabilities on each browser; a saved setting cannot add Safari vibration support |
| Gun names/types, derived calibration/features, custom presets and configuration | Include compatible, versioned user-owned data after explicit cloud enablement; no firearm serial number needed |
| Session/history records | Include owned results for restoration; immutable IDs/snapshots support a later merge protocol |
| Raw audio/video, payment card data and identity-provider credentials | Exclude from practice backups; no raw-audio/video upload authorized; card data stays with checkout provider |
| Paid ownership | Authoritative backend entitlement; never inferred from a backup field, local plan flag or email address |

All buckets are private. Use verified immutable identity IDs, not caller-supplied email/userId, to resolve ownership. Authenticate every API request; verify token issuer/audience/signature/expiry and server-side account mapping. Apply per-account object keys/row access, quotas, bounded body/decompression/depth, rate limits and schema validation. CORS is not authorization. Use secure HttpOnly/SameSite cookies and CSRF protection if the chosen session design uses cookies; otherwise document token lifetime/storage/XSS trade-offs. Keep server keys and payment/webhook secrets out of the client.

A snapshot upload is marked complete only after object upload, checksum validation and metadata commit. Persist version, timestamp, schema, library revision and acknowledged completion; retain the previous successful snapshot on failure. Retry idempotently and reconcile orphan objects. Debounce/queue changes and upload outside active audio work. Show **Saved on this device**, **Cloud backup pending** or a real **Last backed up** time rather than claiming success before acknowledgment.

Restoration requires sign-in and a real downloadable snapshot after local storage deletion. Validate the whole payload, show source/date/contents and ask whether to replace or keep current local data; atomically restore without silently overwriting a newer local library. Keep compatible manual export/import available. Re-calibration may be needed on a different microphone even when feature vectors restore correctly.

Do not automatically attach an anonymous library to an account or upload account A's data after switching to B. Define a library/account namespace migration that preserves anonymous data and requires explicit linking. Logout cancels uploads and clears tokens/private response caches; handling local private data needs a visible retain/remove choice. A second account must not inherit another account's Pro entitlement, queued uploads, cloud rows or selected backup.

For later sync, use stable IDs, revision preconditions and conflict copies; test concurrent edits, offline queues, deletion/reset tombstones and changed preset snapshots. No silent last-write-wins replacement of an active library. Upload scheduling is foreground/PWA capability based; Safari background execution is not guaranteed.

## Proposed quotas, retention and lifecycle

Measure real backup size and change frequency first. A candidate budget is the current 10 MB uncompressed restore envelope, seven versioned snapshots and 30 days of backup retention; these are **unapproved cloud-policy hypotheses**, not new app limits. Resolve the existing large-library export/import mismatch before imposing a cloud envelope or claiming complete recovery. Define retention after cancellation separately, communicate recovery/export grace and issue deletion notice before expiry. Never delete local profiles/results on payment lapse.

Account deletion stops subscriptions/queued uploads, revokes sessions, removes user-owned cloud rows/objects and explains provider/operator backup expiry. Statutorily required billing records use separate disclosed minimum retention; they do not justify retaining practice data indefinitely. Operators need tested service backup/restore, deletion propagation, incident response and key rotation. Cloud copies do not protect against untested operator-wide corruption or mistaken deletion.

Choose a supported European data-location strategy where available and verify actual residency/transfer contracts; jurisdiction alone does not guarantee EU-only processing. Obtain DPAs/subprocessor information and define controller/processor responsibilities and access logging. No end-to-end encryption promise is made: select controlled provider/application encryption and test key recovery before marketing it.

## Separate environments and required tests

Use separate dev/production databases, buckets, auth clients, callback URLs and billing/webhook secrets. Never copy real firearm/profile data into fixtures. Public staging is noindex and staff-only where appropriate; fake paid grants cannot enter production builds.

Acceptance: A cannot enumerate/read/write B; revoked/expired tokens are denied; duplicate/reordered uploads are safe; a failed snapshot preserves the last good one; browser-data deletion followed by sign-in restores the correct complete library; account switching/concurrency never mixes owners; cancelled Pro preserves local records and disclosed restore access; deletion propagates. These tests are unrun until services exist. See [billing/QA requirements](../business/monetization.md).
