import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { validatePrivateDeployTarget, privatePreviewCommand } from '../tools/private-deploy-target.mjs';

const config = () => ({ name: 'dryfire', main: 'workers/privatePreview.js', assets: { binding: 'ASSETS', run_worker_first: true },
  previews: { vars: { ACCESS_HOSTNAME: 'dev-dryfire.matosaru.workers.dev', ACCESS_ALLOWED_EMAILS: 'matosaru@gmail.com', ACCESS_TEAM_DOMAIN: '', ACCESS_AUD: '' } } });

test.each([undefined, 'dryfire'])('the local or parent-Worker CI target %s permits named dev preview', ciOverrideName => {
  expect(() => validatePrivateDeployTarget({ config: config(), ciOverrideName })).not.toThrow();
});
test.each(['dev-dryfire', 'dryfire-dev', 'other', '', ' dryfire'])('an unexpected connected Worker %s is blocked', ciOverrideName => {
  expect(() => validatePrivateDeployTarget({ config: config(), ciOverrideName })).toThrow('parent Worker');
});
test.each(['dev-dryfire', 'dryfire-dev', '', undefined])('an invalid configured parent name %s is blocked', name => {
  expect(() => validatePrivateDeployTarget({ config: { ...config(), name } })).toThrow('parent Worker');
});
test.each([{}, { vars: {} }, undefined])('missing Preview-scoped authentication settings are blocked', previews => {
  expect(() => validatePrivateDeployTarget({ config: { ...config(), previews } })).toThrow('Preview');
});
test('production vars cannot substitute for Preview-scoped vars', () => {
  const invalid = config();
  invalid.vars = invalid.previews.vars;
  delete invalid.previews;
  expect(() => validatePrivateDeployTarget({ config: invalid })).toThrow('Preview');
});
test.each(['dryfire.matosaru.workers.dev', 'b-dryfire.matosaru.workers.dev', ''])('the private gate cannot point at hostname %s', ACCESS_HOSTNAME => {
  const invalid = config();
  invalid.previews.vars.ACCESS_HOSTNAME = ACCESS_HOSTNAME;
  expect(() => validatePrivateDeployTarget({ config: invalid })).toThrow('hostname');
});
test.each(['', '*', 'other@example.com', undefined])('the fixed private tester allowlist cannot become %s', ACCESS_ALLOWED_EMAILS => {
  const invalid = config();
  invalid.previews.vars.ACCESS_ALLOWED_EMAILS = ACCESS_ALLOWED_EMAILS;
  expect(() => validatePrivateDeployTarget({ config: invalid })).toThrow('allowlist');
});
test.each([{ main: undefined }, { main: 'public/index.html' }, { assets: { binding: 'ASSETS' } }, { assets: { run_worker_first: true } }])('authentication cannot be bypassed by asset routing %j', patch => {
  expect(() => validatePrivateDeployTarget({ config: { ...config(), ...patch } })).toThrow('asset gate');
});
test('the publishing command always updates named dev Preview rather than parent production', () => {
  expect(privatePreviewCommand()).toEqual(['preview', '--config', 'wrangler.private-preview.jsonc', '--name', 'dev']);
});
test('the local packaging check always includes dry-run and cannot publish', () => {
  expect(privatePreviewCommand({ check: true })).toEqual(['deploy', '--config', 'wrangler.private-preview.jsonc', '--dry-run']);
});
test.each(['wrangler.jsonc', 'wrangler.private-preview.jsonc'])('the committed %s routes a Preview through authentication', path => {
  expect(() => validatePrivateDeployTarget({ config: JSON.parse(readFileSync(path, 'utf8')), ciOverrideName: 'dryfire' })).not.toThrow();
});
test('deploy scripts use the restricted runner; callers cannot append a production command', () => {
  const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts;
  expect(scripts['deploy:private-preview']).toContain('node tools/run-private-preview.mjs');
  expect(scripts['deploy:private-preview']).not.toMatch(/wrangler deploy/);
  const result = spawnSync(process.execPath, ['tools/run-private-preview.mjs', '--worker-name', 'other'], { encoding: 'utf8' });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Unsupported');
});
