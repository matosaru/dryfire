/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,cleanup} from '@testing-library/react';
import {DrillSetup,DrillSetupDelayMode,DrillSetupDelayRange,DrillSetupCount,DrillSetupSteps,DrillGuideLink} from './DrillSetup';
import {NumberInput} from '../NumberInput';
afterEach(cleanup);
test.each(['practice','session'] as const)('%s uses one semantic configuration template with native bounds and disabled fieldset behavior',prefix=>{
 const v=render(<DrillSetup prefix={prefix} legend="Setup" footer={<button type="submit">Start</button>}><DrillSetupCount inputId="count" label={<span>Repetitions</span>}><NumberInput id="count" min={1} max={100} step={1} defaultValue="10" required/></DrillSetupCount></DrillSetup>);
 const input=v.getByRole('spinbutton',{name:'Repetitions 1–100 · whole numbers'}) as HTMLInputElement;
 expect(input.labels?.[0]).toHaveClass('session-repetition-field');expect(input).toHaveAttribute('aria-describedby','countLimit');input.value='101';expect(input.validity.rangeOverflow).toBe(true);expect(v.container.querySelector(`#${prefix}ConfigForm`)).toContainElement(v.getByRole('button',{name:'Start'}));
 v.container.querySelector('fieldset')!.disabled=true;expect(input).toBeDisabled();expect(v.getByRole('button')).toBeEnabled();
});
test('steps are an ordered, escaped list; hidden mode fields keep their IDs and labels',()=>{
 const v=render(<><DrillSetupSteps id="steps" label="Required sounds"><li>&lt;trigger&gt;</li></DrillSetupSteps><DrillSetupCount id="parRow" inputId="par" label={<span>Par time</span>} hidden><input id="par"/></DrillSetupCount></>);
 expect(v.getByRole('list')).toHaveAttribute('aria-label','Required sounds');expect(v.getByRole('listitem')).toHaveTextContent('<trigger>');expect(v.container.querySelector('trigger')).toBeNull();expect(v.container.querySelector('#parRow')).toHaveClass('hidden');expect(v.getByLabelText('Par time')).toHaveAttribute('id','par');
});

test('guide navigation uses a shared outlined link with a decorative information icon',()=>{
 const v=render(<DrillGuideLink id="guide"/>);
 const link=v.getByRole('link',{name:'About this practice'});
 expect(link).toHaveAttribute('href','#practice-guide');expect(link).toHaveClass('practice-guide-link');expect(link.querySelector('[aria-hidden="true"]')).toHaveTextContent('ⓘ');expect(link).not.toHaveTextContent('›');
 v.rerender(<DrillGuideLink id="guide" hidden/>);expect(link).toHaveClass('hidden');
});

test('shared delay controls preserve native selection and unfinished range values on parent updates',()=>{
 const content=()=> <><DrillSetupDelayMode inputId="delay" modes={['fixed','random']} name="delayMode"/><DrillSetupDelayRange id="range" prefix="practice" minimum={<input id="practiceMinDelay" defaultValue="2"/>} maximum={<input id="practiceMaxDelay" defaultValue="5"/>}/></>;
 const v=render(content()),select=v.getByLabelText('Start delay') as HTMLSelectElement,min=v.getByLabelText('Minimum seconds') as HTMLInputElement;
 select.value='random';min.value='3';v.rerender(content());
 expect(v.getByLabelText('Start delay')).toBe(select);expect(select.value).toBe('random');expect(v.getByLabelText('Minimum seconds')).toBe(min);expect(min.value).toBe('3');expect(v.getByLabelText('Maximum seconds')).toHaveAttribute('id','practiceMaxDelay');
});
