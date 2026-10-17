export type PracticeOption = { id: string; title: string; description: string };
export type PracticeCatalogProps = { modes: readonly PracticeOption[]; disabled?: boolean; onSelect?: (id: string) => void };

/** Static mode choices are prerenderable. Timing, profiles and capture remain
 * behind the application's existing controller; this component acquires none. */
export function PracticeCatalog({ modes, disabled = false, onSelect }: PracticeCatalogProps) {
  return <div id="practiceCatalog" className="drill-catalog">
    {modes.map(mode => <article className="preset-card" key={mode.id}>
      <h3 className="">{mode.title}</h3><p className="muted small">{mode.description}</p>
      <button className="button primary wide-action" type="button" data-practice-mode={mode.id} disabled={disabled} onClick={() => onSelect?.(mode.id)}>Configure practice</button>
    </article>)}
  </div>;
}
