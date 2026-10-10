# Deploy v0.8.0 from GitHub (works on an iPhone)

The repository holds **editable source**. Only `dist/` is deployed as the minified website.

## Cloudflare Workers Builds (matches your existing build logs)

1. Extract `dryfire-source-v0.8.0.zip` and update the contents of the GitHub repository `matosaru/dryfire` (do not upload the ZIP itself as a project file).
2. In Cloudflare dashboard → Workers & Pages → `dryfire` → Settings → Build, use:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Repository root as working directory; production branch `main`.
   - Preview/non-production deploy command: `npx wrangler preview`. This requires the top-level `"previews": {}` block included in `wrangler.jsonc`.
3. The included `wrangler.jsonc` sets the worker name, compatibility date and static asset path `./dist`.
4. Deploy and open the resulting `workers.dev` HTTPS URL in iPhone Safari. Allow microphone access; then Share → Add to Home Screen.

If using **Cloudflare Pages** instead of Workers Builds: set Build command `npm run build`, output directory `dist`, and do not specify a Worker deploy command. A Pages project normally publishes the output automatically. Do not mix Workers Builds commands with Pages settings.

## Netlify

Connect GitHub `matosaru/dryfire`. Build command: `npm run build`; publish directory: `dist`. The included `netlify.toml` sets Node 22.

## Testing locally

`npm install && npm run test:smoke && npm test && npm run build && npm run verify:dist`

## After updating the hosted app

The updated service-worker cache version is `dryfire-sound-trainer-v11`; the technical cache-name prefix remains unchanged. After deployment, reload the page to fetch the update. If an older screen remains visible, close and reopen the Home Screen app after the updated service worker activates. Learned samples and saved event history remain in IndexedDB unless you manually reset them or delete browser site data. Do not clear site data to refresh the app.

The current gun-profile update upgrades the existing IndexedDB database to schema 2 without changing its name. An existing learned model/history first prompts for its gun name and type; supplying those details keeps the migrated records. A fresh installation asks for the first gun. Check [implementation history](../implementation-history.md) for the current validation/push/deployment status; a code update in GitHub does not itself establish a successful production deployment.

Training sounds: separate short illustrative waveform GIFs, not firearm-handling tutorials. With iPhone Reduce Motion enabled, the app displays static frames instead.
