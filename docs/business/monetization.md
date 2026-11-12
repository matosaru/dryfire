# Monetization analysis and proposal

CHG-032 current public availability is governed by [build editions](../requirements/build-editions.md): two-gun public creation under CHG-034, no new custom creation or advanced graphs publicly; full preview retains them. Existing data/preset editing/use/export/restore remain available. This overrides earlier all-free availability statements for these actions without implementing billing or deleting data. Publication/deployment are tracked separately.

CHG-026 / CHG-073 / CHG-074 · revision 2.2 · 2026-11-12 · **Planning only. CHG-074 identifies initial feature candidates; implementation, paywall allocation, price, payment provider and cloud/auth vendor remain unapproved.** Business location: Lithuania. Initial markets: Europe; define the exact supported country list before launch. Native apps/store billing are deferred. Follow the staged [monetization rollout plan](monetization-rollout.md).

## Review of the submitted product analysis

The analysis correctly recognizes user-trained sound profiles, microphone-based detection, local history and built-in/custom practice as existing product capabilities, and prioritizes device reliability and onboarding. It does not establish physical microphone accuracy, cross-device persistence or current paid conversion. Its €4.99/month and €49–€69 lifetime figures are suggestions, not verified prices. A first-party Dry Fire Pro site/App Store check confirms another product advertises ML trigger detection; its Lithuanian App Store listing showed €2.99 monthly and €22.99 yearly. This is a useful but narrow comparator, not willingness-to-pay evidence for EasyDryFire. Microphone timing alone should not be marketed as unique. See [competitor research](competitor-analysis.md).

The current public build contract also differs from the analysis's broader feature inventory: new gun creation is limited to two, new custom-drill creation is hidden, and advanced graphs are hidden; existing saved data and selected existing preset workflows remain accessible. Full preview retains expanded features. The submitted feature list must not be described as what every public user currently receives, nor automatically converted into a final paid allocation.

Recommended order: validate the Free/iPhone experience; complete source-backed competitor and cost research; approve the feature/legacy-data/legal decisions; then implement opt-in account recovery and reliable backups before billing; finally add one server-authorized Pro offer and stage a small pilot. Keep cross-device conflict-aware sync, sharing, additional sound categories and camera analysis for later evidence-based decisions. These are recommendations and remain subject to owner approval.

## Offer decisions deferred

The owner has deferred price, billing and the remaining commercial terms to a later plan. The prior **Free plus one annual Pro** and **€24/year** language is an earlier hypothesis only; it is not an active decision and must not appear in checkout or marketing. The current feature-planning scope is documented in [initial account, cloud and training features](initial-monetization-scope.md). Keep practice usable locally without account creation; offer sign-in only to provide the requested account-linked features. Do not implement purchase recovery, subscription status, paid gates or prices in this scope.

## Capability proposal and existing-user protection

| Capability | Recommended Free | Candidate Pro / later scope | Current implementation |
| --- | --- | --- | --- |
| Safety, Trigger learning, start signal/timing and built-in practice | Available; retain all current built-in modes to avoid mode-by-mode confusion | No safety/basic-recognition upsell | Implemented free |
| Gun library | Two saved guns for new creation, preserving existing larger libraries | Up to the existing five-gun capacity | CHG-034: public creation limited to two; existing libraries usable; full preview retains five; billing absent |
| Local storage, manual export/import and personal-data access | Available, including on cancellation | Automatic cloud backup/recovery and later sync | Local/manual backup implemented; cloud absent |
| Account/sign-in/purchase restore | Available when needed; anonymous practice remains possible | Account-linked Pro entitlement | Accounts/entitlements absent |
| Custom drills | Built-ins available; preserve existing owned presets and readable/exportable data | Candidate paid custom creation/editing and saved presets | CHG-032: creation in full preview; existing preset editing/running in both |
| Statistics | Useful timing/history text summaries | Candidate graphs, comparisons, filters and deeper analysis | CHG-032: text summaries in both; advanced graphs in full preview only; final paid allocation proposed |
| Email support/contact | Available to all, without sign-in | Same public contact | App and public Contact pages are implemented; `easydryfire@gmail.com` uses mailto/copy. A server-backed contact form remains optional. |
| Share drills | Not necessary to basic practice | Later candidate: share sanitized sequence definitions, not gun/audio/history data | Unimplemented |
| Extra gun-type sound categories | Existing types/Trigger remain usable | Later optional mechanical categories, after accuracy validation | Extra categories unimplemented |
| Camera/sensor analysis | No promise of movement/aim grading | Later candidate with separate privacy/device/design scope | Unimplemented |

