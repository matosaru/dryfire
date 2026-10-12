import { resolveBuildEdition, validateBranchProfile } from '../tools/build-profile.mjs';

test.each(['public', 'preview'])('normal builds follow the committed %s profile', defaultEdition => {
  expect(resolveBuildEdition({ defaultEdition })).toBe(defaultEdition);
});
test.each([
  ['public', 'full-preview', 'preview'],
  ['preview', 'public', 'public'],
])('explicit modes override the %s profile', (defaultEdition, mode, expected) => {
  expect(resolveBuildEdition({ defaultEdition, mode })).toBe(expected);
});
test('an explicit edition overrides the mode and branch default', () => {
  expect(resolveBuildEdition({ defaultEdition: 'preview', mode: 'full-preview', explicit: 'public' })).toBe('public');
});
test.each(['', 'full', null, 'PUBLIC'])('invalid edition %s fails closed', invalid => {
  expect(() => resolveBuildEdition({ defaultEdition: invalid })).toThrow('Unknown build edition');
  expect(() => resolveBuildEdition({ defaultEdition: 'public', explicit: invalid })).toThrow('Unknown build edition');
});
test('an invalid committed default cannot be hidden by an override', () => {
  expect(() => resolveBuildEdition({ defaultEdition: 'full', explicit: 'public' })).toThrow('Unknown build edition');
});
test('b and main reject a Full profile while dev requires Full', () => {
  for (const branch of ['b', 'main']) {
    expect(() => validateBranchProfile(branch, 'public')).not.toThrow();
    expect(() => validateBranchProfile(branch, 'preview')).toThrow('requires public');
  }
  expect(() => validateBranchProfile('dev', 'preview')).not.toThrow();
  expect(() => validateBranchProfile('dev', 'public')).toThrow('requires preview');
});
test('detached local reviews allow either valid profile', () => {
  expect(() => validateBranchProfile('', 'preview')).not.toThrow();
  expect(() => validateBranchProfile('', 'invalid')).toThrow('Unknown build edition');
});
