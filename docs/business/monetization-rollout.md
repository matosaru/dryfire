# Monetization discovery and feature rollout

CHG-073 · 2026-11-12 · **Planning only. No price, feature allocation, provider, account/cloud behavior or implementation is approved by this document.** Work is isolated on `feature/monetization-rollout-plan`; `b` and `main` remain unchanged. The web/PWA is the only launch platform; native apps remain deferred.

This is the proposed next commercial plan, informed by the user's published-site analysis, a fresh limited review of first-party competitor pages, the current Free/Full build-edition contract, and the existing Lithuania/Europe business requirements. Proposed decisions remain proposals until separately approved.

## Product direction

Keep the public offer easy to explain:

> **Free** for local dry-fire practice. **One Pro plan** for expanded tools and reliable recovery of the user's library.

Free practice must not require an account, payment details, cloud access, or paid sound categories. Safety information, trigger learning, start cues, built-in practice, and usable local results remain accessible without payment. Contact and support are not paywalled.

Avoid selling “accuracy”, safe firearm status, aim, or movement analysis that a phone microphone cannot establish. Improve and validate sound recognition and the first-session path before paid acquisition. The microphone-based workflow is a competitive strength, but Dry Fire Pro currently advertises ML trigger detection too; “microphone recognition” alone is not a defensible unique claim. Validate whether EasyDryFire's user-trained sound profiles, local-first operation, low setup effort, and browser/PWA access are meaningful customer advantages.

## Proposed rollout sequence

| Phase | Work | Exit evidence |
| --- | --- | --- |
| **0 — Validate Free product readiness** | Complete owner testing of trigger recognition, first-shot readiness, beep audibility, and recovery/export on the intended iPhone Safari/Home Screen environment. Review a new-user path from first gun to first useful repetition. Resolve contradictory gun-limit text and make recognition errors understandable. | Recorded device/browser/build and repeatable owner observations; issues triaged; no marketing claims exceed verified behavior. Automated tests are not microphone-accuracy evidence. |
| **1 — Market and price research** | Complete a dated first-party comparison of direct microphone apps separately from laser/sensor hardware products. Verify store prices and paywall details in target markets where pages hide prices in apps. Interview/test with prospective users: what they expect from Free, why they would pay, and whether one annual offer is understandable. Build a net-revenue and storage/support cost model using actual provider terms. | Source-backed competitor matrix; explicit unknowns; willingness-to-pay evidence; approved candidate markets and one price/cadence. Do not quote the analysis's illustrative €4.99/month or €49–€69 lifetime figures as verified. |
| **2 — Approve the commercial contract** | Decide the exact Free/Pro matrix, supported country list, one billing cadence, price/tax presentation, trial policy, renewal/cancellation/refund wording, support ownership, existing-user transition, offline behavior, and data export/deletion rights. Obtain Lithuanian accounting/legal review and written payment-provider eligibility for this firearm-related training product. | Versioned requirements and user-reviewed screens/copy; provider, tax, privacy, consumer, and operational decisions documented. No billing code or user data upload before this gate. |
| **3 — Select account and recovery architecture** | Choose managed identity and storage after comparing Cloudflare D1/R2 with managed alternatives, regions, processor costs, backup size/retention and deletion behavior. Design optional account linking that preserves an anonymous local library. Build versioned, integrity-checked backups and explicit restore first. Keep normal local practice available during network failure. | Threat/data-flow review; isolated staging resources; tested link, account switch, restore, deletion/export, backup failure and old-schema compatibility. No background cross-device merge yet. |
| **4 — Pilot recovery value before subscription** | If approved, run opt-in account/backup in a small private pilot without charging. Measure successful backup/restore, support requests, storage per account, recovery time, and whether users understand what is uploaded. Raw audio/video remains excluded unless separately specified and approved. | Restore succeeds after cleared browser data and on a second device; failure never replaces the last good copy; measured operational cost fits the offer. |
| **5 — Implement one Pro entitlement and checkout** | Select a payment provider only after eligibility and cost review. Use hosted checkout, server-created price IDs, signed/idempotent billing events, customer-owned subscription records, and server-controlled entitlement state. Support active, grace, failed payment, cancel-at-period-end, expiry, refund, dispute, restore and account switching. | Separate staging identities and provider sandbox prove all lifecycle states, event replay/order, ownership isolation and support/cancellation paths. Production test accounts are staff-owned and audited. |
| **6 — Release the one-plan Pro feature set** | Candidate Pro value: automatic backup/recovery; current product capacity up to five guns rather than promising “unlimited”; new custom-drill creation; and advanced graph analysis. Keep built-in drills, basic practice, local history text and manual export/import useful in Free. Implement one runtime server-entitlement source in the public app; keep the private Full preview as a testing edition, not a customer entitlement. | Public artifact contains no tester switch or client-side grant path. Pro/Free states match backend entitlement; offline expiry/grace is explicit. Both editions, lifecycle states, data migration and rollback pass full checks. |
| **7 — Controlled launch and review** | Start with an invite-only or limited production cohort. Monitor purchase conversion, renewal/cancel/refund, restore success, support load, cost per account, errors and Free practice completion. Provide a fast rollback that disables checkout/new paid actions without deleting user data. | Launch metrics and thresholds selected in advance; cost alerts, incident ownership, support/refund handling and rollback rehearsed before widening access. |
| **8 — Expand only on evidence** | Consider conflict-aware ongoing sync, drill sharing, extra sound categories, and camera/sensor features separately. Keep one Pro plan; do not introduce Coach/Club or hardware scoring as launch scope. | Each feature has demonstrated demand, privacy/security/design requirements, cost and device coverage, plus separate approval. |

