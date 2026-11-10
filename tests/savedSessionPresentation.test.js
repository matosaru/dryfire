/** @jest-environment jsdom */
import {jest} from '@jest/globals';
import {renderSavedSessions} from '../src/optional/renderLegacyHistory.js';

const sequence={id:'sequence',gunId:'one',drillTitle:'Saved custom sequence',startedAt:1700000000000,kind:'sequence',completed:2,config:{repetitions:10},status:'interrupted'};
const practice={id:'practice',gunId:'one',drillTitle:'Single trigger press',startedAt:1700000001000,kind:'practice',shots:3,completed:4,config:{repetitions:10},status:'completed'};
function setup(){document.body.innerHTML='<div id="savedSessions"><p>Previous results</p></div>';const host=document.querySelector('#savedSessions'),onOpen=jest.fn(),onDelete=jest.fn();return{host,onOpen,onDelete,render:records=>renderSavedSessions(document,records,{onOpen,onDelete})};}

test('saved practice and sequence rows retain order, titles, count semantics and review callbacks',()=>{
  const s=setup();s.render([sequence,practice]);
  expect([...s.host.querySelectorAll('strong')].map(n=>n.textContent)).toEqual([sequence.drillTitle,practice.drillTitle]);
  const buttons=[...s.host.querySelectorAll('button')];
  expect(buttons.map(n=>n.textContent)).toEqual([`${new Date(sequence.startedAt).toLocaleString()} · 2/10 · interrupted`,'Delete',`${new Date(practice.startedAt).toLocaleString()} · 3 shots · 4 attempts · completed`,'Delete']);
  for(const button of buttons.filter(node=>node.classList.contains('wide-action'))){expect(button.type).toBe('button');expect(button.className).toBe('button secondary wide-action');button.click();}
  expect(s.onOpen.mock.calls.map(([record])=>record)).toEqual([sequence,practice]);
});
test('empty selected-gun history replaces old cards with the existing empty copy',()=>{const s=setup();s.render([]);expect(s.host.innerHTML).toBe('<p class="empty-state">No saved drill sessions for this gun yet.</p>');});
test('individual deletion asks for confirmation before delegating a saved session',()=>{const s=setup(),confirm=jest.spyOn(globalThis,'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);s.render([sequence]);s.host.querySelector('[aria-label="Delete Saved custom sequence session"]').click();expect(s.onDelete).not.toHaveBeenCalled();s.host.querySelector('[aria-label="Delete Saved custom sequence session"]').click();expect(s.onDelete).toHaveBeenCalledWith(sequence);expect(confirm).toHaveBeenCalledWith('Delete?');confirm.mockRestore();});
