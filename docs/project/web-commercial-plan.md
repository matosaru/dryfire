# Web product and commercial roadmap

**Active phase — owner clarification 2026-10-24:** finish and validate the Free product on b; the owner merges tested changes to main. Dev is outside the active workflow. After Free completion, reopen monetization analysis for principles, desired features, structure, business/legal requirements and technical solutions. Earlier proposals below remain research inputs to revisit; no paid/cloud/billing implementation starts now. See [active branching strategy](branching-strategy.md) and [follow-up plan](react-refactor/follow-up-plan.md#after-the-free-product-is-finished).

CHG-026 · revision 1.0 · 2026-10-11. **Planning and analysis requested; commercial feature allocation, price, providers and new data policies are proposals.** Native iPhone/Android releases are deferred by the user's direct instruction. The web/PWA remains the active product.

**Historical CHG-026 execution constraint:** the user explicitly requests **“prepare plans, and commit plans to a feature branch”** and **“do not yet start any implementations”**. This iteration is documentation/research only; no app, billing, auth, cloud, feature gate or deployment implementation starts. Earlier automatic-work instructions do not override this pause. Future stages below remain a plan until a later implementation instruction.

**CHG-027/029 narrow implementation exception:** the user subsequently starts [About](../requirements/about.md) with email support, then requests a separate [Contact screen](../requirements/contact.md) and centered shared-footer links. Proposed copy and the separate feature branch remain; one-time automatic checked dev/main promotion was authorized but is access-blocked as recorded in the delivery tracker. This starts only the informational app screens/email link. Remaining stages, pricing, entitlements, accounts/cloud and public SEO rollout stay paused/planned.

This is the current forward plan; [implementation history](implementation-history.md) preserves delivered work. [Functional scope](../requirements/web-commercial.md), [commercial analysis](../business/monetization.md), [competitor research](../business/competitor-analysis.md), [cloud architecture](../architecture/cloud-services-proposal.md) and [security/performance review](../development/security-performance-review.md) each own their detailed decisions.

## Product constraints

**CHG-032/035 specific implementation exceptions:** the user now explicitly approves temporarily hiding future paid-feature actions publicly while keeping their code/full development edition. Implement [the edition requirements](../requirements/build-editions.md); this starts the earlier stage 1a only. Existing data/legacy editing remain available, no billing or commercial entitlement is introduced, and hosted full preview requires verified access protection. CHG-035 additionally authorizes private Free/Full simulation and an Access-signed-token asset gate at the requested host; product accounts/billing/cloud remain paused. Live protection and deployment require separate evidence.

- Useful basic dry-fire practice stays free and easy to start, without a required account or payment details.
- There is only **one paid plan, Pro**. No separate gun, analytics, cloud or camera plans; no native-store billing in this iteration.
- Keep the primary flow simple: add one gun, train Trigger, start practice. Optional handling sounds and advanced controls remain optional.
- Compare affordability and actual recurring costs before choosing a price. Cloud recovery makes a low-cost recurring plan a stronger starting hypothesis than a lifetime promise.
- CHG-032/034 now temporarily hide new custom creation/advanced graphs and cap new public guns at two; existing saved data remains available. Full preview retains five guns/custom creation/graphs. No real paid subscription allocation or billing is implemented.
- Specifications, designs, site architecture and tests change together when implementation changes a screen or route. Proposed routes never appear in the current generated site tree or production sitemap.

## Optimized order and completion gates

| Stage | Work and outcome | Current status | Gate before progressing |
| --- | --- | --- | --- |
| 0 | Verify release foundations: main/dev protection, staging/production separation, successful deployments and physical iPhone microphone/beep/restore checks | CI is implemented; account settings/deployment/device verification remain unestablished | Record actual settings, deployment SHA and device outcomes; do not confuse a green build with a deployed or device-tested app |
| 1 | Security and performance review, then focused fixes: dependencies, headers, cache boundaries, backup recovery and large histories | Initial read-only source review and dependency audits complete; fixes and device benchmarks not implemented | Triage both root advisories; run the existing baseline before code fixes, regression/visual checks afterward; preserve timing and all saved data |
| 1a | Early public-Free/private-full-preview separation, before billing | CHG-032 specifically authorized; profiles/guards retained-code implementation complete locally, screenshot/CI review pending; hosted Access protection unverified | Define/review allocation and data transition; test both editions, artifact selection and protection of every preview hostname |
| 2 | Contact and SEO/public pages: email support in app/public navigation, useful landing page, explanation/help, canonical/social/structured metadata, sitemap and robots configuration | CHG-027/029 implement separate About/Contact app screens and centered footer links on their feature branch; promotion/deployment is tracked separately. Address confirmed: `easydryfire@gmail.com`; public Contact/routes/metadata remain unimplemented | Review the separate informational app screens, then separately authorize public routes; verify mailto/copy fallback and privacy-safe content, keep staging noindex and preserve existing-origin data |
| 3 | Complete competitor research and choose one Free/Pro offer, billing provider, jurisdiction/markets, storage/auth provider and migration rules | Candidate matrix, cost model and decisions prepared; live competitor prices blocked by environment networking | Verify first-party prices and provider product acceptance; define legal/tax/support obligations and approve the concrete commercial specification before paywalls or collection |
| 4 | Accounts and cloud recovery: sign-in, preferences and versioned backups, explicit restore and ownership protection | Architecture/acceptance proposal prepared; no backend/account/cloud feature implemented | Tenant isolation, safe account switching, actual deletion/export/restore, browser-data-loss recovery and dev test accounts pass before any paid claim |
| 5 | Server entitlements, hosted checkout, subscription management and the approved paid-feature rules | Technical plan prepared; billing and permanent subscription enforcement unimplemented; CHG-034 separately permits two public guns | Signed/idempotent billing events, free/paid/expired/refunded/offline tests; staff Free/Pro production accounts; no browser override or test secret in production |
| 6 | Controlled web release: stage first, then reviewed production release, clear Free/Pro page, operational monitoring and support | Not started | Verify published price/features, restore/cancel/refund behavior, backup reliability, cost alerts and a production rollback; user owns release promotion |
| 7 | Incremental cross-device sync, optional shared drills, extra sound categories and camera/sensor analysis | Candidates for later Pro value; unimplemented | Prioritize observed demand/cost; document and approve each behavior/privacy/design change; keep one paid plan |
| — | Native iOS/Android packaging, store billing and submission | **Deferred by direct user instruction** | Resume only after a later request; retain the existing guide and dependencies without doing native release work |

Stages 1–3 can overlap where independent: public SEO copy and pricing research need not wait for backend code. Stage 4 starts with backup/restore, which delivers recovery sooner; automatic conflict-aware synchronization follows after recovery is proven. Build the minimal entitlement mechanism needed to test the proposed gates during stages 4–5, rather than adding every advanced feature before launch.

The [early preview strategy](../development/free-preview-testing.md) allows all features on private dev while public main exposes a reviewed Free subset, without payment integration initially. Later production Pro tests use staff login/backend entitlement, not a URL/localStorage switch. Preview is internal access, not another public plan.

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
| Verification | Separate Free/Pro/expired users on dev; isolated staff Free/Pro identities on production | Server-controlled grants, audit/expiry, separate secrets/storage, no production client-side plan toggle |

The user confirmed **Lithuania** as the business registration country and **Europe** as the initial market. Use EUR as the pricing hypothesis and review EU obligations; define the exact supported-country list before launch because Europe also includes non-EU markets such as the UK and Switzerland. The later request adds an app Contact page with email support and confirms **easydryfire@gmail.com** as the public destination. This request authorizes preparation and analysis, not live charges, uploaded customer data or an unreviewed price/feature restriction. Reuse the user's existing automatic-work authorization for approved scope; do not request confirmation for every implementation step.

## Evidence and maintenance

Initial review baseline is dev `d1754d81a891435ef4e42de976f185ec8b3f26bf`. Production-only npm audit reports zero known advisories; full audit reports 22 moderate affected package entries tracing to two root advisories in development dependencies. These observations do not establish a complete security assessment. All five competitor website requests returned HTTP 403 at the environment gateway; prices and feature inventories remain unverified. First-party Cloudflare R2/D1 documentation was readable through its official GitHub source.

Update the stage status, exact source/CI/deployment evidence and decision log after each request. Add future implemented public routes/screens to the architecture registry only with actual implementation and reviewed designs. CHG-036 [branching strategy](branching-strategy.md): Free changes b → main PR, synchronized b → dev; Full-only changes stay on dev. Cloudflare setup is owner-managed.
