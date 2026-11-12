# Web product and commercial roadmap

**Active phase (CHG-073):** monetization discovery and rollout planning on `feature/monetization-rollout-plan`. This is documentation/research only. Do not change `b` or `main`, charge users, upload customer libraries, or implement accounts, billing, cloud storage or paid gates until the feature plan is complete and the owner separately approves implementation. See the [staged monetization rollout](../business/monetization-rollout.md), [branching strategy](branching-strategy.md), and [implementation history](implementation-history.md).

CHG-026 / CHG-073 / CHG-074 · revision 2.2 · 2026-11-12. **Planning requested; feature allocation, price, provider, retention rules and commercial claims remain proposals.** Native iPhone/Android releases are deferred by the user's direct instruction. The web/PWA is the only current launch target.

**CHG-026 planning boundary:** commercial requirements, pricing and technical options are planning/research only; no billing, account, cloud or entitlement implementation begins until the user separately authorizes that work. Current code changes follow the active `b` → protected `main` release policy.

**Existing informational/SEO work:** the in-app About and Contact screens, public SEO pages, flat operational URLs, metadata, sitemap/robots and favicon were implemented and released under CHG-027/029/060. The `.app` → `.com` redirect was configured by the owner; live search indexing and current Cloudflare responses remain external verification. These completed items do not implement accounts, billing, cloud recovery or commercial entitlements.

CHG-074 identifies account/cloud backup, up to five guns, graphical drill history, drill-option research and deterministic drill-analysis suggestions as the initial feature scope. Provider, implementation, price, checkout and paid gates remain deferred/unapproved; see [implementation needs](../business/initial-monetization-scope.md).

This roadmap links to [functional scope](../requirements/web-commercial.md), [commercial analysis](../business/monetization.md), [first-party competitor evidence](../business/competitor-analysis.md), [staged rollout and launch gates](../business/monetization-rollout.md), [cloud architecture](../architecture/cloud-services-proposal.md), and [security/performance review](../development/security-performance-review.md). The [CHG-074 feature needs](../business/initial-monetization-scope.md) define the current research scope; the rollout plan is authoritative for sequencing. Price/payment remain deferred.

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
| 1 | Complete competitor/pricing research and customer validation | First-party price/policy and cloud-cost sources are recorded; customer validation, target-market prices, provider approval and a measured total-cost model remain open. Owner defers price/billing decisions to a later plan. | Before checkout planning, define supported countries and complete real user, contract and cost validation. |
| 2 | Specify initial account/cloud and training features | CHG-074 candidate scope and technical prerequisites are documented; Firebase Auth/Google is a candidate only. No provider, storage region, retention or data-linking behavior is selected. | Approve requirements/data map, provider/region, security rules, privacy and legacy-data decisions before implementation. |
| 3 | Google account and cloud backup/restore | Not implemented. Firebase is the integrated Google-first candidate; Cloud Storage requires Blaze billing. Continuous synchronization is a later distinct feature. | Validate linking, isolation, 5-gun backup, restore after browser-data loss, export/deletion, old schema compatibility and failed-upload rollback in staging/iPhone Safari. |
| 4 | Graphical history, additional drill research and suggestions | Graphs/suggestions and new modes remain unimplemented; CHG-074 specifies requirements to prepare. | Validate chart math/accessibility, research a measurable drill shortlist, and test every deterministic suggestion rule and insufficient-data state. |
| 5 | Private feature pilot | Not started | Rehearse account recovery, cloud deletion, backup costs and manual iPhone Safari/Home Screen behavior; price/payments are excluded until the later plan. |
| 6 | Later synchronization, drill sharing, optional sound categories, camera/sensor analysis | Deferred candidates, not launch promises | Separate demand, privacy, accuracy, device, cost and design approval for each; retain one Pro plan |
| — | Native iOS/Android packaging, store billing and submission | **Deferred by direct instruction** | Resume only after a later request; no native release work in this roadmap |

Research in stages 0–2 can overlap. Account and storage implementation follows the approved commercial contract; backup and explicit restore precede automatic conflict-aware synchronization. Payment integration follows tested recovery, provider acceptance and legal review. Do not add all later Pro candidates before launch.

The [early preview strategy](../development/free-preview-testing.md) allows all features in a private preview while public production exposes a reviewed Free subset, without payment integration initially. Later production Pro tests use staff login/backend entitlement, not a URL/localStorage switch. Preview is internal access, not another public plan.

## Decisions to resolve once, before implementation

| Decision | Working recommendation | What remains to establish |
| --- | --- | --- |
| Price/payment | **Deferred to a later plan**; no price, provider, checkout or subscription is selected | Keep research notes only; do not implement billing or show a price/paywall under CHG-074 |
| Free functionality | Trigger learning, built-in practice, start signal/timing, local history/text summaries and manual export/import | Exact limits/graph allocation and transition policy; preserve existing data use and useful basic practice |
| Initial requested candidate scope | Cloud account/backup, five-gun library, graphical drill history, further drill research, transparent analysis/suggestions | Documented in CHG-074; implementation, account/storage vendor and data policy require separate approval; paid allocation remains later work |
| Authentication | Evaluate Firebase Auth with Google provider as the simplest integrated Google-first candidate; Google sign-in is optional | Mobile redirect flow, account linking/recovery, OAuth configuration, identity/data isolation and terms |
| Cloud | Evaluate Firestore metadata plus private Cloud Storage snapshots with Firebase Auth; compare Cloudflare D1/R2 and Supabase before selection | Firebase Storage requires Blaze billing; choose immutable Firestore location, data region, quotas/retention, deletion and full cost |
| Public domains | Candidate: `easydryfire.com` marketing/help and `easydryfire.app` PWA | Bindings and reviewed routing/migration; registration does not establish deployment, and separate origins do not share IndexedDB |
| Billing | Request written category review from Paddle, Stripe and Lemon Squeezy before comparing direct processor vs. MoR costs; Paddle public pricing is 5% + US$0.50/transaction | Written product-category acceptance, business country/countries, contracted fees, tax/invoice allocation, payout, recurring-payment/refund terms; no provider currently approved |
| Verification | Separate Free/Pro/expired users in staging; isolated staff Free/Pro identities on production | Server-controlled grants, audit/expiry, separate secrets/storage, no production client-side plan toggle |

The user confirmed **Lithuania** as the business registration country and **Europe** as the initial market. Use EUR for research and define the exact supported-country list before launch because Europe includes non-EU jurisdictions. `easydryfire@gmail.com` remains the support contact. CHG-073 authorizes this plan/research feature branch only; no code rollout, billing, new paid restrictions or data upload is authorized.

## Evidence and maintenance

Initial security review baseline was commit `d1754d81a891435ef4e42de976f185ec8b3f26bf`; it found two root development dependency advisories, which remain subject to the separate review plan. Competitor page findings and access limitations are dated in [competitor-analysis.md](../business/competitor-analysis.md); the localized Dry Fire Pro subscription price is documented as a benchmark, but complete target-market prices, product-specific provider acceptance and total operating costs remain unverified. The current `main` post-merge CI run is green, but its GitHub Cloudflare deployment job was skipped, so production deployment remains an external/owner verification task.

Update the stage status, exact source/CI/deployment evidence and decision log after each request. Add future implemented public routes/screens to the architecture registry only with actual implementation and reviewed designs. CHG-036 [branching strategy](branching-strategy.md): Free changes are delivered on `b` and promoted to `main` through a checked PR; Full preview builds are selected explicitly and are not assigned a Git branch. Cloudflare setup is owner-managed.
