import { readFileSync } from 'node:fs';
import { validatePrivateDeployTarget, PREVIEW_PARENT_WORKER, PRIVATE_PREVIEW_NAME } from './private-deploy-target.mjs';

try {
  const config = JSON.parse(readFileSync(new URL('../wrangler.private-preview.jsonc', import.meta.url), 'utf8'));
  validatePrivateDeployTarget({ config, ciOverrideName: process.env.WRANGLER_CI_OVERRIDE_NAME });
  console.log(`Private deployment target verified: parent ${PREVIEW_PARENT_WORKER}, named Preview ${PRIVATE_PREVIEW_NAME}.`);
} catch (error) {
  console.error(`Private deployment blocked: ${error.message}`);
  process.exitCode = 1;
}
