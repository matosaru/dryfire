import { readFileSync } from 'node:fs';

const checkEdition = edition => {
  if (!['public', 'preview'].includes(edition)) throw new Error(`Unknown build edition: ${edition}`);
  return edition;
};

export function readBuildProfile() {
  return checkEdition(JSON.parse(readFileSync(new URL('../build-profile.json', import.meta.url))).edition);
}

export function resolveBuildEdition({ defaultEdition = 'public', explicit, mode } = {}) {
  checkEdition(defaultEdition);
  return checkEdition(explicit !== undefined ? explicit : mode === 'full-preview' ? 'preview' : mode === 'public' ? 'public' : defaultEdition);
}

export function validateBranchProfile(branch, edition) {
  checkEdition(edition);
  const required = { b: 'public', main: 'public', dev: 'preview' }[branch];
  if (required && required !== edition) throw new Error(`Branch ${branch} requires ${required}, got ${edition}. Preserve the destination branch profile when synchronizing.`);
}
