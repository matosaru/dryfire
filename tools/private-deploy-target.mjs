export const PREVIEW_PARENT_WORKER = 'dryfire';
export const PRIVATE_PREVIEW_NAME = 'dev';
export const PRIVATE_PREVIEW_HOSTNAME = 'dev-dryfire.matosaru.workers.dev';

export function validatePrivateDeployTarget({ config, ciOverrideName } = {}) {
  if (config?.name !== PREVIEW_PARENT_WORKER) {
    throw new Error(`Named dev Preview requires parent Worker ${PREVIEW_PARENT_WORKER}, not ${JSON.stringify(config?.name)}.`);
  }
  if (ciOverrideName !== undefined && ciOverrideName !== PREVIEW_PARENT_WORKER) {
    throw new Error(`Cloudflare attached this build to ${JSON.stringify(ciOverrideName)}; expected parent Worker ${PREVIEW_PARENT_WORKER} with named Preview ${PRIVATE_PREVIEW_NAME}. Keep production on main and dev as a Preview; do not clear Cloudflare's target override.`);
  }
  if (config.main !== 'workers/privatePreview.js' || config.assets?.binding !== 'ASSETS' || config.assets?.run_worker_first !== true) {
    throw new Error('Private Preview requires the signed asset gate before every asset.');
  }
  if (!config.previews?.vars) {
    throw new Error('Private Preview requires authentication settings under previews.vars. Production vars do not supply Preview bindings.');
  }
  if (config.previews.vars.ACCESS_HOSTNAME !== PRIVATE_PREVIEW_HOSTNAME) {
    throw new Error(`Private Preview hostname must remain ${PRIVATE_PREVIEW_HOSTNAME}.`);
  }
  if (config.previews.vars.ACCESS_ALLOWED_EMAILS !== 'matosaru@gmail.com') {
    throw new Error('Private Preview requires the approved tester allowlist matosaru@gmail.com.');
  }
}

export function privatePreviewCommand({ check = false } = {}) {
  // Wrangler 4.149.0 has no `preview --dry-run`. Check only bundles locally;
  // publishing always uses the Preview API, never the parent production API.
  return check
    ? ['deploy', '--config', 'wrangler.private-preview.jsonc', '--dry-run']
    : ['preview', '--config', 'wrangler.private-preview.jsonc', '--name', PRIVATE_PREVIEW_NAME];
}
