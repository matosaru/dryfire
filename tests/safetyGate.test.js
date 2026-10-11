import { createSafetyGate } from '../src/safetyGate.js';
function setup() {
  const control = () => Object.assign(new EventTarget(), { checked: false, disabled: false, focus() {} });
  const dialog = control(); dialog.showModal = () => { dialog.open = true; }; dialog.close = () => { dialog.open = false; dialog.dispatchEvent(new Event('close')); };
  const checkbox = control(), confirmButton = control(), cancelButton = control();
  let confirmed = false, owner = 'gun-a'; const actions = [];
  const gate = createSafetyGate({ dialog, checkbox, confirmButton, cancelButton, isConfirmed: () => confirmed,
    confirmState: () => { confirmed = true; }, identity: () => owner, onError: error => { throw error; } });
  return { gate, dialog, checkbox, confirmButton, cancelButton, actions, changeOwner: () => { owner = 'gun-b'; } };
}
test('capture waits for explicit confirmation, proceeds once, then reuses page-session acknowledgement', async () => {
  const s = setup(); const action = () => s.actions.push('capture');
  expect(s.gate.ensure(action)).toBe(false); expect(s.dialog.open).toBe(true); expect(s.actions).toEqual([]);
  s.confirmButton.dispatchEvent(new Event('click')); expect(s.actions).toEqual([]);
  s.checkbox.checked = true; s.checkbox.dispatchEvent(new Event('change'));
  s.confirmButton.dispatchEvent(new Event('click')); s.confirmButton.dispatchEvent(new Event('click'));
  await Promise.resolve(); expect(s.actions).toEqual(['capture']); expect(s.dialog.open).toBe(false);
  expect(s.gate.ensure(action)).toBe(true);
});
test.each(['cancel', 'owner'])('%s prevents a stale pending capture action', async type => {
  const s = setup(); s.gate.ensure(() => s.actions.push('capture'));
  if (type === 'cancel') s.cancelButton.dispatchEvent(new Event('click')); else s.changeOwner();
  s.checkbox.checked = true; s.confirmButton.dispatchEvent(new Event('click')); await Promise.resolve();
  expect(s.actions).toEqual([]);
  expect(s.gate.ensure(() => {})).toBe(false);
});
