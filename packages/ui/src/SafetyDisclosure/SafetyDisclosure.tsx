export type SafetyDisclosureProps = { confirmed?: boolean; onChange?: (confirmed: boolean) => void; copy?: { summary: string; confirmed: string; required: string; heading: string; instructions: string; acknowledgement: string } };

const defaultCopy = { summary: 'Safety check', confirmed: 'Confirmed for this session', required: 'Required before recording', heading: 'Safety first', instructions: 'Verify unloaded; remove live ammunition from the area; use a safe direction and backstop.', acknowledgement: 'I confirm the safety check.' };
export function SafetyDisclosure({ confirmed = false, onChange, copy = defaultCopy }: SafetyDisclosureProps) {
  return <details className="safety-disclosure">
    <summary>{copy.summary} <span id="safetySummaryState">{confirmed ? copy.confirmed : copy.required}</span></summary>
    <section className="safety-card" aria-labelledby="safety-title">
      <div className="safety-icon" aria-hidden="true">!</div>
      <div><h2 id="safety-title">{copy.heading}</h2>
        <p>{copy.instructions}</p>
        <label className="checkbox-row"><input id="safetyAck" type="checkbox" checked={confirmed} onChange={event => onChange?.(event.currentTarget.checked)} /> {copy.acknowledgement}</label>
      </div>
    </section>
  </details>;
}
