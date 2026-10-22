export type PracticeOption = { id: string; title: string; description: string };
export type PracticeCatalogProps = { modes: readonly PracticeOption[]; disabled?: boolean; onSelect?: (id: string) => void };

/** Static mode choices are prerenderable. Timing, profiles and capture remain
 * behind the application's existing controller; this component acquires none. */
export function PracticeCatalog({ modes, disabled = false, onSelect }: PracticeCatalogProps) {
  return <div id="practiceCatalog" className="drill-catalog">
    {modes.map(mode => <article className="preset-card" key={mode.id}>
      <div className="preset-header"><span className="drill-target" aria-hidden="true">◎</span><h3>{mode.title}</h3></div>
      <p className="drill-description">{mode.description}</p>
      <button className="button primary" type="button" data-practice-mode={mode.id} disabled={disabled} onClick={() => onSelect?.(mode.id)}>▶ Start Drill</button>
    </article>)}
  </div>;
}