CHG-074 now identifies cloud/account storage, five guns, graphical drill history, additional drill options to investigate, and drill analysis/suggestions as the initial feature candidates to prepare. This is not approval to implement, publish, gate or describe them as paid. Existing multi-gun/custom/graph functionality must not be relabeled as a new implemented Pro feature. Before gating, specify grandfathering versus new-action limits, imported-backup handling, existing gun/preset use/editing, offline entitlement grace and lapse/cancellation. Preserve profiles/results and access/export; never silently delete data or make an old backup prove payment. A permanent legacy entitlement needs an explicit reliable policy, not a forgeable browser flag.

Use one **Upgrade to Pro** entry and one short comparison. Trigger training and Start remain primary; account/billing/backup controls are secondary. Avoid repeated sales prompts or mandatory optional-sound training. Review new screen designs and update requirements/architecture/baselines before code.

For the immediate public-versus-owner access question, [the pre-billing strategy](../development/free-preview-testing.md) proposes public Free and a full preview protected by Cloudflare Access. Define allocation and preserve existing data use/export first; staff production access comes later via backend entitlements. Preview is not a third public plan. Commercial implementation remains paused until separately authorized; follow the current `b` → protected `main` release policy for any approved code changes.

## Pricing and business model

### Evidence and price hypothesis

The [competitor research](competitor-analysis.md) records Dry Fire Pro's Lithuanian App Store listing (€2.99/month, €22.99/year) as a dated native-store benchmark. It does not establish a web subscription price or EasyDryFire willingness-to-pay. Previous €24/year, €4.99/month and €49–€69 lifetime values remain archived research notes only, deferred and not approved.

When pricing work resumes, test a simple offer with target users and show the full recurring amount clearly. Do not display unapproved price/cadence in the current feature scope; a store listing comparison alone is insufficient.

### Cost model and payment-provider economics

Use this formula for each country and billing provider:

> Contribution per paid account = amount collected − customer-country taxes owed by EasyDryFire − provider/MoR fees − refunds/disputes − variable identity, storage, email and support costs.

Then subtract fixed hosting, monitoring, accounting, legal, insurance and business costs. If an approved Merchant of Record (MoR) contract is used, confirm which tax collection/remittance and invoicing duties the MoR assumes; those duties and fees are contract-specific. For a direct processor, budget for the trader's own tax registrations, returns, invoicing, refunds and dispute work.

Paddle's public [pricing page](https://www.paddle.com/pricing), checked 2026-11-12, states **5% + US$0.50 per checkout transaction**, no monthly/migration fees, and advertises checkout, subscriptions, buyer support, fraud/chargeback support and global tax/regulatory compliance. This is a useful scenario input, not a quote or confirmation Paddle accepts EasyDryFire. Currency conversion, VAT treatment in the fee base, refunds, payout timing and any product-specific terms must be confirmed in a written proposal. At a hypothetical €24 annual charge, the public percentage component is €1.20; the fixed US$0.50 must be converted at the actual settlement/accounting rate. This is before taxes, refunds, support and service costs, so no net contribution or break-even user count is asserted.

Cloudflare's public [R2 pricing](https://developers.cloudflare.com/r2/pricing/) states standard storage at US$0.015/GB-month, Class A operations at US$4.50/million, Class B at US$0.36/million, and no Internet egress charge; the page also shows monthly free allowances. Illustrative scale only: 10,000 accounts with three 100 KB snapshots each is about 3 GB (roughly US$0.045/month at the stated storage rate before free allowance), with 30,000 upload operations about US$0.135 at the stated Class A rate. This deliberately excludes metadata/database, request orchestration, backups/replication, logs, authentication, Workers plan, support, legal/accounting and provider charges. Actual app backup size, version retention, restore rate and all service costs have not been measured. No unlimited backup promise should be made before measuring real anonymized backup sizes and setting quotas/spend alerts.

Cloudflare's public [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) lists Workers Free limits of 5 million rows read/day, 100,000 rows written/day and 5 GB total storage; Workers Paid lists 25 billion rows read/month and the first 50 million rows written/month and 5 GB stored included, then usage rates. D1's included amounts do not establish zero total project cost: confirm the applicable Workers plan, existing usage, Auth, Worker requests, observability, retention and backups. The cost hypothesis is that small structured preferences/entitlement metadata and compressed user libraries can be inexpensive at modest scale, while payment fees, support and compliance are more likely early cost drivers. Validate this with measured workloads before selecting Cloudflare over Supabase/Firebase or another service.

