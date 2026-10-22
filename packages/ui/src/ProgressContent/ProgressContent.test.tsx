/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,cleanup} from '@testing-library/react';
import {readFileSync} from 'node:fs';
// @ts-expect-error Frozen untyped renderer is the independent pre-migration oracle.
import {createProgressView} from '../../../../tests/fixtures/legacy-progress-view.js';
// @ts-expect-error Existing statistics remain the unchanged JavaScript domain boundary.
import {progressGroups,progressSummary} from '../../../../src/practiceProgress.js';
import {progressPresentation} from '../../../../apps/web/src/features/history/progressPresentation';
import {ProgressContent} from './ProgressContent';
afterEach(()=>{cleanup();document.body.replaceChildren();});
const library=JSON.parse(readFileSync(new URL('../../../../visual-tests/fixtures/library.json',import.meta.url),'utf8'));
test.each(['single','repeated','control','par','sequence'])('%s chart DOM, values, SVG geometry and accessible table match the native renderer',mode=>{
 const records=library.sessions.filter((record:{gunId:string;practiceMode:string})=>record.gunId==='qa-gun-a'&&record.practiceMode==='single').map((record:Record<string,unknown>,i:number)=>({...record,kind:mode==='sequence'?'sequence':'practice',practiceMode:mode,shots:3,elapsedMs:3000+i*200,repetitions:[0,1,2].map(j=>({status:'completed',elapsedMs:500+i*50+j*20,intervalMs:400+i*10+j*30,stepTimings:[{splitMs:800+i*20+j*10}]}))}));
 const native=document.createElement('div');native.innerHTML='<select id="progressGroup"></select><select id="progressRange"><option value="0">All</option></select><div id="progressContent"></div>';document.body.append(native);
 createProgressView(document).render(records,'qa-gun-a');const group=progressGroups(records,'qa-gun-a')[0],data=progressSummary(group);const model=progressPresentation(group,data);
 const actual=render(<ProgressContent model={model}/>);const expected=native.querySelector('#progressContent')!;
 expect(actual.container.childNodes.length).toBe(expected.childNodes.length);expect([...actual.container.childNodes].every((node,index)=>node.isEqualNode(expected.childNodes[index]))).toBe(true);
 native.remove();expect(actual.getByRole('img')).toHaveAccessibleName(model.chart!.label);expect(actual.getByText('View values and sample counts')).toBeInTheDocument();native.remove();
});
test('blank, empty and no-sample models preserve their distinct shapes',()=>{const view=render(<ProgressContent model={{}}/>);expect(view.container).toBeEmptyDOMElement();view.rerender(<ProgressContent model={{empty:'Complete practice sessions to see your timing and progress here.'}}/>);expect(view.getByText(/Complete practice/)).toHaveClass('empty-state');view.rerender(<ProgressContent model={{timing:'Silent start',cards:[],trend:'More sessions needed',metric:'Median detected time',empty:'No completed timing samples in this range. Choose a wider range or finish another session.'}}/>);expect(view.queryByRole('img')).toBeNull();expect(view.getByText('Median detected time').tagName).toBe('H4');});
