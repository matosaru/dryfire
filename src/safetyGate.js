/** A page-session acknowledgement gates and resumes the original capture intent. */
export function createSafetyGate({ dialog, checkbox, confirmButton, cancelButton, isConfirmed, confirmState, identity, onError }) {
  let pending = null;
  const clear = () => { pending = null; };
  checkbox.addEventListener('change', () => { confirmButton.disabled = !checkbox.checked; });
  dialog.addEventListener('cancel', clear); dialog.addEventListener('close', clear);
  cancelButton.addEventListener('click', () => { clear(); dialog.close(); });
  confirmButton.addEventListener('click', () => {
    if (!checkbox.checked || !pending) return;
    const intent = pending; pending = null;
    if (intent.owner !== identity()) { dialog.close(); return; }
    confirmState(); dialog.close();
    Promise.resolve().then(() => { if (intent.owner === identity()) return intent.action(); }).catch(onError);
  });
  return {
    ensure(action) {
      if (isConfirmed()) return true;
      if (!pending) {
        pending = { action: action || (() => {}), owner: identity() };
        checkbox.checked = false; confirmButton.disabled = true;
        dialog.showModal(); checkbox.focus();
      }
      return false;
    },
    cancel() { clear(); if (dialog.open) dialog.close(); },
  };
}
