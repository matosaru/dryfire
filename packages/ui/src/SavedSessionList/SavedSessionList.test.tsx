/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,fireEvent,cleanup} from '@testing-library/react';
import {jest} from '@jest/globals';
import {renderSavedSessions} from '../../../../src/optional/renderLegacyHistory.js';
import {SavedSessionList,type SavedSessionSummary} from './SavedSessionList';
afterEach(cleanup);
test('empty saved sessions preserve released element and copy',()=>{const view=render(<SavedSessionList records={[]} onOpen={jest.fn()}/>);expect(view.container.innerHTML).toBe('<p class="empty-state">No saved drill sessions for this gun yet.</p>');});
test('sequence, practice and legacy records keep counts, dates, order and original callback identity',()=>{
  const records:SavedSessionSummary[]=[{id:'s',drillTitle:'Custom sequence',startedAt:1700000000000,completed:2,config:{repetitions:10},status:'interrupted'}, {id:'p',kind:'practice',drillTitle:'Single trigger press',startedAt:1700000001000,shots:3,completed:4,config:{repetitions:10},status:'completed'}];
  const open=jest.fn();const view=render(<SavedSessionList records={records} onOpen={open}/>);
  expect([...view.container.querySelectorAll('strong')].map(n=>n.textContent)).toEqual(records.map(r=>r.drillTitle));
  const buttons=view.getAllByRole('button');
  expect(buttons.map(n=>n.textContent)).toEqual([`${new Date(records[0].startedAt).toLocaleString()} · 2/10 · interrupted`,`${new Date(records[1].startedAt).toLocaleString()} · 3 shots · 4 attempts · completed`]);
  buttons.forEach(button=>{expect(button).toHaveAttribute('type','button');expect(button.className).toBe('button secondary wide-action');fireEvent.click(button);});
  expect(open.mock.calls[0][0]).toBe(records[0]);expect(open.mock.calls[1][0]).toBe(records[1]);
  view.rerender(<SavedSessionList records={[]} onOpen={open}/>);expect(view.queryAllByRole('button')).toHaveLength(0);
});
test('stored titles render as text rather than executable markup',()=>{const view=render(<SavedSessionList records={[{id:'x',drillTitle:'<img src=x onerror=alert(1)>',startedAt:0,completed:0,config:{repetitions:1},status:'interrupted'}]} onOpen={jest.fn()}/>);expect(view.container.querySelector('img')).toBeNull();expect(view.container.querySelector('strong')?.textContent).toBe('<img src=x onerror=alert(1)>');});
test('individual deletion requires an inline confirmation and can be cancelled',()=>{
 const record:SavedSessionSummary={id:'s',drillTitle:'Single trigger press',startedAt:0,completed:1,config:{repetitions:1},status:'completed'},remove=jest.fn();const view=render(<SavedSessionList records={[record]} onOpen={jest.fn()} onDelete={remove}/>);
 fireEvent.click(view.getByRole('button',{name:'Delete Single trigger press session'}));expect(view.getByText('Delete this saved session?')).toBeVisible();fireEvent.click(view.getByRole('button',{name:'Cancel deleting Single trigger press session'}));expect(remove).not.toHaveBeenCalled();
 fireEvent.click(view.getByRole('button',{name:'Delete Single trigger press session'}));fireEvent.click(view.getByRole('button',{name:'Confirm deleting Single trigger press session'}));expect(remove).toHaveBeenCalledWith(record);
});

test('typed cards match the existing controller DOM without changing selectors or text nodes',async()=>{
 const records:SavedSessionSummary[]=[{id:'s',drillTitle:'Legacy sequence',startedAt:1700000000000,completed:2,config:{repetitions:10},status:'interrupted'}, {id:'p',kind:'practice',drillTitle:'Single trigger press',startedAt:1700000001000,shots:3,completed:4,config:{repetitions:10},status:'completed'}];
 const native=document.createElement('div');
 native.id='savedSessions';document.body.append(native);renderSavedSessions(document,records,{onOpen:jest.fn()});
 const actual=render(<SavedSessionList records={records} onOpen={jest.fn()}/>);
 expect([...actual.container.childNodes].map((node,index)=>node.isEqualNode(native.childNodes[index]))).toEqual([true,true]);
});
