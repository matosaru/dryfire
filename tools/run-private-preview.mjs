import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { privatePreviewCommand, validatePrivateDeployTarget } from './private-deploy-target.mjs';

try {
  const options = process.argv.slice(2);
  if (options.length && (options.length !== 1 || options[0] !== '--check')) {
    throw new Error('Unsupported arguments: use no arguments to publish named dev Preview, or --check for local packaging only.');
  }
  const config = JSON.parse(readFileSync(new URL('../wrangler.private-preview.jsonc', import.meta.url), 'utf8'));
  validatePrivateDeployTarget({ config, ciOverrideName: process.env.WRANGLER_CI_OVERRIDE_NAME });
  execFileSync(process.execPath, [fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url)),
    ...privatePreviewCommand({ check: options[0] === '--check' })], { cwd: new URL('..', import.meta.url), stdio: 'inherit' });
} catch (error) {
  console.error(`Private Preview command failed: ${error.message}`);
  process.exitCode = typeof error.status === 'number' ? error.status : 1;
}
