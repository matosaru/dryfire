import { normalizeCustomDrill } from '../drills.js';
import { canSaveCustomDrill } from '../buildEdition.js';

export function createCustomDrillEditor({ doc, capabilities, getContext, locked, titleFor, setBusy, onSave, onMessage, onError }) {
  const $ = id => doc.getElementById(id);
  let editingId = null, steps = [];
  const permitted = () => canSaveCustomDrill(capabilities, editingId, getContext().customDrills);
  function render() {
    $('customDrillSteps').replaceChildren();
    steps.forEach((label, index) => {
      const item = doc.createElement('li'); item.className = 'custom-step';
      const name = doc.createElement('span'); name.className = 'custom-step-name'; name.textContent = `${index + 1}. ${titleFor(label)}`;
      const controls = doc.createElement('span'); controls.className = 'custom-step-controls';
      for (const [action, text, disabled] of [['up', '↑', index === 0], ['down', '↓', index === steps.length - 1], ['remove', '×', false]]) {
        const button = doc.createElement('button'); button.type = 'button'; button.textContent = text; button.disabled = disabled; button.dataset.stepAction = action;
        button.setAttribute('aria-label', `${action === 'remove' ? 'Remove' : 'Move ' + action} action ${index + 1}`);
        button.addEventListener('click', () => {
          if (locked() || !permitted()) return;
          if (action === 'remove') steps.splice(index, 1);
          else { const to = index + (action === 'up' ? -1 : 1); [steps[index], steps[to]] = [steps[to], steps[index]]; }
          render();
        });
        controls.append(button);
      }
      item.append(name, controls); $('customDrillSteps').append(item);
    });
    $('addCustomActionBtn').disabled = steps.length >= 32;
    $('saveCustomDrillBtn').disabled = steps.length === 0;
  }
  function open(drill = null) {
    const { activeGun, customDrills } = getContext();
    if (locked() || !activeGun || activeGun.needsDetails) return;
    if (!canSaveCustomDrill(capabilities, drill?.id, customDrills)) { onMessage('New custom drills are unavailable in this public version. Saved presets remain usable and editable.'); return; }
    editingId = drill?.id ?? null; steps = [...(drill?.steps ?? [])];
    $('customDrillName').value = drill?.title ?? '';
    $('customDrillEditorTitle').textContent = drill ? 'Edit drill' : 'Create a drill';
    $('customDrillForm').classList.remove('hidden'); render(); $('customDrillName').focus();
  }
  $('newCustomDrillBtn').addEventListener('click', () => open());
  $('addCustomActionBtn').addEventListener('click', () => {
    if (locked() || !permitted()) return;
    if (steps.length < 32) steps.push($('customAction').value); render();
  });
  $('cancelCustomDrillBtn').addEventListener('click', () => $('customDrillForm').classList.add('hidden'));
  $('customDrillForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (locked()) return;
    const { activeGun } = getContext();
    if (!activeGun || activeGun.needsDetails || !permitted()) { onMessage('New custom drills are unavailable in this public version.'); return; }
    setBusy(true);
    try {
      const drill = normalizeCustomDrill({ id: editingId || `custom-${crypto.randomUUID()}`, title: $('customDrillName').value, steps });
      await onSave(drill, activeGun.id);
      $('customDrillForm').classList.add('hidden'); onMessage(`Custom drill saved for ${activeGun.name}.`);
    } catch (error) { onError(error); }
    finally { setBusy(false); }
  });
  return { open, reset() { editingId = null; steps = []; $('customDrillForm').reset(); $('customDrillSteps').replaceChildren(); } };
}
