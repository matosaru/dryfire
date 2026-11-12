# Monetization discovery and feature rollout

CHG-073 / CHG-074 · 2026-11-12 · **Planning only. The owner has selected initial feature candidates to investigate; provider, account/cloud design, paywall, price, final entitlement allocation and implementation are not approved.** Work is isolated on `feature/monetization-rollout-plan`; `b` and `main` remain unchanged. The web/PWA is the only launch platform; native apps remain deferred.

This commercial plan incorporates the requested feature scope in [initial account, cloud and training features](initial-monetization-scope.md). Price, payment integration and other commercial decisions are deferred to a later plan. Any implementation remains separately gated and isolated from `b` and `main`.

## Product direction

For the current feature work, keep basic practice local and usable without sign-in. Account creation is optional and is introduced only for cloud backup/restore. Do not implement a public upgrade flow, payment collection, subscription, paid gating or price; the eventual Free/paid split is a later decision. Safety information, trigger learning, start cues and built-in practice remain accessible.

Avoid selling “accuracy”, safe firearm status, aim, or movement analysis that a phone microphone cannot establish. Improve and validate sound recognition and the first-session path before paid acquisition. The microphone-based workflow is a competitive strength, but Dry Fire Pro currently advertises ML trigger detection too; “microphone recognition” alone is not a defensible unique claim. Validate whether EasyDryFire's user-trained sound profiles, local-first operation, low setup effort, and browser/PWA access are meaningful customer advantages.

## Proposed implementation sequence for the selected features

**Current requested scope:** CHG-074 asks for Google-linked account creation, private cloud library backup/restore, support for five gun profiles, graphical drill history, investigation of additional drill modes, and drill analysis/suggestions. Requirements and technical prerequisites are in the linked feature-scope document. Payment provider, price, purchase flow, entitlements and paid-feature gating are deferred.

| Step | Work | Required exit evidence |
| --- | --- | --- |
| **0 — Confirm architecture and data contract** | Choose an identity/storage candidate, EU data locations, backup-versus-sync boundary, cloud data fields, size/retention/deletion rules and anonymous-library linking behavior. Preserve local IndexedDB and backup format compatibility. | Written data-flow and threat/privacy review; selected non-production region/resources; no silent local/remote overwrite; cost alerts and provider terms understood. |
| **1 — Prove account sign-in** | Prototype optional Google sign-in using Firebase Auth as the leading candidate; keep anonymous practice. Use the redirect flow on iPhone Safari/Home Screen. | Staging auth works on iPhone Safari/Home Screen and desktop; the Cloudflare same-origin helper route avoids Safari third-party-storage failures, returns to the correct route, and survives refresh; account switching/logout cannot expose another owner's data, Google Drive scopes are absent, auth responses are not cached, app payload/performance is preserved. |
| **2 — Implement cloud backup and restore** | Store versioned whole-library snapshots in private cloud storage; include preferences, up to five guns and their derived sound features, presets and saved history. Provide explicit first upload, status, retry, restore, export and deletion. | Security rules/tests deny anonymous and cross-account access; upload/restore is validated and atomic; failed writes keep last good backup; cleared browser data can recover; legacy formats work; no raw PCM/video is uploaded. |
| **3 — Five-gun data path and graphical history** | Ensure all five profiles and ownership associations round-trip; produce visual history summaries from existing durable results. | Tests cover five-profile save/restore and legacy libraries; graphs compare matching gun/mode/configuration and include accessible text, date range, units, sample count and low-data state. |
| **4 — Investigate and specify more drills** | Audit existing modes and ask users which practice goal is missing. Rank only options the microphone can measure; specify sounds/events, expected output and failure/false-positive handling. | A short reviewed shortlist, clear acceptance metrics and updated design/requirements; modes requiring target/aim/safety verification are excluded or require separate sensors and claims review. |
| **5 — Add drill analysis and suggestions** | Begin with deterministic, explainable summaries from a user's saved sessions; no generative AI is needed. | Every suggestion names the underlying result/time window, handles insufficient/contradictory data, is covered by unit/integration tests, and avoids safety/aim/physical-action claims. |
| **6 — Full validation and private pilot** | Run unit, rules/security, integration, mobile visual and performance checks; owner tests the app on iPhone Safari/Home Screen and verifies real sign-in, backup and recovery. | Exact feature candidate passes CI; manual account switch, first upload, lost-local-data restore and account deletion are recorded. Cloud cost, privacy copy and rollback are reviewed. No price or payment is shown. |
| **Later plan — Price and monetization** | Only after the feature works, decide price, provider, subscription terms, country list, paywall and entitlement rules. | Separate approved plan, provider's written product acceptance, Lithuanian professional review and lifecycle/security tests. This work is not part of CHG-074. |