Phases 0–2 can proceed as research and planning in parallel. Account/cloud implementation should not start until the offer and data policy are approved. Payment integration should follow tested recovery and provider/legal gates. This order minimizes the risk of charging before the product can recover customer data or reliably fulfill the offer.

## Candidate Free / Pro allocation

This is a working proposal, not a final entitlement decision. It reconciles the current public-edition requirements with the submitted analysis and avoids removing access to saved data.

| Capability | Free proposal | Pro proposal | Transition safeguard |
| --- | --- | --- | --- |
| Core practice and trigger sound learning | Built-in practice, sound learning, local use, no account | Same | Do not gate safety or basic practice. |
| Guns | Create up to two; current app's existing larger libraries remain usable | Create up to the existing five-profile capacity | Never delete or hide existing profiles; define selection/editing rules for over-limit libraries before release. Do not claim unlimited profiles without changing and testing capacity. |
| Custom drills | Built-in sequences; preserve saved custom drills and their current public use/edit behavior | Create new custom drills and save presets | Do not disable or delete old presets when Pro lapses. Keep run/export/read access. The current public build already intentionally distinguishes creation from existing presets. |
| History and analysis | Local history, text summaries and manual export/import | Graphs and richer comparisons; optional cloud recovery | Preserve all source session records; keep an accessible text/export path if Pro lapses. Do not make raw records inaccessible. |
| Accounts and storage | Anonymous/local-first; manual backup and restore | Optional account, automatic versioned backup and explicit restore | Login is not itself a paid feature. No account is required to try Free. Cross-device live sync follows later after conflict behavior is proven. |
| Sharing / camera / extra categories | Not in initial Free/Pro release | Not promised at launch; evaluate later | No camera, raw audio/video upload, social, or coach claims without separate consent, privacy, device and accuracy work. |

Before paid launch, choose the transition behavior for owners who already use more than two guns, saved presets, or advanced graph views. The safest default is: preserve all local data; keep existing guns and drills usable and exportable; block only creation of new paid items in Free; keep text summaries available; and never delete or silently rewrite records on cancellation. Any stronger grandfathering or migration entitlement needs an explicit rule and a reliable way to identify it without trusting a forgeable browser flag.

## Pricing and market research rules

- Keep one public Pro plan and one launch billing cadence. An annual-only offer is the current simplicity hypothesis, not an approved decision; show the actual annual charge clearly and do not market an unavailable monthly equivalent.
- Do not launch simultaneous monthly, annual, lifetime and feature-pack offers. A lifetime offer is a poor initial fit for ongoing backup, support, and storage costs.
- Treat **€24/year** from the existing planning document, **€4.99/month** and **€49–€69 lifetime** from the submitted analysis as unvalidated hypotheses. Do not put any of them into UI or checkout until research and cost modeling select one.
- Separate phone-only subscription comparisons from hardware purchase bundles. Hardware prices cannot establish the appropriate software price.
- Confirm current product acceptance and payout terms with the selected processor/Merchant of Record in writing. Do not misdescribe the product to obtain approval.
- Define the launch countries instead of saying only “Europe”. Lithuania registration does not settle VAT treatment in every supported market, consumer disclosure, payment eligibility or data-transfer obligations.

## Technical and operational release controls

1. Keep the existing build-edition split for public Free and private Full preview; it is not the Pro authorization system.
2. The same public app must safely serve Free and Pro customers. Do not compile a client-side `?pro=true`, localStorage override, hard-coded staff email, or hidden UI-only paywall.
3. Use backend-verified account entitlement for checkout, cloud APIs and paid operations. Local-only features can be manipulated in a browser, so define the accepted offline/signed-entitlement limits honestly; do not claim impossible client DRM.
4. Keep account, billing, storage, and secrets isolated between staging and production. Staging uses synthetic users/provider sandbox events. Production uses staff-owned Free and Pro test accounts with audited grants, never customer data.
5. Maintain an export path and versioned recovery snapshots. Test data deletion, restore, account switching, backup expiry, entitlement lapse, refund and rollback before production launch.
6. Add focused tests for pricing/entitlement state transitions, server webhook verification, owner isolation, data preservation and SEO metadata of new public commercial pages. Run full public/preview builds and visual/performance acceptance when product screens change.

## Required decisions before implementation

1. One Pro billing cadence and a researched price.
2. Exact supported launch countries and required language/currency disclosures.
3. Final Free/Pro matrix and handling of existing over-limit guns, presets and graph history.
4. Auth/storage/backup provider, regions, retention, quotas and account deletion/export.
5. Payment provider with written category acceptance, fees, refund/dispute handling and tax ownership.
6. Trial policy (default recommendation: no trial until cancellation, renewal and support flows are proven).
7. Minimum pilot cohort, launch metrics, rollback trigger and named support/incident owner.

The implementation stage begins only after these decisions are incorporated into approved requirements/designs. Until then, this document is a plan and the current public app behavior remains unchanged.
