# Monetizing Dry Fire With Ease

Prepared 2026-10-11 · recommended strategy and example prices, not implemented commercial rules or verified market research.

## Recommended starting model

Start with a useful free product and a simple **Pro lifetime unlock** for individual users. This fits the current local/offline app, whose main ongoing costs are development/support rather than an existing hosted user-data service. A subscription becomes easier to justify when recurring benefits such as cross-device cloud backup, coaching content or club services actually exist. Validate demand before adding payment complexity.

| Tier idea | Proposed scope | Current reality |
| --- | --- | --- |
| Free | One gun, trigger calibration, core practice, saved history and backup export | App currently allows up to five guns; one-gun enforcement is explicitly deferred |
| Pro lifetime | Up to five guns, custom presets and deeper comparable-session analysis | These features currently exist without payment; purchase/entitlement logic does not |
| Later subscription or club plan | Real cross-device recovery, shared training programs or team/coaching tools | No account/cloud/team service currently exists; these require separate scope and privacy design |

Do not remove existing users' recorded guns or trap their data when introducing limits. Define a grandfathering policy before implementation: retain existing profiles/results, allow viewing/export, and apply paid restrictions only to clearly disclosed future actions. Safety checks and access to one's own backups should remain available. These tier splits are suggestions, not approval to limit already shipped features.

## Pricing experiment

A reasonable first test is **US$14.99 lifetime Pro** versus **US$24.99 lifetime Pro**, with local currency/taxes managed by the storefront or payment provider. These are hypotheses, not competitor research or guaranteed conversion. Set one public offer at a time, explain exactly what it unlocks, and measure purchase conversion/refunds/support over a defined period. Avoid a subscription until users can see a continuing benefit.

Illustration only: 100 purchases at US$14.99 produce US$1,499 gross before fees, taxes, refunds, hosting and support. At an assumed 15% store fee, US$1,274.15 remains before the other costs; at an assumed 30% fee, US$1,049.30. Actual fee programs, regional rules and eligibility vary. Do not plan profit from gross revenue.

## Payment channels and required engineering

**Web/PWA:** use a hosted checkout provider such as Stripe or a merchant-of-record provider where available. A merchant of record may handle more sales-tax/VAT administration; compare fees, supported countries/products and payout terms. A local browser flag alone is not reliable proof of purchase. Use server-side payment events and an entitlement service, with a recovery/account or secure license mechanism. Keep learned audio features/history local unless cloud storage is separately authorized.

**iPhone App Store / Google Play:** paid digital feature unlocks generally use the storefront's in-app purchase/billing system under the rules applicable to that app and market. Prefer a non-consumable Pro purchase, Restore Purchases and clear entitlement states. Some regions/programs permit alternatives; check current eligibility before implementing links or external checkout in the native app. Do not assume wrapping the website exempts it from store payment rules.

A shared entitlement layer should verify purchase receipts/tokens on a trusted backend, handle cancelled/refunded/revoked purchases, restore ownership on reinstall and provide a documented offline grace policy. Do not ship store secrets in JavaScript. Store purchases do not automatically create matching web purchases; define cross-platform account/linking policy before promising it. A purchases service can simplify implementation, but still requires store products, account setup, app identifiers and privacy review.

Current code contains neither checkout nor native billing plugins nor a server entitlement system. Backup files should not confer paid ownership merely by changing a setting. Native wrapper stores and Safari PWA storage are distinct; purchase recovery and training-data recovery are separate problems.

## Acquisition and product proof

Use the [SEO proposal](../seo/README.md) for honest public explanations, searchable help and demonstrable screenshots. Show calibration, the six modes, local data, countdown/STOP and comparable progress clearly. Seek voluntary user feedback and opt-in reliability reports, especially from the actual iPhone target, before marketing recognition performance. Add analytics only after defining what is collected and why; do not upload firearm profiles/audio history merely to measure sales.

Avoid firearm/munition sales, manufacturer logos without permission and unverified “perfect detection” claims. Check the specific payment provider and store rules for this non-live-fire timing/tracking product and its marketing. Do not promise approval, intellectual-property clearance or measured safety/aim benefits.

## Optimized launch sequence

1. Finish device reliability and visual regression work; verify deployment and make backup recovery dependable on web/native targets.
2. Validate willingness to pay using a concrete Pro offer and a small test audience; do not charge for missing features.
3. Choose sales channel and define Free/Pro limits, existing-user protection, refund/restore/offline behavior and privacy terms in requirements before code.
4. Implement entitlements and hosted checkout or store billing, with cancellation/refund/restore and tamper tests; protect users' stored training data.
5. Release a native beta through TestFlight/Play testing and verify billing in the storefront sandbox/test-track environment.
6. Publish honest pricing, product support/privacy/contact details, and monitor net revenue, refunds, support and retention. Revisit subscription only after recurring paid value exists.

## Official starting references

- [Apple in-app purchases](https://developer.apple.com/in-app-purchase/) and [App Store review guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple Small Business Program](https://developer.apple.com/app-store/small-business-program/)
- [Google Play Billing](https://developer.android.com/google/play/billing) and [service fees](https://support.google.com/googleplay/android-developer/answer/112622)
- [Stripe Checkout](https://docs.stripe.com/payments/checkout) and [Stripe restricted businesses](https://stripe.com/legal/restricted-businesses)
- [RevenueCat Capacitor purchases integration](https://www.revenuecat.com/docs/getting-started/installation/capacitor)

Remaining product scope is explicit in the [plan](../project/implementation-history.md). This guide is advice and implementation preparation, not a deployed paywall or an account/payment transaction.