## Billing choice and technical requirements

| Option | Benefit | Responsibility / decision gate |
| --- | --- | --- |
| Direct processor, e.g. hosted Stripe Checkout/Billing | Hosted card/SCA flows, subscriptions and customer portal | Verify Lithuanian business/product eligibility; merchant owns applicable VAT/OSS/sales-tax setup, invoices, refunds/disputes and consumer obligations; tax/accounting tools may be needed |
| Merchant of record, e.g. Paddle or Lemon Squeezy | May handle customer tax collection/remittance and more billing administration under its contract | Verify supplier/product eligibility, payout/refund/reserve terms, markets and exact fees; supplier still has accounting/privacy/support obligations |

A MoR remains a **complexity-reduction hypothesis** for small European web sales, conditional on written product acceptance and viable net contribution. Paddle is the first candidate to request a written review from because it publicly supports SaaS and sells MoR services, but its current AUP also prohibits products/services that engage in, encourage, promote or celebrate violence or physical harm. That rule could be relevant to a firearm-training product, and Paddle reserves judgment. Stripe describes legal firearms/weapons as limited availability requiring contact with its sales team (and prohibits some related products and unlawful-harm businesses); it does not establish eligibility for a software-only trainer. Lemon Squeezy lists weapons/ammunition as regulated products. None is approved or ruled out for EasyDryFire. Submit an accurate written product description and ask each candidate for explicit category approval, allowed marketing copy, countries, renewal/refund/payout terms and exact fees before implementation. Never conceal the product use case or treat a successful account signup as approval.

Use a trusted server entitlement and server-created checkout for a configured price. Never accept arbitrary price/customer/account IDs from the browser. Signed/idempotent webhooks are authoritative; a success redirect is not purchase proof. Check event environment, subscription/customer ownership, payment state, timestamps/replay; reconcile missed/reordered events. Handle SCA/payment failure, renewal/retry, cancellation at period end, expiry, refund, dispute/revocation and restore. Keep card data and secrets out of the app.

Billing ownership and training-data recovery are separate. Offline paid controls can be tampered with in a browser; use a documented signed/time-bounded cache for usability and enforce hosted resources server-side rather than promising impossible client DRM. Never destroy local data on lapse. [Cloud architecture](../architecture/cloud-services-proposal.md) owns recovery/isolation and proposed retention.

## Lithuania/Europe legal and operational work

Confirm the entity/trader, supported countries, payout/KYC and obligations with appropriate Lithuanian accounting/legal advice before charging. Europe includes non-EU jurisdictions; Lithuanian registration does not establish one pan-European setup.

- **VAT/invoicing:** classify the service; establish B2C/B2B treatment/customer-country evidence, registration/OSS eligibility, thresholds/exceptions, invoices and accounting retention. Business location does not imply a single VAT rate for all buyers. Document MoR versus supplier obligations.
- **Consumer terms:** disclose trader/contact, final price/cadence/taxes, renewal, shipped features, device limits, cancellation, refund/withdrawal and support. Provide self-service cancellation/restore. Digital service/content withdrawal exceptions have conditions; no assumed blanket no-refunds or silent waiver.
- **GDPR/privacy:** define lawful bases/purposes, informed cloud enablement, minimization, retention/deletion/export, DPAs/subprocessors and transfers. Treat gun-linked data carefully. Raw audio/video remains excluded; purchase analytics must not upload it. Review consent for nonessential marketing/analytics cookies separately.
- **Operations:** tenant isolation, incident response, tested service and user recovery, key rotation, abuse/spend limits and access audits. Choose sustainable support/refund ownership; a contact email alone is not an incident/recovery process.
- **Product/provider constraints:** check dry-fire software/marketing and target-country obligations; retain accurate safety/microphone limitations and avoid guaranteed accuracy/aim/legal-clearance claims. Payment acceptance does not establish IP/safety/consumer-law clearance.

### Provider, tax and consumer source check — 2026-11-12

