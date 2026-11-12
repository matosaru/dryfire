# Web product and commercial roadmap

**Active phase (CHG-073):** monetization discovery and rollout planning on `feature/monetization-rollout-plan`. This is documentation/research only. Do not change `b` or `main`, charge users, upload customer libraries, or implement accounts, billing, cloud storage or paid gates until the feature plan is complete and the owner separately approves implementation. See the [staged monetization rollout](../business/monetization-rollout.md), [branching strategy](branching-strategy.md), and [implementation history](implementation-history.md).

CHG-026 / CHG-073 · revision 2.0 · 2026-11-12. **Planning requested; feature allocation, price, provider, retention rules and commercial claims remain proposals.** Native iPhone/Android releases are deferred by the user's direct instruction. The web/PWA is the only current launch target.

**CHG-026 planning boundary:** commercial requirements, pricing and technical options are planning/research only; no billing, account, cloud or entitlement implementation begins until the user separately authorizes that work. Current code changes follow the active `b` → protected `main` release policy.

**Existing informational/SEO work:** the in-app About and Contact screens, public SEO pages, flat operational URLs, metadata, sitemap/robots and favicon were implemented and released under CHG-027/029/060. The `.app` → `.com` redirect was configured by the owner; live search indexing and current Cloudflare responses remain external verification. These completed items do not implement accounts, billing, cloud recovery or commercial entitlements.

This roadmap links to [functional scope](../requirements/web-commercial.md), [commercial analysis](../business/monetization.md), [first-party competitor evidence](../business/competitor-analysis.md), [staged rollout and launch gates](../business/monetization-rollout.md), [cloud architecture](../architecture/cloud-services-proposal.md), and [security/performance review](../development/security-performance-review.md). The rollout plan is authoritative for sequencing from CHG-073 onward.

## Product constraints

**CHG-032/035 specific implementation exceptions:** the user now explicitly approves temporarily hiding future paid-feature actions publicly while keeping their code/full development edition. Implement [the edition requirements](../requirements/build-editions.md); this starts the earlier stage 1a only. Existing data/legacy editing remain available, no billing or commercial entitlement is introduced, and hosted full preview requires verified access protection. CHG-035 additionally authorizes private Free/Full simulation and an Access-signed-token asset gate at the requested host; product accounts/billing/cloud remain paused. Live protection and deployment require separate evidence.

- Useful basic dry-fire practice stays free and easy to start, without a required account or payment details.
- There is only **one paid plan, Pro**. No separate gun, analytics, cloud or camera plans; no native-store billing in this iteration.
- Keep the primary flow simple: add one gun, train Trigger, start practice. Optional handling sounds and advanced controls remain optional.
- Compare affordability and actual recurring costs before choosing a price. Cloud recovery makes a low-cost recurring plan a stronger starting hypothesis than a lifetime promise.
- CHG-032/034 now temporarily hide new custom creation/advanced graphs and cap new public guns at two; existing saved data remains available. Full preview retains five guns/custom creation/graphs. No real paid subscription allocation or billing is implemented.
- Specifications, designs, site architecture and tests change together when implementation changes a screen or route. Proposed routes never appear in the current generated site tree or production sitemap.

## Current stage status and completion gates

| Stage | Work and outcome | Current status | Gate before progressing |
| --- | --- | --- | --- |
| 0 | Validate Free product readiness, recovery/export, deployment identity and target iPhone behavior | CI on the current `main` revision is green; the GitHub Cloudflare deploy workflow was skipped; live deployment and physical iPhone microphone/beep checks remain unverified | Record the actual deployed SHA and owner-device results; never treat CI as deployment/device evidence |
| 1 | Complete competitor/pricing research and customer validation | First-party website snapshot updated 2026-11-12; direct competitor app prices, target-market store terms, willingness-to-pay and actual cost model remain open | Record dated EU price/terms sources; choose one cadence and price from verified costs and user evidence |
| 2 | Approve Free/Pro scope, existing-user transition, countries, consumer/legal/privacy terms and provider | Proposal prepared in [monetization-rollout.md](../business/monetization-rollout.md); no feature allocation, price or provider approved | Approve versioned requirements/design/copy and written provider eligibility before implementation |
| 3 | Optional accounts, backup/recovery, export/deletion and later synchronization | Architecture options exist; account/cloud services are not implemented | Validate anonymous-to-account linking, tenant isolation, restore after browser data loss, old-library compatibility and failure rollback in staging |
| 4 | Server entitlements, one hosted Pro offer and lifecycle management | Not implemented; current Free/Full build editions are test/public artifact profiles, not user entitlements | Prove signature/idempotency, ownership, renewal/cancel/refund/expiry/offline and isolated staff test accounts; no client-side grants |
| 5 | Controlled web pilot and launch | Not started | Rehearse support, cost alerts, recovery metrics, refund/cancel flows and rollback; expand only after pilot thresholds pass |
| 6 | Later synchronization, drill sharing, optional sound categories, camera/sensor analysis | Deferred candidates, not launch promises | Separate demand, privacy, accuracy, device, cost and design approval for each; retain one Pro plan |
| — | Native iOS/Android packaging, store billing and submission | **Deferred by direct instruction** | Resume only after a later request; no native release work in this roadmap |

