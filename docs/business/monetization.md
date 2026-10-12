# Monetization analysis and proposal

CHG-032 current public availability is governed by [build editions](../requirements/build-editions.md): no new custom creation/additional-gun creation/advanced graphs publicly; full preview retains them. Existing data/preset editing/use/export/restore remain available. This overrides earlier all-free availability statements for these actions without implementing billing or deleting data. Publication/deployment are tracked separately.

CHG-026 · revision 2.0 · 2026-10-11 · **Analysis requested; no price, paywall, provider or cloud retention rule approved/implemented.** Business location: Lithuania. Initial markets: Europe; define the exact EU/EEA/non-EU country list before launch. Native apps/store billing are deferred.

## One clear offer

Recommend **Free plus one Pro plan**, initially one annual subscription offer. Candidate price: **€24/year**; this is an affordability/cost hypothesis, not a market-verified or approved selling price. Explain the full yearly charge rather than advertising a monthly equivalent that users cannot buy. If research supports another price/cadence, choose one clear launch offer; no multiple Pro tiers, add-ons or simultaneous lifetime offer.

Free starts without sign-in and remains useful for basic dry-fire practice. Account creation/login and purchase recovery are available when needed; login itself is not a paid capability. Pro pays for convenience, recovery and deeper analysis, and needs a recoverable account. This replaces the earlier lifetime-unlock recommendation for the cloud-backed roadmap: a one-time fee creates indefinite hosted costs unless clearly bounded. Earlier illustrative prices were not market validation.

## Capability proposal and existing-user protection

| Capability | Recommended Free | Candidate Pro / later scope | Current implementation |
| --- | --- | --- | --- |
| Safety, Trigger learning, start signal/timing and built-in practice | Available; retain all current built-in modes to avoid mode-by-mode confusion | No safety/basic-recognition upsell | Implemented free |
| Gun library | One new gun after a defined transition | Up to the existing five-gun capacity | CHG-032: public creation limited to one; existing libraries usable; full preview retains five; billing absent |
| Local storage, manual export/import and personal-data access | Available, including on cancellation | Automatic cloud backup/recovery and later sync | Local/manual backup implemented; cloud absent |
| Account/sign-in/purchase restore | Available when needed; anonymous practice remains possible | Account-linked Pro entitlement | Accounts/entitlements absent |
| Custom drills | Built-ins available; preserve existing owned presets and readable/exportable data | Candidate paid custom creation/editing and saved presets | CHG-032: creation in full preview; existing preset editing/running in both |
| Statistics | Useful timing/history text summaries | Candidate graphs, comparisons, filters and deeper analysis | CHG-032: text summaries in both; advanced graphs in full preview only; final paid allocation proposed |
| Email support/contact | Available to all, without sign-in | Same public contact | Separate app Contact/mailto implemented; address `easydryfire@gmail.com`; public server route unimplemented |
| Share drills | Not necessary to basic practice | Later candidate: share sanitized sequence definitions, not gun/audio/history data | Unimplemented |
| Extra gun-type sound categories | Existing types/Trigger remain usable | Later optional mechanical categories, after accuracy validation | Extra categories unimplemented |
| Camera/sensor analysis | No promise of movement/aim grading | Later candidate with separate privacy/device/design scope | Unimplemented |

The user supplied examples, not an approved final allocation. Existing multi-gun/custom/graph functionality must not be relabeled as a new implemented Pro feature. Before gating, specify grandfathering versus new-action limits, imported-backup handling, existing gun/preset use/editing, offline entitlement grace and lapse/cancellation. Preserve profiles/results and access/export; never silently delete data or make an old backup prove payment. A permanent legacy entitlement needs an explicit reliable policy, not a forgeable browser flag.

Use one **Upgrade to Pro** entry and one short comparison. Trigger training and Start remain primary; account/billing/backup controls are secondary. Avoid repeated sales prompts or mandatory optional-sound training. Review new screen designs and update requirements/architecture/baselines before code.

For the immediate public-versus-owner access question, [the pre-billing strategy](../development/free-preview-testing.md) proposes public Free and a full dev preview protected by Cloudflare Access. Define allocation and preserve existing data use/export first; staff production access comes later via backend entitlements. Preview is not a third public plan. The user's latest instruction pauses implementation and requests plans committed to a feature branch only.

## Pricing and business model

Complete [competitor research](competitor-analysis.md) before final pricing: compare phone-only products separately from hardware bundles. Current prices are unverified due network denial. Test whether new users understand Free/Pro and would pay for demonstrable recovery/convenience; do not charge for roadmap items.

Measure net contribution: tax-inclusive receipts minus applicable VAT/sales tax, processor/MoR fees, refunds/disputes and variable auth/storage/email/support. Add fixed hosting, monitoring, accounting, relevant insurance/legal and operator time. Set spend alerts and per-user backup budgets before promising unlimited storage.

Illustration only, **not Lithuanian VAT advice or actual provider pricing**: €24/year with an assumed 20% VAT yields €20 before transaction costs. An assumed fee of 5% of gross plus €0.50 costs €1.70; €1 refund allowance and €3 variable service/support leave €14.30 contribution. An assumed €300 yearly fixed platform cost needs about 21 paid users before development/marketing/business overhead. Replace every assumption with actual customer-country tax treatment, provider contract and measured usage. Do not infer the applicable VAT rate from this example or the business country alone.

## Billing choice and technical requirements