- [Paddle acceptable-use / prohibited products](https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle) is now reachable (the older `/legal/acceptable-use-policy` URL was stale and returned 404). It allows Paddle to reject products/services that engage in, encourage, promote or celebrate violence or physical harm, and says Paddle reserves judgment. The page contains no explicit “firearm” or “weapon” category text in the reviewed version. This is ambiguous for EasyDryFire, so obtain written review; do not infer acceptance from absence of the word “firearm.” The linked [Paddle pricing page](https://www.paddle.com/pricing) publicly states 5% + US$0.50 per checkout transaction and no monthly or migration fees; the applicable contract controls.
- [Stripe restricted businesses](https://stripe.com/legal/restricted-businesses) lists legal firearms (including rifles, shotguns and pistols) and related regulated parts as **limited availability** and instructs businesses to contact Stripe sales. It also separately prohibits illegal weapons and businesses promoting unlawful violence/physical harm. This is not a blanket statement that all firearm-related software is prohibited, nor does the page grant EasyDryFire approval. Request written classification before selecting Stripe.
- [Lemon Squeezy prohibited products](https://docs.lemonsqueezy.com/help/getting-started/prohibited-products) identifies weapons/ammunition as regulated products. It does not determine how this software-only training app is classified. Get written acceptance before relying on it.
- [Paddle pricing](https://www.paddle.com/pricing), [Cloudflare D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) and [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/) were reachable and checked 2026-11-12. Their public rates/allowances are recorded above as scenario inputs; they are not a vendor quote or total system-cost estimate.
- The European Commission's [cross-border VAT](https://europa.eu/youreurope/business/finance-and-tax/vat/cross-border-vat/index_en.htm) and [VAT OSS](https://europa.eu/youreurope/business/finance-and-tax/vat/one-stop-shop/index_en.htm) pages describe customer-country VAT and the Union OSS mechanism for qualifying cross-border EU consumer sales of goods/services, with record and scheme-specific obligations. Whether this subscription is an electronically supplied service, which scheme/threshold/exceptions apply, and who files under an MoR contract need Lithuanian accountant review. Do not apply a single assumed VAT rate across Europe.
- The European Commission's [consumer contract and guarantees](https://europa.eu/youreurope/business/selling-in-eu/consumer-contracts-guarantees/index_en.htm) materials are a starting point for pre-contract disclosures and withdrawal/cancellation policy. Counsel should determine the correct rules for a continuing digital subscription, immediate service commencement, renewal reminders, cancellation, refunds and any withdrawal-right exceptions. Do not rely on an assumed blanket “no refunds” clause or a checkbox without the legally required wording/process.
- The [GDPR text](https://eur-lex.europa.eu/eli/reg/2016/679/oj), [Lithuanian VMI](https://www.vmi.lt/evmi/) and [Lithuanian VDAI](https://vdai.lrv.lt/lt/) remain primary starting points for privacy/tax review. A product-specific data map, controller/processor allocation, lawful bases, retention, security, subprocessors and international transfer assessment still need to be completed.

This is research to identify decision gates, not Lithuanian tax/legal advice. Pages and terms can change; recheck with the providers and qualified Lithuanian professionals before launch.
## Free/Pro testing in staging and production

| Environment | Identities and billing | Required evidence |
| --- | --- | --- |
| Dev/staging | Anonymous Free; signed-in Free; Pro, expired/cancelled/refunded/failed-payment accounts; provider sandbox subscriptions and signed sandbox events | Separate auth/database/bucket/secrets; resettable synthetic fixtures; every selected gate and complete restore tested. UI mocks do not prove billing integration |
| Production | Dedicated staff-owned Free and separate Pro accounts; an audited server-side complimentary grant with expiry/reason where appropriate | Backend-authorized staff administration and minimal roles; isolated data excluded from analytics; no arbitrary client override |
| Production billing verification | Controlled authorized purchase and observed cancellation/refund, or provider-supported production validation | Comped Pro verifies features, not actual payment. Record transaction/refund and costs; never use sandbox keys for real buyers or grant all users Pro |

No `?pro=true`, localStorage plan override, hard-coded staff email or unauthenticated grant endpoint. Trusted staff status is server-controlled, not editable user metadata. Test account switching, cached/offline access, multi-gun restore, lapse/cancellation and private service-worker behavior on Chromium/WebKit and physical Safari. Production smoke users cannot access customer data.

## Launch gates

Follow [the roadmap](../project/web-commercial-plan.md): focused hardening and Contact/SEO/research, define one commercial specification, implement recovery, then entitlements/checkout/gates and controlled release. Backup/restore precedes full sync. Sharing, extra sound categories and camera/sensor work are later candidates within the same Pro plan, not launch promises. This documentation adds no checkout, account, paywall or cloud upload.
