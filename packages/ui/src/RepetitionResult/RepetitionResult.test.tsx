/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,cleanup,fireEvent} from '@testing-library/react';
// @ts-expect-error Frozen native detail factories remain the independent pre-extraction oracle.
import {practiceResultDetails,sequenceResultDetails} from '../../../../tests/fixtures/legacy-session-presentation.js';
import {practiceResultPresentation,sequenceResultPresentation,type PracticeRepetition,type SequenceRepetition} from '../../../../apps/web/src/features/sessions/resultPresentation';
import {RepetitionResult} from './RepetitionResult';
afterEach(cleanup);
const node=(tag:string,text:string,className='')=>{const element=document.createElement(tag);element.textContent=text;element.className=className;return element;};
const titleFor=(label:string)=>({trigger:'Trigger pull',reload:'Change magazine'}[label]??label);
const base={ordinal:2,status:'hit',elapsedMs:500,intervalMs:null,stepTimings:[{label:'trigger',offsetMs:500,splitMs:500}],detections:[{label:'trigger',offsetMs:500,outcome:'matched',score:91.7}]};
test.each([['hit',undefined],['miss','early'],['miss','late'],['miss','timeout'],['partial','paused'],['partial',undefined]])('Practice %s/%s preserves native disclosure DOM, intervals and score precision',(status,reason)=>{const row:PracticeRepetition={...base,status,reason,elapsedMs:status==='hit'?500:null,intervalMs:status==='hit'?800:null};const native=practiceResultDetails(row,{node,titleFor}),view=render(<RepetitionResult value={practiceResultPresentation(row,titleFor)}/>);expect(view.container.firstChild?.isEqualNode(native)).toBe(true);fireEvent.click(view.container.querySelector('summary')!);expect(view.container.querySelector('details')).toHaveAttribute('open');});
test.each([['completed',undefined],['partial','ended'],['partial',undefined]])('Sequence %s/%s preserves native ordered timing and unknown/out-of-order disclosures',(status,reason)=>{const row:SequenceRepetition={...base,status,reason,unknown:2,incorrect:1};const native=sequenceResultDetails(row,{node,titleFor}),view=render(<RepetitionResult value={sequenceResultPresentation(row,titleFor)}/>);expect(view.container.firstChild?.isEqualNode(native)).toBe(true);expect(view.getByText('2 unknown · 1 out of order')).toBeInTheDocument();});
test('empty details and historical markup-like strings remain read-only text',()=>{const row={...base,intervalMs:null,stepTimings:[],detections:[]};const view=render(<RepetitionResult value={practiceResultPresentation(row,titleFor)}/>);expect(view.container.querySelector('ol')).toBeNull();expect(view.container.querySelector('.session-result-body')).toBeEmptyDOMElement();view.rerender(<RepetitionResult value={{summary:'<script>not markup</script>',paragraphs:[{className:'small',text:'<img src=x>'}],detections:['<iframe>']}}/>);expect(view.container.querySelector('script,img,iframe')).toBeNull();});
