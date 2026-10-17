import { calibrationProgress } from './CalibrationCatalog.copy.ts';
const categories = [
  { kind: 'reset', title: 'Trigger reset clicks', description: 'Examples of clicks that must not count as a shot.' },
  { kind: 'noise', title: 'Other noise / handling', description: 'Background and handling sounds to reject.' },
  { kind: 'cue', title: 'External start beep', description: 'Required only for the External beep start option.' },
] as const;
export type CalibrationKind = typeof categories[number]['kind'];
export type CalibrationCatalogProps = {
  counts?: Partial<Record<CalibrationKind, number>>;
  maximum?: number;
  locked?: boolean;
  onRecord?: (kind: CalibrationKind) => void;
  onReset?: (kind: CalibrationKind) => void;
};

/** Presentation only. The owning feature acquires audio and confirms resets. */
export function CalibrationCatalog({ counts = {}, maximum = 10, locked = true, onRecord, onReset }: CalibrationCatalogProps) {
  return <div id="calibrationCards" className="class-grid">{categories.map(({ kind, title, description }) => {
    const count = counts[kind] ?? 0;
    return <article key={kind} className="calibration-card">
      <h3>{title}</h3><p className="muted small" data-description={description}>{calibrationProgress(description, count, maximum)}</p>
      <div className="class-actions">
        <button type="button" className="button primary" disabled={locked || count >= maximum} data-calibration-kind={kind} onClick={() => onRecord?.(kind)}>Train</button>
        <button type="button" className="button secondary" disabled={locked || !count} onClick={() => onReset?.(kind)}>Reset</button>
      </div>
    </article>;
  })}</div>;
}
