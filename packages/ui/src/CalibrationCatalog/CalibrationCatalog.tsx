export type CalibrationKind = 'reset' | 'noise' | 'cue';
export type CalibrationCatalogMessages = {
  categories: Record<CalibrationKind,{title:string;description:string}>;
  train:string;
  reset:string;
  progress:(description:string,count:number,maximum:number)=>string;
  limitReached:string;
};
export type CalibrationCatalogProps = {
  counts?: Partial<Record<CalibrationKind, number>>;
  maximum?: number;
  locked?: boolean;
  messages:CalibrationCatalogMessages;
  onRecord?: (kind: CalibrationKind) => void;
  onReset?: (kind: CalibrationKind) => void;
};

/** Presentation only. The owning feature acquires audio and confirms resets. */
export function CalibrationCatalog({ counts = {}, maximum = 10, locked = true, messages, onRecord, onReset }: CalibrationCatalogProps) {
  return <div id="calibrationCards" className="class-grid">{(['reset','noise','cue'] as const).map(kind => {
    const {title,description}=messages.categories[kind];
    const count = counts[kind] ?? 0;
    return <article key={kind} className="calibration-card">
      <h3>{title}</h3><p className="muted small" data-description={description}>{messages.progress(description, count, maximum)}{count>=maximum?messages.limitReached:''}</p>
      <div className="class-actions">
        <button type="button" className="button primary" disabled={locked || count >= maximum} data-calibration-kind={kind} onClick={() => onRecord?.(kind)}>{messages.train}</button>
        <button type="button" className="button secondary" disabled={locked || !count} onClick={() => onReset?.(kind)}>{messages.reset}</button>
      </div>
    </article>;
  })}</div>;
}
