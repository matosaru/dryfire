# Authenticated private preview deployment

CHG-035 / CHG-036 / CHG-038 / CHG-039 · updated 2026-10-14. Requested host: **https://dev-dryfire.matosaru.workers.dev**. Allowed tester: **matosaru@gmail.com**. Source/prepared configuration is separate from live Access activation and deployment; see [delivery history](../project/implementation-history.md).

## Boundaries

[wrangler.private-preview.jsonc](../../wrangler.private-preview.jsonc) targets the separate `dev-dryfire` Worker. dev now defaults to this private routing in `wrangler.jsonc`; b/main default to public routing. The user owns Cloudflare configuration and deployment. All private asset paths run through [the Access token gate](../../workers/privatePreview.js), including HTML, JS, CSS, workers and build metadata. It verifies RSA signature against the team's Access JWKS, issuer, app audience, expiry and the allowed email. Missing configuration returns 503 without serving assets; anonymous/invalid tokens are denied, wrong identities/aliases cannot serve files. Deployment preview URLs are disabled, and only the requested hostname is accepted.

Private responses have `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow, noarchive`. The private app retires its origin's old app-shell cache/service worker and does not install an offline app shell. Local IndexedDB data, manual recovery and mode preference remain. Public offline functionality stays intact. Access protects new online requests; it cannot retract code already downloaded by an authorized tester or erase their local data. The repository is public and no exclusive-code claim is made.

## Connect Git Builds to the correct Worker

The Worker connection is separate from the Git branch. Cloudflare supplies `WRANGLER_CI_OVERRIDE_NAME` from the Worker that owns the build. Changing the build/deploy commands within **dryfire** does not move a dev deployment to **dev-dryfire**.

| Cloudflare Worker | Repository branch | Build command | Deploy command |
| --- | --- | --- | --- |
| `dryfire` public production | `main` | `npm run build` | `npm run deploy:production` |
| `dryfire` public branch preview | `b` | `npm run build` | Existing `npx wrangler preview` command |
| `dev-dryfire` protected Full app | `dev` as this Worker's production branch | `npm run build:preview` | `npm run deploy:private-preview` |

In Workers & Pages, open or create **dev-dryfire**, connect `matosaru/dryfire` in its Builds/Git integration settings and select **dev** as its production branch. Keep **dryfire** production on **main** and its non-production branch selection on **b**, excluding **dev** from that public Worker's build selection. Configure Access for dev-dryfire as below before serving Full assets.

If the log says the config uses `dev-dryfire` but CI expects `dryfire`, fix that connection. Both private configs intentionally name `dev-dryfire`. Do not accept an automatic PR that changes the private name to `dryfire`, clear the CI override, or reuse the public Worker to silence the error. The new `verify:private-target` check stops private deploy/dry-run commands before Wrangler on a different connected or configured name. It allows the intended CI Worker or local checks without an override; it neither creates a Worker nor proves live Access. Remaining Access team/audience values must still be configured.

## Cloudflare setup

1. In Workers & Pages, use **dev-dryfire** and enable Cloudflare Access for its `workers.dev` address through Settings → Domains & Routes. If necessary, create a placeholder Worker first; do not publish the full app as an unprotected static-assets Worker.
2. In Zero Trust → Access → Applications, select that host's application. Configure an Allow policy including only `matosaru@gmail.com`; email one-time PIN is sufficient. Remove broad allow/bypass rules and cover all paths. Keep other public Workers independent.
3. Copy the Zero Trust **team domain** (`<team>.cloudflareaccess.com`, without a path/protocol) and the application's **Audience (AUD) tag** into `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` in both the dedicated config and dev default `wrangler.jsonc`, keeping them identical for `verify:profile`. These identifiers are not API secrets. Host/allowed email are already specified. Empty values deliberately fail closed.
4. Supply Cloudflare deployment credentials through secure environment/secret settings; never put an API token in Git or chat. Use a scoped token for the intended account/Worker and Access configuration rather than a global API key. The managed workspace currently has no configured Cloudflare credentials or outbound identity. No live policy/deployment is claimed.

