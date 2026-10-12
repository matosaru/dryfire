# Authenticated private preview deployment

CHG-035 · 2026-10-12. Requested host: **https://dev-dryfire.matosaru.workers.dev**. Allowed tester: **matosaru@gmail.com**. Source/prepared configuration is separate from live Access activation and deployment; see [delivery history](../project/implementation-history.md).

## Boundaries

[wrangler.private-preview.jsonc](../../wrangler.private-preview.jsonc) targets the separate `dev-dryfire` Worker. Ordinary public `dryfire` / `dryfire-dev` configuration and deployment remain unchanged. All private asset paths run through [the Access token gate](../../workers/privatePreview.js), including HTML, JS, CSS, workers and build metadata. It verifies RSA signature against the team's Access JWKS, issuer, app audience, expiry and the allowed email. Missing configuration returns 503 without serving assets; anonymous/invalid tokens are denied, wrong identities/aliases cannot serve files. Deployment preview URLs are disabled, and only the requested hostname is accepted.

Private responses have `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow, noarchive`. The private app retires its origin's old app-shell cache/service worker and does not install an offline app shell. Local IndexedDB data, manual recovery and mode preference remain. Public offline functionality stays intact. Access protects new online requests; it cannot retract code already downloaded by an authorized tester or erase their local data. The repository is public and no exclusive-code claim is made.

## Cloudflare setup

1. In Workers & Pages, use **dev-dryfire** and enable Cloudflare Access for its `workers.dev` address through Settings → Domains & Routes. If necessary, create a placeholder Worker first; do not publish the full app as an unprotected static-assets Worker.
2. In Zero Trust → Access → Applications, select that host's application. Configure an Allow policy including only `matosaru@gmail.com`; email one-time PIN is sufficient. Remove broad allow/bypass rules and cover all paths. Keep other public Workers independent.
3. Copy the Zero Trust **team domain** (`<team>.cloudflareaccess.com`, without a path/protocol) and the application's **Audience (AUD) tag** into `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` in the dedicated config. These identifiers are not API secrets. Host/allowed email are already specified. Empty values deliberately fail closed.
4. Supply Cloudflare deployment credentials through secure environment/secret settings; never put an API token in Git or chat. Use a scoped token for the intended account/Worker and Access configuration rather than a global API key. The managed workspace currently has no configured Cloudflare credentials or outbound identity. No live policy/deployment is claimed.

Cloudflare Git Builds can deploy using its own configured repository integration, without an API token in this workspace. Set its build command to `npm run build:preview` and deploy command to `npm run deploy:private-preview`, selecting only reviewed/CI-passed source. This is an alternative to direct CLI deployment, not an activated integration. It does not supply the missing Access identifiers.

Keep Access enabled when deploying updates. For this Worker, Cloudflare Git Builds must use the explicit private build/deploy commands below; do not use the public Wrangler config. Release only source that has passed the existing feature → dev/release PR and CI gates. Cloudflare dashboard configuration and GitHub environment protections must be verified on the server; prepared files do not activate them.

## Build, dry run and deployment

```bash
npm ci
npm run build:preview
npm run verify:dist -- --edition=preview
npm run private-preview:check
# With configured Access identifiers, secure credentials and reviewed CI:
npm run deploy:private-preview
```

The private build starts in Free mode. Open Settings → **Test as** → **Full** to exercise five-gun creation, new custom drills and advanced charts; Free restores the actual two-gun public rules without deleting existing data. The selected simulation is remembered only on the private origin and is excluded from backups and payment entitlements. Switching is blocked during active work/confirmation/pending results. Public artifacts omit both the selector and override implementation. Different origins have separate browser libraries; use a compatible manual backup to seed preview, not an implied cloud synchronization.

## Verify the actual host before calling it live

- Fresh anonymous/private browsing: `/`, `/edition.json`, `/sw.js` and an actual JS/CSS asset require Access login; none returns the full asset. HTTP uses HTTPS. Alternate deployment/alias URLs do not expose files.
- Allowlisted email: login, load HTML and every module, confirm preview metadata, toggle Free/Full and check saved data survives refresh. Confirm an unrelated email is denied and expired/invalid authentication cannot fetch assets.
- Use the Network response headers to verify private/no-store/noindex; the preview has no persistent app-shell service worker. Exported backup and IndexedDB survive reload and mode changes. Public URLs still serve the public edition and its offline cache.
- Record the tested source/deployment revision, anonymous/authorized/denied outcomes and device checks in the delivery tracker. Node/synthetic/browser tests do not establish live Access or real microphone accuracy.

If this hostname previously hosted an unprotected cached app, export a backup and retire only its app-shell worker/cache before verification. An old already-installed service worker may intercept navigation before a new authenticated request; do not clear IndexedDB or all website data as a routine upgrade. On that origin, browser developer tools can unregister `/sw.js` and delete Cache Storage names starting `dryfire-sound-trainer-`, then reload through Access. New preview source performs that retirement when loaded successfully.