| Option | Benefit | Responsibility / decision gate |
| --- | --- | --- |
| Direct processor, e.g. hosted Stripe Checkout/Billing | Hosted card/SCA flows, subscriptions and customer portal | Verify Lithuanian business/product eligibility; merchant owns applicable VAT/OSS/sales-tax setup, invoices, refunds/disputes and consumer obligations; tax/accounting tools may be needed |
| Merchant of record, e.g. Paddle or Lemon Squeezy | May handle customer tax collection/remittance and more billing administration under its contract | Verify supplier/product eligibility, payout/refund/reserve terms, markets and exact fees; supplier still has accounting/privacy/support obligations |

A MoR is the preferred **complexity-reduction hypothesis** for small European web sales if this product is accepted and margin is suitable; direct billing may be cheaper but transfers more administration to the business. No provider is verified to accept this firearm-related software. Describe the product accurately during onboarding and obtain written eligibility where ambiguous; do not conceal its use or assume software is exempt from restrictions.

Use a trusted server entitlement and server-created checkout for a configured price. Never accept arbitrary price/customer/account IDs from the browser. Signed/idempotent webhooks are authoritative; a success redirect is not purchase proof. Check event environment, subscription/customer ownership, payment state, timestamps/replay; reconcile missed/reordered events. Handle SCA/payment failure, renewal/retry, cancellation at period end, expiry, refund, dispute/revocation and restore. Keep card data and secrets out of the app.

Billing ownership and training-data recovery are separate. Offline paid controls can be tampered with in a browser; use a documented signed/time-bounded cache for usability and enforce hosted resources server-side rather than promising impossible client DRM. Never destroy local data on lapse. [Cloud architecture](../architecture/cloud-services-proposal.md) owns recovery/isolation and proposed retention.

## Lithuania/Europe legal and operational work

Confirm the entity/trader, supported countries, payout/KYC and obligations with appropriate Lithuanian accounting/legal advice before charging. Europe includes non-EU jurisdictions; Lithuanian registration does not establish one pan-European setup.

- **VAT/invoicing:** classify the service; establish B2C/B2B treatment/customer-country evidence, registration/OSS eligibility, thresholds/exceptions, invoices and accounting retention. Business location does not imply a single VAT rate for all buyers. Document MoR versus supplier obligations.
- **Consumer terms:** disclose trader/contact, final price/cadence/taxes, renewal, shipped features, device limits, cancellation, refund/withdrawal and support. Provide self-service cancellation/restore. Digital service/content withdrawal exceptions have conditions; no assumed blanket no-refunds or silent waiver.
- **GDPR/privacy:** define lawful bases/purposes, informed cloud enablement, minimization, retention/deletion/export, DPAs/subprocessors and transfers. Treat gun-linked data carefully. Raw audio/video remains excluded; purchase analytics must not upload it. Review consent for nonessential marketing/analytics cookies separately.
- **Operations:** tenant isolation, incident response, tested service and user recovery, key rotation, abuse/spend limits and access audits. Choose sustainable support/refund ownership; a contact email alone is not an incident/recovery process.
- **Product/provider constraints:** check dry-fire software/marketing and target-country obligations; retain accurate safety/microphone limitations and avoid guaranteed accuracy/aim/legal-clearance claims. Payment acceptance does not establish IP/safety/consumer-law clearance.

Primary sources to verify: [Lithuanian tax authority](https://www.vmi.lt/), [Lithuanian data protection authority](https://vdai.lrv.lt/), [EU VAT](https://europa.eu/youreurope/business/taxation/vat/index_en.htm), [EU consumer contracts](https://europa.eu/youreurope/business/dealing-with-customers/consumer-contracts-guarantees/index_en.htm), [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj), [Stripe restrictions](https://stripe.com/legal/restricted-businesses), [Stripe Checkout](https://docs.stripe.com/payments/checkout), [Paddle acceptable use](https://www.paddle.com/legal/acceptable-use-policy), [Lemon Squeezy prohibited products](https://docs.lemonsqueezy.com/help/getting-started/prohibited-products). These legal/provider pages were not retrieved here; current wording and product applicability remain verification tasks.

## Free/Pro testing on dev and production

| Environment | Identities and billing | Required evidence |
| --- | --- | --- |
| Dev/staging | Anonymous Free; signed-in Free; Pro, expired/cancelled/refunded/failed-payment accounts; provider sandbox subscriptions and signed sandbox events | Separate auth/database/bucket/secrets; resettable synthetic fixtures; every selected gate and complete restore tested. UI mocks do not prove billing integration |
| Production | Dedicated staff-owned Free and separate Pro accounts; an audited server-side complimentary grant with expiry/reason where appropriate | Backend-authorized staff administration and minimal roles; isolated data excluded from analytics; no arbitrary client override |
| Production billing verification | Controlled authorized purchase and observed cancellation/refund, or provider-supported production validation | Comped Pro verifies features, not actual payment. Record transaction/refund and costs; never use sandbox keys for real buyers or grant all users Pro |

No `?pro=true`, localStorage plan override, hard-coded staff email or unauthenticated grant endpoint. Trusted staff status is server-controlled, not editable user metadata. Test account switching, cached/offline access, multi-gun restore, lapse/cancellation and private service-worker behavior on Chromium/WebKit and physical Safari. Production smoke users cannot access customer data.

## Launch gates

Follow [the roadmap](../project/web-commercial-plan.md): focused hardening and Contact/SEO/research, define one commercial specification, implement recovery, then entitlements/checkout/gates and controlled release. Backup/restore precedes full sync. Sharing, extra sound categories and camera/sensor work are later candidates within the same Pro plan, not launch promises. This documentation adds no checkout, account, paywall or cloud upload.