Cloudflare Git Builds can deploy using its own configured repository integration, without an API token in this workspace. On dev, set its build command to `npm run build` (or explicit `npm run build:preview`) and deploy command to `npm run deploy:private-preview`, selecting only reviewed/CI-passed source. This is an alternative to direct CLI deployment, not an activated integration. It does not supply the missing Access identifiers.

If the Cloudflare log says `Executing user deploy command: npx wrangler preview` followed by a missing `previews` block, the Full Vite build has succeeded but the deploy command targets a separate preview system. For this stable private host, change Git Builds to **build `npm run build:preview` and deploy `npm run deploy:private-preview`**. Do not add preview resource bindings or enable alternate URLs to silence that error; the asset gate deliberately accepts only the configured private hostname. A failed deployment leaves the previous release live, which can show older Settings/navigation or a public build. Configure the Access team domain/audience as above before expecting authenticated assets to work.

Keep Access enabled when deploying updates. For this Worker, Cloudflare Git Builds must use the explicit private build/deploy commands below; do not use the public Wrangler config. Release only CI-passed dev source for Full preview; Free production uses b → main PRs. Cloudflare dashboard configuration and GitHub environment protections must be verified on the server; prepared files do not activate them.

## Build, dry run and deployment

```bash
npm ci
npm run build:preview
npm run verify:dist -- --edition=preview
npm run private-preview:check
# With configured Access identifiers, secure credentials and reviewed CI:
npm run deploy:private-preview
```

The private build starts in Full mode (CHG-038), exposing five-gun creation, new custom drills and advanced charts. Settings → **Test as** → **Free** simulates the actual two-gun public rules without deleting existing data. Either explicit choice is remembered; an existing stored Free choice remains Free until you select Full. The selected simulation is remembered only on the private origin and is excluded from backups and payment entitlements. Switching is blocked during active work/confirmation/pending results. Public artifacts omit both the selector and override implementation. Different origins have separate browser libraries; use a compatible manual backup to seed preview, not an implied cloud synchronization.

## Verify the actual host before calling it live

- Fresh anonymous/private browsing: `/`, `/edition.json`, `/sw.js` and an actual JS/CSS asset require Access login; none returns the full asset. HTTP uses HTTPS. Alternate deployment/alias URLs do not expose files.
- Allowlisted email: login, load HTML and every module, confirm preview metadata, toggle Free/Full and check saved data survives refresh. Confirm an unrelated email is denied and expired/invalid authentication cannot fetch assets.
- Use the Network response headers to verify private/no-store/noindex; the preview has no persistent app-shell service worker. Exported backup and IndexedDB survive reload and mode changes. Public URLs still serve the public edition and its offline cache.
- Record the tested source/deployment revision, anonymous/authorized/denied outcomes and device checks in the delivery tracker. Node/synthetic/browser tests do not establish live Access or real microphone accuracy.

If this hostname previously hosted an unprotected cached app, export a backup and retire only its app-shell worker/cache before verification. An old already-installed service worker may intercept navigation before a new authenticated request; do not clear IndexedDB or all website data as a routine upgrade. On that origin, browser developer tools can unregister `/sw.js` and delete Cache Storage names starting `dryfire-sound-trainer-`, then reload through Access. New preview source performs that retirement when loaded successfully.

## Diagnose a dev page that looks public or lacks the shared header

Current dev source uses the common branded header on every screen, including Settings, and contains the private Test as control. If the live Settings page has no header or test control, check the deployed commit/build rather than changing the gun limit. In browser Network, `/edition.json` must identify `edition: "preview"` and the expected dev `sourceRevision`; public output identifies `"public"`. The served HTML uses `data-build-edition="preview"`. A remembered Free simulation changes feature availability, not that build identity or the shared header.

Confirm Cloudflare Git Builds uses branch dev and `npm run build` (or `npm run build:preview`), with no `APP_EDITION=public` override or `--mode public`. Deploy with the private config/command and the configured Access gate. Check a fresh authorized tab after a successful deployment. If an older public shell intercepts this origin, export a backup and retire only its app-shell cache/worker as described above; keep IndexedDB. A failed deploy leaves the older live release. Repository CI cannot establish which release is served.
