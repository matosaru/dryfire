/** @jest-environment jsdom */
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/sessionController.js',import.meta.url),'utf8');
const rendering=source.slice(source.indexOf('  async function renderSavedSessions('),source.indexOf('  const retrySaveButton'));
function setup(){
  document.body.innerHTML='<div id="savedSessions"><p>Previous results</p></div>';
  const context={gun:{id:'one'}};
  const getSessions=jest.fn(),onPracticeRecord=jest.fn(),showRecord=jest.fn();
  const bindings={getSessions,getContext:()=>context,$:selector=>document.querySelector(selector),onPracticeRecord,showRecord,
    node:(tag,text,className='')=>{const item=document.createElement(tag);item.textContent=text;item.className=className;return item;}};
  const render=vm.runInNewContext(rendering+'\nrenderSavedSessions',bindings);
  return{render,context,getSessions,onPracticeRecord,showRecord,host:document.querySelector('#savedSessions')};
}
const sequence={id:'sequence',gunId:'one',drillTitle:'Saved custom sequence',startedAt:1700000000000,kind:'sequence',completed:2,config:{repetitions:10},status:'interrupted'};
const practice={id:'practice',gunId:'one',drillTitle:'Single trigger press',startedAt:1700000001000,kind:'practice',shots:3,completed:4,status:'completed'};
test('saved practice and sequence rows retain order, titles, count semantics and review callbacks',async()=>{
  const s=setup();s.getSessions.mockResolvedValue([sequence,practice]);
  expect(await s.render('one')).toEqual([sequence,practice]);
  expect(s.getSessions).toHaveBeenCalledWith('one');
  expect([...s.host.querySelectorAll('strong')].map(n=>n.textContent)).toEqual([sequence.drillTitle,practice.drillTitle]);
  const buttons=[...s.host.querySelectorAll('button')];
  expect(buttons.map(n=>n.textContent)).toEqual([`${new Date(sequence.startedAt).toLocaleString()} · 2/10 · interrupted`,`${new Date(practice.startedAt).toLocaleString()} · 3 shots · 4 attempts · completed`]);
  for(const button of buttons){expect(button.type).toBe('button');expect(button.className).toBe('button secondary wide-action');button.click();}
  expect(s.showRecord).toHaveBeenCalledWith(sequence);expect(s.onPracticeRecord).toHaveBeenCalledWith(practice);
});
test('empty selected-gun history replaces old cards with the existing empty copy',async()=>{
  const s=setup();s.getSessions.mockResolvedValue([]);expect(await s.render('one')).toEqual([]);
  expect(s.host.innerHTML).toBe('<p class="empty-state">No saved drill sessions for this gun yet.</p>');
});
test('no selected gun avoids storage and clears results when the current context is also empty',async()=>{
  const s=setup();s.context.gun=undefined;expect(await s.render(undefined)).toEqual([]);
  expect(s.getSessions).not.toHaveBeenCalled();expect(s.host.textContent).toBe('No saved drill sessions for this gun yet.');
});
test.each(['gun changed','request superseded'])('a late read does not replace current results: %s',async(reason)=>{
  const s=setup();let resolve;let current=true;s.getSessions.mockReturnValue(new Promise(done=>{resolve=done;}));
  const pending=s.render('one',()=>current);
  if(reason==='gun changed')s.context.gun={id:'two'};else current=false;
  resolve([sequence]);expect(await pending).toBeUndefined();expect(s.host.textContent).toBe('Previous results');
  expect(s.showRecord).not.toHaveBeenCalled();expect(s.onPracticeRecord).not.toHaveBeenCalled();
});
test('storage failure propagates without deleting the last visible results',async()=>{
  const s=setup();const error=new Error('read failed');s.getSessions.mockRejectedValue(error);
  await expect(s.render('one')).rejects.toBe(error);expect(s.host.textContent).toBe('Previous results');
});
test('older sequence records without a kind still open the sequence review',async()=>{
  const s=setup();const older={...sequence};delete older.kind;s.getSessions.mockResolvedValue([older]);await s.render('one');
  s.host.querySelector('button').click();expect(s.showRecord).toHaveBeenCalledWith(older);expect(s.onPracticeRecord).not.toHaveBeenCalled();
});
