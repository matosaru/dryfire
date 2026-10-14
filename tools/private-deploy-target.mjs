export const PRIVATE_WORKER_NAME = 'dev-dryfire';

export function validatePrivateDeployTarget({ configuredName, ciOverrideName } = {}) {
  if (configuredName !== PRIVATE_WORKER_NAME) {
    throw new Error(`Private preview must target ${PRIVATE_WORKER_NAME}, not ${JSON.stringify(configuredName)}. Keep the private config separate from public production.`);
  }
  if (ciOverrideName !== undefined && ciOverrideName !== PRIVATE_WORKER_NAME) {
    throw new Error(`Cloudflare attached this build to Worker ${JSON.stringify(ciOverrideName)}, but private preview requires ${PRIVATE_WORKER_NAME}. Connect repository matosaru/dryfire to Worker ${PRIVATE_WORKER_NAME} with production branch dev. Keep Worker dryfire on main/public previews; do not rename the private config or clear Cloudflare's target override.`);
  }
}
