# Deploy v0.8.0 from GitHub (works on an iPhone)

The repository holds **editable source**. Only `dist/` is deployed as the minified website.

## Cloudflare Workers Builds (matches your existing build logs)

1. Use the connected GitHub repository `matosaru/dryfire`, production branch `main`. Select the latest implementation commit in [implementation history](../implementation-history.md); a successful production build must include that commit or a descendant. The older `6119b8f` contains timed sequences/settings but predates the six practice modes.
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

Use the [iPhone release checklist](IPHONE_RELEASE_CHECKS.md) to record the production commit and test Safari/Home Screen sessions, settings and retained data. Its current results distinguish completed local checks from unverified production/device checks.

The updated service-worker cache version is `dryfire-sound-trainer-v14`; the technical cache-name prefix remains unchanged. Active practice displays STOP with the microphone level below it. After deployment, reload the page to fetch the update. If an older screen remains visible, close and reopen the Home Screen app after the updated service worker activates. Learned samples, recognition history and saved session results remain in IndexedDB unless explicitly replaced/reset or browser site data is deleted. Do not clear site data to refresh the app.

The timed-session update upgrades the same IndexedDB database to schema 3 and adds separate saved sessions. Trigger-first practice reuses schema 3; its whole-library backup format is version 4, accepting compatible versions 1–3. The previous gun-profile migration still asks for details only when compatible legacy data has no completed gun name/type. A fresh installation asks for the first gun. Check [implementation history](../implementation-history.md) for current validation/push/deployment status; a code update in GitHub does not itself establish a successful production deployment.

Training sounds: separate short illustrative waveform GIFs, not firearm-handling tutorials. With iPhone Reduce Motion enabled, the app displays static frames instead.
