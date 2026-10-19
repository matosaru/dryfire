/** @jest-environment jsdom */
import { createPreviewTesting, PREVIEW_MODE_KEY } from '../src/optional/previewTesting.js';

function controls() {
  document.body.innerHTML = '<select id="previewTestMode"><option value="free">Free</option><option value="full">Full</option></select><p id="previewModeBadge"></p><p id="previewModeStatus"></p>';
  return document.getElementById('previewTestMode');
}
function setup() {
  let locked = false;
  const changes = [], messages = [], writes = [];
  const controller = createPreviewTesting({ doc: document, storage: { getItem: () => 'full', setItem: (...args) => writes.push(args) }, locked: () => locked, onChange: value => changes.push(value), onMessage: message => messages.push(message) });
  return { controller, changes, messages, writes, lock: () => { locked = true; } };
}
function select(control, value) { control.value = value; control.dispatchEvent(new Event('change')); }

test('replacement controls retain simulation state and rebind exactly once', () => {
  const previous = controls(); const state = setup();
  const current = controls(); state.controller.render(); state.controller.render();
  expect(current.value).toBe('full');
  select(current, 'free');
  expect(state.controller.capabilities.gunCreationLimit).toBe(2);
  expect(state.changes).toHaveLength(1);
  expect(state.writes).toEqual([[PREVIEW_MODE_KEY, 'free']]);
  select(previous, 'full');
  expect(state.changes).toHaveLength(1);
  expect(state.controller.capabilities.gunCreationLimit).toBe(2);
});

test('rebound controls preserve lock rejection and restore the displayed mode', () => {
  controls(); const state = setup(); const current = controls(); state.lock(); state.controller.render();
  expect(current.disabled).toBe(true);
  select(current, 'free');
  expect(current.value).toBe('full');
  expect(state.changes).toHaveLength(0); expect(state.writes).toHaveLength(0); expect(state.messages).toHaveLength(1);
  expect(document.getElementById('previewModeStatus').textContent).toMatch(/Finish active work/);
});
