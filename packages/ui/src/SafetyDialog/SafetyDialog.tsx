import type { Ref } from 'react';
export type SafetyDialogProps = {
  ref?: Ref<HTMLDialogElement>;
  acknowledged?: boolean;
  onAcknowledge?: (value: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
};

/** The existing gate owns showModal/close, focus and the pending capture intent.
 * Rendering this component never opens a dialog or acquires platform resources. */
export function SafetyDialog({ ref, acknowledged = false, onAcknowledge, onConfirm, onCancel }: SafetyDialogProps) {
  return <dialog ref={ref} id="safetyModal" className="safety-modal" aria-labelledby="safetyModalTitle" aria-describedby="safetyModalDescription" onCancel={onCancel}>
    <h2 id="safetyModalTitle">Confirm safety before practice</h2>
    <p id="safetyModalDescription">Verify the firearm is unloaded, remove live ammunition from the practice area, and use a safe direction and backstop.</p>
    <p className="muted small">The microphone cannot verify these checks. Confirmation applies to this app session.</p>
    <label className="checkbox-row"><input id="safetyModalAck" type="checkbox" checked={acknowledged} onChange={event => onAcknowledge?.(event.currentTarget.checked)} /> I have completed the safety check.</label>
    <button id="safetyConfirmBtn" className="button primary wide-action" type="button" disabled={!acknowledged} onClick={onConfirm}>Confirm &amp; continue</button>
    <button id="safetyCancelBtn" className="button secondary wide-action" type="button" onClick={onCancel}>Cancel</button>
  </dialog>;
}
