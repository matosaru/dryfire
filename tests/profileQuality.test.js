import { assessTriggerProfile, renderTriggerProfile } from '../src/profileQuality.js';

const row = features => ({ label: 'trigger', features });

test('trigger profile needs the required minimum before making a consistency claim', () => {
  expect(assessTriggerProfile([])).toMatchObject({ status: 'needs-samples', sampleCount: 0, needed: 3 });
  expect(assessTriggerProfile([row([1, 2]), row([1, 2])])).toMatchObject({ status: 'needs-samples', needed: 1 });
});

test('consistent trigger examples produce stable guidance', () => {
  const result = assessTriggerProfile([row([1, 2, 3]), row([1.01, 2.01, 2.99]), row([.99, 1.99, 3.01]), row([1.02, 2, 3])]);
  expect(result).toMatchObject({ status: 'stable', sampleCount: 4 });
  expect(result.message).toMatch(/consistent/i);
});

test('one very different trigger example is identified without being deleted', () => {
  const result = assessTriggerProfile([row([1, 2]), row([1.01, 2.01]), row([.99, 1.99]), row([8, -4])]);
  expect(result.status).toBe('variable');
  expect(result.outlierIndexes).toEqual([3]);
  expect(result.message).toMatch(/reset and rerecord/i);
});

test('other labels and incompatible vectors do not affect trigger quality', () => {
  const result = assessTriggerProfile([row([1, 2]), row([1, 2]), row([1, 2]), { label: 'rack', features: [99, 99] }, row([1])]);
  expect(result).toMatchObject({ status: 'stable', sampleCount: 3 });
});

test('native Learn guidance uses the same assessed profile', () => {
  const nodes=Object.fromEntries(['triggerProfileStatus','triggerProfileSymbol','triggerProfileTitle','triggerProfileMessage'].map(id=>[id,{className:'',textContent:''}]));
  renderTriggerProfile([row([1,2]),row([1,2]),row([1,2])],{querySelector:selector=>nodes[selector.slice(1)]});
  expect(nodes.triggerProfileStatus.className).toBe('trigger-profile-status is-stable');
  expect(nodes.triggerProfileSymbol.textContent).toBe('✓');
  expect(nodes.triggerProfileTitle.textContent).toBe('Stable profile');
});
