import { renderToStaticMarkup } from 'react-dom/server';
import { NumberInput } from '@dryfire/ui/NumberInput';
import { NUMBER_INPUTS } from '../../../../src/inputLimits.js';

/** Build-only controls preserve browser validation and use the same rules as
 * storage and session validation. No React or setup loop is needed at startup. */
export function renderNumberInput(id: string, value: string, name?: string) {
  const rule = NUMBER_INPUTS[id];
  if (!rule) throw new Error(`Unknown numeric control: ${id}`);
  return renderToStaticMarkup(<NumberInput id={id} name={name} min={rule.min} max={rule.max} step={rule.step} defaultValue={value}
    required={id !== 'maxResults'} inputMode={id === 'maxResults' ? undefined : rule.step === 1 ? 'numeric' : 'decimal'} />);
}
