export type SafetyDisclosureProps = { confirmed?: boolean; onChange?: (confirmed: boolean) => void };

export function SafetyDisclosure({ confirmed = false, onChange }: SafetyDisclosureProps) {
  return <details className="safety-disclosure">
    <summary>Safety check <span id="safetySummaryState">{confirmed ? 'Confirmed for this session' : 'Required before recording'}</span></summary>
    <section className="safety-card" aria-labelledby="safety-title">
      <div className="safety-icon" aria-hidden="true">!</div>
      <div><h2 id="safety-title">Safety first</h2>
        <p>Verify unloaded; remove live ammunition from the area; use a safe direction and backstop.</p>
        <label className="checkbox-row"><input id="safetyAck" type="checkbox" checked={confirmed} onChange={event => onChange?.(event.currentTarget.checked)} /> I confirm the safety check.</label>
      </div>
    </section>
  </details>;
}
