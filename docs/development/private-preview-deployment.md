# Authenticated private preview deployment

CHG-035 / CHG-036 / CHG-038 / CHG-040 · updated 2026-10-14. Requested host: **https://dev-dryfire.matosaru.workers.dev**. Allowed tester: **matosaru@gmail.com**. The owner’s screenshot confirms a named **dev Preview inside parent Worker dryfire**. CHG-040 supersedes the earlier separate-Worker recommendation. No separate dev-dryfire Worker is required.

## Connect Git Builds to the correct Worker

Keep the existing **dryfire** Worker with production branch **main**. Its named Previews track **b** and **dev** independently. Cloudflare supplies `WRANGLER_CI_OVERRIDE_NAME=dryfire` because that is the parent Worker. `dev-dryfire` in the URL is the Preview name plus parent name, not a separate Worker identity.

| Parent Worker / target | Tracking branch | Build command | Deployment or Preview command |
| --- | --- | --- | --- |
| dryfire / production | main | `npm run build` | `npm run deploy:production` |
| dryfire / named b Preview | b | `npm run build` | Existing `npx wrangler preview` (branch b) |
| dryfire / named dev Preview | dev | `npm run build:preview` | `npm run deploy:private-preview` |

Leave the screenshot’s dev tracking branch and commands in place. After the updated dev source is available, the private npm script invokes **`wrangler preview --config wrangler.private-preview.jsonc --name dev`**, selecting the existing dev Preview explicitly. The previous script invoked `wrangler deploy`, which attempted parent production deployment and produced the name mismatch. Do not set the parent production branch to dev or use a production deploy command for Full output.

[Both private configs](../../wrangler.private-preview.jsonc) now name parent dryfire. Default dev [wrangler.jsonc](../../wrangler.jsonc) matches the dedicated private configuration; b/main retain public routing. Authentication variables belong in **`previews.vars`**. Wrangler’s Preview API reads that scope, not top-level production `vars`. Assets, Worker entry and compatibility remain top-level. The target preflight accepts the local or connected parent dryfire, rejects another parent and verifies the signed asset gate and fixed host/tester. The restricted command runner accepts only publication or local check; no forwarded Worker/name/command overrides.

## Authentication boundary

Every asset runs through [the Access token gate](../../workers/privatePreview.js), including HTML, JS, CSS, worklets and edition metadata. It verifies RSA signature against the team’s Access JWKS, issuer, application audience, expiry and the approved email before calling ASSETS. Only dev-dryfire.matosaru.workers.dev is accepted; generated deployment aliases, public/custom-domain aliases and unrelated identities cannot retrieve Full assets. `preview_urls: false` disables ordinary version-preview URLs; the intentional named dev Preview remains the selected target. Named-preview deployment modifies the Preview, not the production version.

Missing team/audience configuration returns 503 without serving assets. Anonymous/invalid tokens are denied. Responses use `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow, noarchive`. The private app retires its origin’s old shell cache/service worker and does not install an offline app shell. IndexedDB, manual backup recovery and the remembered test-mode preference remain intact. Public offline functionality stays intact. Access cannot retract files already downloaded by an authorized tester; the public repository is not exclusive code.

## Owner-managed Cloudflare setup

1. Use the existing parent dryfire Worker’s **dev Preview**, with the tracking branch/build/Preview commands above. Keep main production and b public Preview unchanged.
2. Protect the exact host **dev-dryfire.matosaru.workers.dev** in Zero Trust → Access → Applications, covering all paths. If the Preview’s Domains & Routes UI offers Access protection, use that; verify the resulting application covers this Preview hostname rather than assuming parent-host protection covers it. Configure an Allow policy for only **matosaru@gmail.com** (email one-time PIN is sufficient), with no broad allow/bypass rules. Confirm the policy actually challenges this named Preview URL.
3. Set the Access **team domain** (`<team>.cloudflareaccess.com`, without protocol/path) and application **Audience (AUD) tag** in `previews.vars.ACCESS_TEAM_DOMAIN` / `ACCESS_AUD` in both private configs, keeping them identical for `verify:profile`. These are non-secret identifiers; blank values deliberately fail closed. Host/email are already set. The screenshot’s empty **Build variables and secrets** list concerns the build process and does not establish runtime Preview Access configuration. Top-level production vars cannot substitute for Preview vars. The explicit config values are submitted on each deployment.
4. Keep Cloudflare deployment authentication in the configured Git Builds integration or secure CLI settings; never put API tokens in Git/chat. No credentials, Worker setup, Access policy or live deployment are changed by this code delivery. The workspace has no configured Cloudflare credentials.

If this Workers account cannot attach Access to the exact named Preview hostname, keep the signed gate fail closed and use an Access-capable private hostname deliberately configured and reviewed before changing the fixed host. Do not remove authentication to make the Preview load.

## Build, local packaging check and owner deployment

```bash
npm ci
npm run build:preview
npm run verify:dist -- --edition=preview
npm run private-preview:check
# Owner only, after configuring Access and selecting reviewed/CI-passed source:
npm run deploy:private-preview
```

Pinned Wrangler **4.149.0** provides no `wrangler preview --dry-run`. The local check uses `wrangler deploy --config wrangler.private-preview.jsonc --dry-run` **only to bundle the gate without uploading**. It verifies the private target/configuration and optimized artifact; it does not exercise the Preview API or prove live Access. Never omit `--dry-run` from this packaging command. The publishing script uses the actual named-Preview command. `deploy:check` on dev uses the same non-publishing runner with the default artifact/profile checks.

The private app defaults to Full, exposing five-gun creation, new custom drills and charts. Settings → **Test as** → **Free** simulates the real two-gun/no-new-custom/no-graphs rules without deleting saved data. Either explicit choice is remembered only on this private origin, excluded from backups/payment entitlements; switching is blocked during capture, safety confirmation and pending results. Public artifacts omit the test selector/override. Different origins retain separate IndexedDB libraries; use compatible export/import to seed Preview, not implied cloud sync.

## Verify the actual host before calling it live

- Fresh anonymous/private browsing: `/`, `/edition.json`, `/sw.js` and actual JS/CSS assets require Access; none returns Full assets. Confirm the public production and b Preview still expose only Free output.
- Allowlisted login: load every module, confirm preview edition/source revision, switch Free/Full and refresh while preserving data. An unrelated email and invalid/expired tokens cannot fetch assets.
- Verify private/no-store/noindex response headers, no persistent Preview app-shell worker and rejection of alternate Preview/deployment/custom-domain URLs. Record actual URLs/statuses rather than assuming a config flag protects aliases.
- Record source/deployment revision, anonymous/authorized/denied outcomes and physical-device checks in [delivery history](../project/implementation-history.md). CI/package checks do not prove Cloudflare deployment or microphone accuracy.

If this origin previously hosted a public cached shell, export a backup and retire only its app-shell worker/cache. Browser developer tools can unregister `/sw.js` and delete Cache Storage names starting `dryfire-sound-trainer-`; retain IndexedDB and reload through Access. Do not clear all website data. New private source performs shell retirement after authorized loading.

## Diagnose a dev page that looks public or lacks the shared header

Current dev source contains the common header on every screen, including Settings, and the private Test as control. In Network, `/edition.json` must identify `edition: "preview"` and the expected dev `sourceRevision`; served HTML has `data-build-edition="preview"`. A remembered Free simulation changes availability, not edition identity/header. Confirm tracking branch dev, the commands above and no public-edition build override. A failed Preview deploy leaves older code live; source CI cannot establish the currently served release.
