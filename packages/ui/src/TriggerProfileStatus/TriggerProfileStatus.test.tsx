/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {jest} from '@jest/globals';
import {render,cleanup,fireEvent} from '@testing-library/react';
import {TriggerProfileStatus} from './TriggerProfileStatus';
afterEach(cleanup);
test.each([
 ['needs-samples','Needs samples','…'],['variable','Variable examples','!'],['stable','Stable profile','✓'],
] as const)('renders accessible %s guidance without relying on its symbol', (status,title,symbol)=>{
 const result=render(<TriggerProfileStatus quality={{status,sampleCount:3,needed:0,outlierIndexes:[]}} eyebrow="TRIGGER PROFILE" title={title} message="Next action" action="Run sound check"/>);
 expect(result.getByRole('region',{name:title})).toHaveClass(`is-${status}`);
 expect(result.getByText(symbol)).toHaveAttribute('aria-hidden','true');
 expect(result.getByText('Next action')).toBeVisible();
});
test('opens Sound Check only when the profile has enough samples',()=>{
 const onSoundCheck=jest.fn();
 const result=render(<TriggerProfileStatus quality={{status:'stable',sampleCount:8,needed:0,outlierIndexes:[]}} eyebrow="TRIGGER PROFILE" title="Stable profile" message="Ready" action="Run sound check" onSoundCheck={onSoundCheck}/>);
 fireEvent.click(result.getByRole('button',{name:'Run sound check'}));
 expect(onSoundCheck).toHaveBeenCalledTimes(1);
});
