/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {render,cleanup} from '@testing-library/react';
import {TriggerProfileStatus} from './TriggerProfileStatus';
afterEach(cleanup);
test.each([
 ['needs-samples','Needs samples','…'],['variable','Variable examples','!'],['stable','Stable profile','✓'],
] as const)('renders accessible %s guidance without relying on its symbol', (status,title,symbol)=>{
 const result=render(<TriggerProfileStatus quality={{status,title,message:'Next action',sampleCount:3,needed:0,outlierIndexes:[]}}/>);
 expect(result.getByRole('region',{name:title})).toHaveClass(`is-${status}`);
 expect(result.getByText(symbol)).toHaveAttribute('aria-hidden','true');
 expect(result.getByText('Next action')).toBeVisible();
});