The steps intentionally separate account sign-in from durable recovery and recovery from live synchronization. Cross-device continuous sync, drill sharing, extra sound categories and camera/sensor analysis remain separate future candidates. The feature implementation can proceed without a price or checkout, but the owner must separately authorize code work after reviewing the feature requirements/design.
## Research conclusions and recommended decision path

- **Packaging:** keep the future offer simple, but leave plan count/cadence/price decisions to the later commercial plan. Keep basic practice and user data useful without signup.
- **What to charge for:** prioritize *reliability and convenience* (opt-in cloud backup and restore) as a clear ongoing-value candidate. Custom creation, multiple-gun capacity and richer graphs are secondary candidates, not confirmed premium differentiators: Dry Fire Pro markets drill tools and statistics and advertises a similarly priced plan. Preserve Free's useful built-in practice and local/manual data portability. Existing users' saved profiles, sessions, drills and graphs must remain accessible/exportable through any tier transition.
- **Payments:** eligibility is the first commercial blocker. Stripe's current restricted-business page places legal firearms in limited availability and directs businesses to sales; Lemon Squeezy lists weapons/ammunition as regulated; Paddle publicly targets SaaS and its current page has broad harm/violence restrictions while reserving judgment. None has approved this app. Ask for written, product-specific acceptance before building checkout; do not choose solely on advertised fee rates.
- **Costs:** published Cloudflare D1/R2 rates suggest modest backup bytes may be inexpensive at small scale; they do not establish all-in costs. Measure real backup sizes and retention; include account service, Worker plan/requests, monitoring, payment fees, taxes, chargebacks/refunds, support and professional/accounting costs. Paddle public pricing is 5% + US$0.50 per checkout transaction, but that is not a quote or eligibility decision.
- **Market/legal:** start with a deliberately selected, provider-supported country list rather than treating “Europe” as one tax market. EU VAT, consumer terms and price/provider analysis belong to the later commercial plan; they do not block technical feature scoping. Before a paid launch, Lithuanian accounting/legal advice must establish classification, registrations, checkout disclosures, cancellation/refund and privacy obligations.
- **Research evidence quality:** public competitor descriptions and store prices are not hands-on testing or proof of local availability, purchase conversion or competitor quality. The next useful evidence is in-app paywall inspection and a small user research round, followed by provider written decisions and actual cost assumptions.

## Deferred Free / Pro allocation

This is an earlier working proposal, superseded for current CHG-074 scope and not a final entitlement decision. Do not implement the gates in this table now. It reconciles the current public-edition requirements with the submitted analysis and avoids removing access to saved data.

| Capability | Free proposal | Pro proposal | Transition safeguard |
| --- | --- | --- | --- |
| Core practice and trigger sound learning | Built-in practice, sound learning, local use, no account | Same | Do not gate safety or basic practice. |
| Guns | Create up to two; current app's existing larger libraries remain usable | Create up to the existing five-profile capacity | Never delete or hide existing profiles; define selection/editing rules for over-limit libraries before release. Do not claim unlimited profiles without changing and testing capacity. |
| Custom drills | Built-in sequences; preserve saved custom drills and their current public use/edit behavior | Create new custom drills and save presets | Do not disable or delete old presets when Pro lapses. Keep run/export/read access. The current public build already intentionally distinguishes creation from existing presets. |
| History and analysis | Local history, text summaries and manual export/import | Graphs and richer comparisons; optional cloud recovery | Preserve all source session records; keep an accessible text/export path if Pro lapses. Do not make raw records inaccessible. |
| Accounts and storage | Anonymous/local-first; manual backup and restore | Optional account, automatic versioned backup and explicit restore | Login is not itself a paid feature. No account is required to try Free. Cross-device live sync follows later after conflict behavior is proven. |
| Sharing / camera / extra categories | Not in initial Free/Pro release | Not promised at launch; evaluate later | No camera, raw audio/video upload, social, or coach claims without separate consent, privacy, device and accuracy work. |

Before paid launch, choose the transition behavior for owners who already use more than two guns, saved presets, or advanced graph views. The safest default is: preserve all local data; keep existing guns and drills usable and exportable; block only creation of new paid items in Free; keep text summaries available; and never delete or silently rewrite records on cancellation. Any stronger grandfathering or migration entitlement needs an explicit rule and a reliable way to identify it without trusting a forgeable browser flag.

