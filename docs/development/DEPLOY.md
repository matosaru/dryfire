# Deploy v0.8.0 from GitHub (works on an iPhone)

The repository holds **editable source**. Only `dist/` is deployed as the minified website.

## Registered custom domains

The user reports `easydryfire.com` and `easydryfire.app` are registered on Cloudflare (2026-10-11). The current documented app origin remains `https://dryfire.matosaru.workers.dev/`; no custom-domain binding has been verified or changed by the copyright update.

To serve the existing Worker, use Cloudflare **Workers & Pages → dryfire → Settings → Domains & Routes → Add → Custom Domain**, add the desired domain(s), and wait for Cloudflare's DNS/TLS setup to become active. Domain registration alone does not route traffic to the app. Choose a primary public app origin before updating canonical SEO/manifest information or adding redirects. Preserve the `workers.dev` address during migration so existing users can export their backups: IndexedDB belongs to its origin, and a new domain needs an explicit backup import to access that saved library. Deploying new code at the same origin preserves it.

## Development and production branches

CHG-024: publish new changes to `dev` first and run CI there. `main` remains the production branch; merge/promote only when explicitly requested. If enabling Cloudflare development previews, use the non-production preview command below and verify the build is for `dev`; do not change the production branch to `dev`. A dev preview uses a separate origin/library and cannot verify production deployment.

## Cloudflare Workers Builds (matches your existing build logs)

1. Use the connected GitHub repository `matosaru/dryfire`, production branch `main`. Select the latest implementation commit in [implementation history](../project/implementation-history.md); a successful production build must include that commit or a descendant. The older `6119b8f` contains timed sequences/settings but predates the six practice modes.
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

The current service-worker cache version is `dryfire-sound-trainer-v21`; the technical cache-name prefix remains unchanged. Active practice displays STOP with the microphone level below it. After deployment, reload the page to fetch the update. If an older screen remains visible, close and reopen the Home Screen app after the updated service worker activates. Learned samples, recognition history and saved session results remain in IndexedDB unless explicitly replaced/reset or browser site data is deleted. Do not clear site data to refresh the app.

## Verify the current production build

In Cloudflare dashboard → Workers & Pages → `dryfire` → Builds, open the newest **production** build for `main`. Check its commit against the published implementation in [implementation history](../project/implementation-history.md), and verify that both the build and deployment completed successfully. A passing GitHub Test and build run checks the repository; it does not confirm Cloudflare publication. Retrying an older build is not evidence that the latest source was deployed.

The supplied October 9 log used app version 0.7.0 and failed while Wrangler parsed `vite.config.js`. The repository gained its static-assets `wrangler.jsonc` configuration on October 10 in [`ee2d4b6`](https://github.com/matosaru/dryfire/commit/ee2d4b6), followed by preview support in [`c7ecc50`](https://github.com/matosaru/dryfire/commit/c7ecc50). The user confirmed that log was from an old deployment. It is not evidence of a failure in the current release. If a new production build fails, use its timestamp, commit and first error to diagnose that build.

The current source release includes gun editing/deletion, illustrated gun-type selectors, separate history/session clearing and the clarified Settings resets. Cache v21 includes the microphone-start correction and narrow History layout update; it is supporting evidence of the updated web assets, but the successful Cloudflare production build and its commit are the deployment evidence. Package version 0.8.0 is shared by several releases and cannot identify the latest change on its own.

If JavaScript/CSS in a browser Network response appears unminified, use the [response comparison checklist](MINIFICATION.md). It lists the locally verified asset filenames/body hashes and distinguishes response bytes, display wrapping and transport compression. The exact deployed URL/body must be checked before attributing the difference to DevTools or an older deployment.

The timed-session update upgrades the same IndexedDB database to schema 3 and adds separate saved sessions. Trigger-first practice reuses schema 3; its whole-library backup format is version 4, accepting compatible versions 1–3. The previous gun-profile migration still asks for details only when compatible legacy data has no completed gun name/type. A fresh installation asks for the first gun. Check [implementation history](../project/implementation-history.md) for current validation/push/deployment status; a code update in GitHub does not itself establish a successful production deployment.

Training sounds: separate short illustrative waveform GIFs, not firearm-handling tutorials. With iPhone Reduce Motion enabled, the app displays static frames instead.
