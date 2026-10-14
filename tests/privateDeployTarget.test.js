import { validatePrivateDeployTarget } from '../tools/private-deploy-target.mjs';

test('the private Worker may be checked locally without a Cloudflare override', () => {
  expect(() => validatePrivateDeployTarget({ configuredName: 'dev-dryfire' })).not.toThrow();
});
test('a Cloudflare build attached to the intended private Worker passes', () => {
  expect(() => validatePrivateDeployTarget({ configuredName: 'dev-dryfire', ciOverrideName: 'dev-dryfire' })).not.toThrow();
});
test.each(['dryfire', 'dryfire-dev', 'other', '', ' dev-dryfire'])('a connected Worker %s cannot redirect a private deployment', ciOverrideName => {
  expect(() => validatePrivateDeployTarget({ configuredName: 'dev-dryfire', ciOverrideName })).toThrow('Connect');
});
test.each(['dryfire', 'dryfire-dev', '', undefined])('a changed or missing private config name %s is rejected independently of CI', configuredName => {
  expect(() => validatePrivateDeployTarget({ configuredName })).toThrow('dev-dryfire');
});
test('renaming both the private config and CI target to production cannot bypass the private target check', () => {
  expect(() => validatePrivateDeployTarget({ configuredName: 'dryfire', ciOverrideName: 'dryfire' })).toThrow('dev-dryfire');
});
