/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {renderPageTemplates} from '../tools/page-templates.mjs';
import {evaluateEvents} from '../src/evaluation.js';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const implementation=source.slice(source.indexOf('async function renderHome()'),source.indexOf('async function renderHistory()'));
function setup(){
 document.body.innerHTML=renderPageTemplates('{{app}}');
 const homePage=undefined;
 const context={homePage,activeGun:{id:'a'},homeRenderToken:0,getEvents:jest.fn(async()=>[]),evaluateEvents,$:selector=>document.querySelector(selector)};
 const render=vm.runInNewContext(implementation+'\nrenderHome;',context);
 return{context,render};
}
const deferred=()=>{let resolve;const promise=new Promise(yes=>{resolve=yes;});return{promise,resolve};};
test('Home reads only the selected gun and presents real verified accuracy, excluding unverified results',async()=>{
 const {context,render}=setup();
 context.getEvents.mockResolvedValue([{label:'trigger',actualLabel:'trigger'},{label:'rack',actualLabel:'trigger'},{label:'trigger'}]);
 await render();expect(context.getEvents).toHaveBeenCalledWith('a');
 expect(document.querySelector('#homeEvents').textContent).toBe('3');expect(document.querySelector('#homeAccuracy').textContent).toBe('50%');
});
test('no selected gun performs no owned read and resets the empty summary',async()=>{
 const {context,render}=setup();context.activeGun=null;
 document.querySelector('#homeEvents').textContent='99';document.querySelector('#homeAccuracy').textContent='100%';
 await render();expect(context.getEvents).not.toHaveBeenCalled();expect(document.querySelector('#homeEvents').textContent).toBe('0');expect(document.querySelector('#homeAccuracy').textContent).toBe('—');
});
test('unverified detections never imply measured recognition accuracy',async()=>{
 const {context,render}=setup();context.getEvents.mockResolvedValue([{label:'trigger'}]);await render();
 expect(document.querySelector('#homeEvents').textContent).toBe('1');expect(document.querySelector('#homeAccuracy').textContent).toBe('—');
});
test('a late result from a previously selected gun cannot overwrite its replacement',async()=>{
 const {context,render}=setup(),read=deferred();context.getEvents.mockReturnValue(read.promise);const pending=render();
 context.activeGun={id:'b'};document.querySelector('#homeEvents').textContent='7';read.resolve([{label:'trigger',actualLabel:'trigger'}]);await pending;
 expect(document.querySelector('#homeEvents').textContent).toBe('7');expect(document.querySelector('#homeAccuracy').textContent).toBe('—');
});
test('newer Home refresh wins even when the same gun read resolves out of order',async()=>{
 const {context,render}=setup(),old=deferred();context.getEvents.mockReturnValueOnce(old.promise).mockResolvedValueOnce([{label:'trigger',actualLabel:'trigger'}]);
 const pending=render();await render();old.resolve([]);await pending;
 expect(document.querySelector('#homeEvents').textContent).toBe('1');expect(document.querySelector('#homeAccuracy').textContent).toBe('100%');
});
test('rejected storage reads propagate without replacing the displayed summary',async()=>{
 const {context,render}=setup();document.querySelector('#homeEvents').textContent='7';context.getEvents.mockRejectedValue(new Error('storage unavailable'));
 await expect(render()).rejects.toThrow('storage unavailable');expect(document.querySelector('#homeEvents').textContent).toBe('7');
});

test('after Home mounts, results go to the React owner without competing native writes',async()=>{
 const {context,render}=setup(),update=jest.fn();context.homePage={update};context.getEvents.mockResolvedValue([{label:'trigger',actualLabel:'trigger'}]);document.querySelector('#homeEvents').textContent='Owned';await render();expect(update).toHaveBeenCalledWith({events:1,accuracy:'100%'});expect(document.querySelector('#homeEvents').textContent).toBe('Owned');
});
