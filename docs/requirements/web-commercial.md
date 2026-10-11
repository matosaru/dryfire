# Web commercial requirements preparation

CHG-026 · revision 1.0 · 2026-10-11. **Requested planning/analysis; proposed commercial/backend behavior, not implemented.** The user confirmed Lithuania/Europe and deferred native apps. This file does not override currently free features or authorize a final price/provider/data-retention decision.

The latest instruction is **plans only, committed to a feature branch; do not start implementations**. All product states below remain unimplemented until the user later starts that work.

| ID | Requirement / decision to specify | State and acceptance |
| --- | --- | --- |
| CONTACT-01 | Add an app Contact page and email support, also reachable from public pages | Directly requested forward scope, unimplemented; user-confirmed address `easydryfire@gmail.com`. Anonymous/Free/Pro users see the address and an Email support mailto action plus copy fallback; include no gun/audio/history data automatically |
| WEB-01 | Real public SEO content with structured/canonical/social metadata, sitemap and robots configuration | Requested forward plan; routing/domain/design choice proposed. Product/help/contact pages work without login/microphone/local data; only real public canonical pages indexed; dev/account/session pages noindex |
| REVIEW-01–08 | Review and optimize/security-harden using observed findings | Initial review performed; fixes/benchmarks pending. Preserve data/timing, measure before/after and use meaningful regressions; [detailed findings](../development/security-performance-review.md) own these IDs |
| COMM-01 | Basic practice useful/free; exactly one inexpensive paid plan; simple onboarding | User-requested constraints. Free first practice needs no account/payment; one Pro offer, no feature-pack tiers; concrete split/price needs a reviewed decision |
| COMM-02 | Protect existing guns, presets/results and recovery during commercial transition | Proposed acceptance: no deletion or silent restriction; define grandfathering/import/lapse before code, preserve manual export/import and personal-data access |
| ACCOUNT-01 | Recoverable managed sign-in and identity for Pro | Candidate, unimplemented. Verify session ownership/recovery; anonymous data survives linking; account switching never mixes data/entitlement; login itself is not paywalled |
| CLOUD-01 | Preferences plus compatible gun/calibration/preset/history/session backup and explicit restore | Candidate, unimplemented. Enable knowingly, acknowledge real success; browser-data deletion/sign-in restores a validated complete library; failure preserves previous usable data |
| CLOUD-02 | Later cross-device sync | Candidate, unimplemented. Revision/conflict/offline/deletion/account-switch tests precede claims; raw-audio/video upload not authorized |
| BILL-01 | One provider-backed Pro subscription with trusted server entitlement | Candidate, unimplemented. Signed/idempotent events; checkout ownership/cancellation/refund/expiry/restore tested; redirects/local backups cannot grant ownership |
| QA-01 | Test selected Free/Pro/lapsed states in dev and production | Requested planning constraint. Separate infrastructure/keys; synthetic dev users, staff-owned production Free/Pro users with audited server roles/grants; no public/client bypass or customer-data access |
| PREVIEW-01 | Public Free subset while owner tests all features before billing | User requested how; approach proposed/unimplemented: separate public/full-preview profiles, staff-protected dev hostname/aliases, both editions tested; existing data usable/exportable. Later production access is server-entitled; [strategy](../development/free-preview-testing.md) |
| PAID-01 | Select launch paid scope: cloud recovery, custom creation, more than one gun, advanced statistics | User examples, allocation proposed. Current custom/five-gun/basic graphs remain free until a concrete transition/matrix is approved; working Pro capacity reuses the existing five-gun limit |
| PAID-02 | Consider sharing, extra gun-type sounds, camera/sensor analysis | Later candidates, unimplemented and not launch promises. Sharing strips gun/history/calibration data; extra sound/camera measures need accuracy/privacy/device/design requirements |
| NATIVE-01 | Native iOS/Android release | Deferred by direct instruction; web/PWA remains active. Existing guide kept, no native generation/submission/billing work now |

Commercial acceptance depends on provider acceptance of the Lithuanian business/product, exact European country list, tax/consumer/privacy documentation, sustainable cost and the actually implemented offer. [Monetization](../business/monetization.md), [cloud architecture](../architecture/cloud-services-proposal.md) and [the roadmap](../project/web-commercial-plan.md) own the detailed decisions/order.

Future design scope: landing/help/contact/Free-Pro explanation, optional sign-in/recovery, account/billing, backup status/restore and understandable locked-action states. Define exact copy/visuals before product changes and add actual routes/screens to the registry with implementation. No new screenshot or current site-tree entry is claimed by this planning document.
