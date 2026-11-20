import type { Ref } from 'react';
export type SafetyDialogProps = {
  ref?: Ref<HTMLDialogElement>;
  acknowledged?: boolean;
  onAcknowledge?: (value: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  copy?: { title: string; description: string; limitation: string; acknowledgement: string; confirm: string; cancel: string };
};

/** The existing gate owns showModal/close, focus and the pending capture intent.
 * Rendering this component never opens a dialog or acquires platform resources. */
const defaultCopy = { title: 'Confirm safety before practice', description: 'Verify the firearm is unloaded, remove live ammunition from the practice area, and use a safe direction and backstop.', limitation: 'The microphone cannot verify these checks. Confirmation applies to this app session.', acknowledgement: 'I have completed the safety check.', confirm: 'Confirm & continue', cancel: 'Cancel' };
export function SafetyDialog({ ref, acknowledged = false, onAcknowledge, onConfirm, onCancel, copy = defaultCopy }: SafetyDialogProps) {
  return <dialog ref={ref} id="safetyModal" className="safety-modal" aria-labelledby="safetyModalTitle" aria-describedby="safetyModalDescription" onCancel={onCancel}>
    <h2 id="safetyModalTitle">{copy.title}</h2>
    <p id="safetyModalDescription">{copy.description}</p>
    <p className="muted small">{copy.limitation}</p>
    <label className="checkbox-row"><input id="safetyModalAck" type="checkbox" checked={acknowledged} onChange={event => onAcknowledge?.(event.currentTarget.checked)} /> {copy.acknowledgement}</label>
    <button id="safetyConfirmBtn" className="button primary wide-action" type="button" disabled={!acknowledged} onClick={onConfirm}>{copy.confirm}</button>
    <button id="safetyCancelBtn" className="button secondary wide-action" type="button" onClick={onCancel}>{copy.cancel}</button>
  </dialog>;
}
