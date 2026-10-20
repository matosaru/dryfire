/** @jest-environment jsdom */
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {evaluateEvents,ACTUAL_CLASSES,PREDICTED_CLASSES} from '../src/evaluation.js';
const legacy=readFileSync(new URL('./fixtures/legacy-history-rendering.js',import.meta.url),'utf8');
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const current=main.slice(main.indexOf('function renderEvaluation('),main.indexOf('async function renderHome('))+main.slice(main.indexOf('async function renderHistory('),main.indexOf('async function init('));
describe.each([['legacy',legacy],['current',current]])('%s History behavior',(_name,source)=>{
function setup(){
 document.body.innerHTML='<div id="progressContent"></div><strong id="verifiedCount"></strong><strong id="accuracyPct"></strong><strong id="falsePositivePct"></strong><div id="confusionTable"></div><span id="homeEvents"></span><div id="historyList">Previous results</div>';
 const context={historyPage:null,historyRenderToken:0,activeGun:{id:'one'},getEvents:jest.fn().mockResolvedValue([]),sessionController:{renderSavedSessions:jest.fn().mockResolvedValue([])},CAPABILITIES:{advancedGraphs:false},progressView:{render:jest.fn(),clear:jest.fn()},evaluateEvents,ACTUAL_CLASSES,PREDICTED_CLASSES,homePage:null,document,$:selector=>document.querySelector(selector),titleFor:label=>({trigger:'Trigger pull',draw:'Draw from holster',rack:'Rack slide',reload:'Change magazine'}[label]||'Unknown'),currentDrill:()=>({title:'Current title'}),labels:['draw','rack','trigger','reload'],verifyEvent:jest.fn().mockResolvedValue(undefined),showError:jest.fn()};
 const render=vm.runInNewContext(source+'\nrenderHistory',context);return{context,render};
}
const row={id:'e',gunId:'one',label:'trigger',createdAt:1700000000000,confidence:.854,actualLabel:'trigger',drillId:'custom',drillTitle:'Original <title>',drillCompleted:true};
test('recognition rows retain historical title, escaping, scores, verification and matrix semantics',async()=>{
 const {context,render}=setup();context.getEvents.mockResolvedValue([row,{...row,id:'other',label:'unknown',actualLabel:'other',score:91,drillCompleted:false,drillOutcome:'unknown'}]);await render();
 expect(document.querySelectorAll('.history-item')).toHaveLength(2);
 expect(document.querySelector('.history-item p').textContent).toBe('Original <title> · Sequence recognized ✓');expect(document.querySelector('title')).toBeNull();
 expect([...document.querySelectorAll('.history-controls>span')].map(n=>n.textContent)).toEqual(['85/100','91/100']);
 expect(document.querySelector('#verifiedCount').textContent).toBe('2');expect(document.querySelector('#accuracyPct').textContent).toBe('100%');expect(document.querySelector('#falsePositivePct').textContent).toBe('0%');
 expect(document.querySelector('caption').textContent).toBe('Actual sound by predicted label (counts)');expect(document.querySelectorAll('td.correct')).toHaveLength(5);
 const select=document.querySelector('select');expect(select.getAttribute('aria-label')).toBe(`Actual sound for ${new Date(row.createdAt).toLocaleString()}`);expect(select.value).toBe('trigger');
 select.value='other';select.dispatchEvent(new Event('change'));await Promise.resolve();await Promise.resolve();expect(context.verifyEvent).toHaveBeenCalledWith('e','other','one');
});
test('empty and unverified histories retain empty copy and no confusion table',async()=>{const {render}=setup();await render();expect(document.querySelector('#historyList').innerHTML).toBe('<div class="empty-state">No recognition events yet.</div>');expect(document.querySelector('#confusionTable').textContent).toBe('Verify at least one event below to see the confusion matrix.');});
test.each(['events','sessions'])('superseded %s read cannot paint stale gun results',async(boundary)=>{const {context,render}=setup();let resolve;if(boundary==='events')context.getEvents.mockReturnValue(new Promise(done=>{resolve=done;}));else context.sessionController.renderSavedSessions.mockReturnValue(new Promise(done=>{resolve=done;}));const pending=render();await Promise.resolve();context.activeGun={id:'two'};resolve([row]);await pending;expect(document.querySelector('#historyList').textContent).toBe('Previous results');expect(context.progressView.render).not.toHaveBeenCalled();});
test('Full graphs receive the same selected-gun sessions after ownership checks',async()=>{const {context,render}=setup();context.CAPABILITIES.advancedGraphs=true;const records=[{id:'saved'}];context.sessionController.renderSavedSessions.mockResolvedValue(records);await render();expect(context.progressView.render).toHaveBeenCalledWith(records,'one');});

if(_name==='current')test('React-owned history receives one guarded result model and native result hosts are untouched',async()=>{const {context,render}=setup();context.getEvents.mockResolvedValue([row]);context.historyPage={setResults:jest.fn()};await render();expect(context.historyPage.setResults).toHaveBeenCalledWith(expect.objectContaining({rows:[row],sessions:[],gunId:'one',stats:expect.objectContaining({verified:1})}));expect(document.querySelector('#historyList').textContent).toBe('Previous results');expect(context.sessionController.renderSavedSessions).toHaveBeenCalledWith('one',expect.any(Function),false);});

});
