import { readFileSync } from 'node:fs';
import { validatePrivateDeployTarget, PRIVATE_WORKER_NAME } from './private-deploy-target.mjs';

try {
  const config = JSON.parse(readFileSync(new URL('../wrangler.private-preview.jsonc', import.meta.url), 'utf8'));
  validatePrivateDeployTarget({ configuredName: config.name, ciOverrideName: process.env.WRANGLER_CI_OVERRIDE_NAME });
  console.log(`Private deployment target verified: ${PRIVATE_WORKER_NAME}.`);
} catch (error) {
  console.error(`Private deployment blocked: ${error.message}`);
  process.exitCode = 1;
}