Research in stages 0–2 can overlap. Account and storage implementation follows the approved commercial contract; backup and explicit restore precede automatic conflict-aware synchronization. Payment integration follows tested recovery, provider acceptance and legal review. Do not add all later Pro candidates before launch.

The [early preview strategy](../development/free-preview-testing.md) allows all features in a private preview while public production exposes a reviewed Free subset, without payment integration initially. Later production Pro tests use staff login/backend entitlement, not a URL/localStorage switch. Preview is internal access, not another public plan.

## Decisions to resolve once, before implementation

| Decision | Working recommendation | What remains to establish |
| --- | --- | --- |
| Offer | Anonymous Free plus one account-linked Pro subscription; candidate **€24/year**, one billing cadence | Market comparison, willingness to pay, currency/tax display and net cost; no price approved or published |
| Free functionality | Trigger learning, built-in practice, start signal/timing, local history/text summaries and manual export/import | Exact limits/graph allocation and transition policy; preserve existing data use and useful basic practice |
| Pro launch value | Cloud backup/recovery, up to the existing five-gun capacity, custom creation and advanced analysis | Exact capability matrix, existing-user treatment, lapse/offline behavior and concrete designs |
| Authentication | Managed identity provider; login is available for buying/restoring Pro, not a paid feature by itself | Business eligibility, recovery, account-switch isolation and provider cost/data location |
| Cloud | Cloudflare API with D1 metadata/entitlements and private R2 versioned backups; compare with Supabase/Firebase | Managed-auth choice, data region, quotas/retention, deletion guarantees and total cost |
| Public domains | Candidate: `easydryfire.com` marketing/help and `easydryfire.app` PWA | Bindings and reviewed routing/migration; registration does not establish deployment, and separate origins do not share IndexedDB |
| Billing | Hosted checkout; compare direct processor with merchant of record | Written product-category acceptance, business country/target markets, fees, VAT/sales tax, recurring-payment/refund terms |
| Verification | Separate Free/Pro/expired users in staging; isolated staff Free/Pro identities on production | Server-controlled grants, audit/expiry, separate secrets/storage, no production client-side plan toggle |

The user confirmed **Lithuania** as the business registration country and **Europe** as the initial market. Use EUR for research and define the exact supported-country list before launch because Europe includes non-EU jurisdictions. `easydryfire@gmail.com` remains the support contact. CHG-073 authorizes this plan/research feature branch only; no code rollout, billing, new paid restrictions or data upload is authorized.

## Evidence and maintenance

Initial security review baseline was commit `d1754d81a891435ef4e42de976f185ec8b3f26bf`; it found two root development dependency advisories, which remain subject to the separate review plan. Competitor page findings and access limitations are dated in [competitor-analysis.md](../business/competitor-analysis.md); exact subscription pricing and payment provider acceptance remain unverified. The current `main` post-merge CI run is green, but its GitHub Cloudflare deployment job was skipped, so production deployment remains an external/owner verification task.

Update the stage status, exact source/CI/deployment evidence and decision log after each request. Add future implemented public routes/screens to the architecture registry only with actual implementation and reviewed designs. CHG-036 [branching strategy](branching-strategy.md): Free changes are delivered on `b` and promoted to `main` through a checked PR; Full preview builds are selected explicitly and are not assigned a Git branch. Cloudflare setup is owner-managed.
