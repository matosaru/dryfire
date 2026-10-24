import {DrillCard} from '../DrillCard/index.ts';
export type PracticeOption = { id: string; title: string; description: string };
export type PracticeCatalogProps = { modes: readonly PracticeOption[]; disabled?: boolean; onSelect?: (id: string) => void };

/** Static mode choices are prerenderable. Timing, profiles and capture remain
 * behind the application's existing controller; this component acquires none. */
export function PracticeCatalog({ modes, disabled = false, onSelect }: PracticeCatalogProps) {
  return <div id="practiceCatalog" className="drill-catalog">
    {modes.map(mode => <DrillCard key={mode.id} drill={{id:mode.id,title:mode.title,steps:[]}} description={mode.description} practiceMode={mode.id} disabled={disabled} onChoose={()=>onSelect?.(mode.id)}/>)}
  </div>;
}
