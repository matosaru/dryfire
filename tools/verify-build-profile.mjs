import { readFileSync } from 'node:fs';
import { readBuildProfile, validateBranchProfile } from './build-profile.mjs';

const edition = readBuildProfile();
const branch = process.argv.find(arg => arg.startsWith('--branch='))?.slice('--branch='.length)
  ?? (process.env.CI ? process.env.GITHUB_BASE_REF || process.env.GITHUB_REF_NAME : '');
validateBranchProfile(branch, edition);
const configuration = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url)));
const template = edition === 'preview' ? 'wrangler.private-preview.jsonc' : 'wrangler.public.jsonc';
if (JSON.stringify(configuration('wrangler.jsonc')) !== JSON.stringify(configuration(template))) {
  throw new Error(`Default Wrangler routing must match ${template} for ${edition}.`);
}
console.log(`Build profile verified: ${branch || 'local'} / ${edition}, matching default Worker routing.`);