## Pricing and market research rules (later plan)

Pricing is deferred. The existing €24/year, €4.99/month and €49–€69 lifetime figures are research notes only, not active recommendations or approved prices. The €24 annual note is near one native App Store comparator, but is unvalidated for EasyDryFire. A later plan should compare simple offer concepts, actual costs and user feedback; separate software from hardware prices; obtain written provider acceptance; and define supported countries and tax/consumer obligations. No price is to appear in this feature work.

## Technical and operational release controls

1. Keep the existing build-edition split for public Free and private Full preview; it is not the Pro authorization system.
2. The same public app must safely serve Free and Pro customers. Do not compile a client-side `?pro=true`, localStorage override, hard-coded staff email, or hidden UI-only paywall.
3. Use backend-verified account entitlement for checkout, cloud APIs and paid operations. Local-only features can be manipulated in a browser, so define the accepted offline/signed-entitlement limits honestly; do not claim impossible client DRM.
4. Keep account, billing, storage, and secrets isolated between staging and production. Staging uses synthetic users/provider sandbox events. Production uses staff-owned Free and Pro test accounts with audited grants, never customer data.
5. Maintain an export path and versioned recovery snapshots. Test data deletion, restore, account switching, backup expiry, entitlement lapse, refund and rollback before production launch.
6. Add focused tests for pricing/entitlement state transitions, server webhook verification, owner isolation, data preservation and SEO metadata of new public commercial pages. Run full public/preview builds and visual/performance acceptance when product screens change.

## Next decision research to close the open questions

### Payment-provider eligibility request

Before implementation, send each candidate an accurate product summary: EasyDryFire is browser/PWA software for dry-fire practice with a verified unloaded firearm, recognizes user-calibrated mechanical trigger sounds, includes timed practice/drills and does not sell, broker or facilitate firearm/ammunition purchases. Explain the planned web subscription and any public marketing claims. Ask in writing: (1) may this exact product and description be sold to consumers; (2) which countries, categories, ads and checkout wording are allowed; (3) does approval cover automatic renewal; (4) who is merchant/supplier of record and who handles each tax, invoice, refund, dispute and consumer cancellation duty; (5) exact transaction, currency conversion, payout, reserve, refund and chargeback costs; and (6) what review or notification is required if product features/marketing change. Save the response and policy version before selecting a vendor.

### Customer and price validation

Use short moderated sessions with people who dry-fire practice and a separate lightweight survey. Test whether people can explain the Free/Pro difference after one reading, whether Free feels useful without sign-in, whether cloud restore is valuable, whether the annual price is clear, and which existing-data transition would feel fair. Show one offer concept at a time in the product; use randomized price concepts only in research and label them as hypothetical. Record a price-sensitivity measure, objections, expected backup size/data concerns, and whether a participant would rather keep manual export. Treat stated intent as directional; actual voluntary purchases/renewals after a compliant launch are stronger evidence. Do not gate recovery or basic practice during this research.

### Country rollout

Do not treat Europe as one market. A prudent sequence is a private Lithuania-based pilot, then a published country list limited to countries accepted by the provider and covered by language, support, VAT and consumer-term readiness. Expand only after the accounting/legal review and support process works. This is a staged-risk recommendation, not a decision that EU-wide sales are legally unavailable.

## Decisions before CHG-074 feature implementation

1. Choose and document the identity/storage provider and EU data-region plan. Firebase Auth/Google, Firestore and Cloud Storage are a candidate, not an approved selection; Firebase Storage requires Blaze billing and the Firestore region is immutable after provisioning.
2. Approve the exact data map, backup/restore versus live-sync boundary, retention, size limits, local/cloud conflict behavior, account linking, export and deletion.
3. Specify how existing local libraries and profiles are attached without loss; define behavior for libraries already over five profiles.
4. Define the graph measures and accessible text equivalent from current session data.
5. Complete user research and requirements for additional drill types before selecting one.
6. Define deterministic suggestion rules, evidence/sample requirements, limitations and safety wording; no AI is required in this scope.
7. Approve account/cloud security and privacy review, test environments, and the Google OAuth domain/redirect setup.

These feature-specific decisions gate implementation of account/cloud/history/drill work. **Price, checkout, payment-provider eligibility, tax/commercial terms and paid entitlements are intentionally deferred** and must be planned before a paid launch, but do not need to be designed into this feature implementation now. Until implementation is separately authorized, this document remains planning-only and current public behavior is unchanged.
