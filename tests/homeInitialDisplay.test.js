/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {renderPageTemplates} from '../tools/page-templates.mjs';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const implementation=source.slice(source.indexOf('function displayView('),source.indexOf('function renderDistances('));
function setup(view='loading'){
 document.body.innerHTML=renderPageTemplates('{{app}}');document.body.dataset.view=view;
 document.getElementById('homeEvents').textContent='7';document.getElementById('homeAccuracy').textContent='50%';
 const context={document,window:{scrollTo:jest.fn()},busy:false,profileLoading:false,PAGE_IDS:['home','settings'],practiceController:null,activeGun:{id:'a'},informationPages:{show:jest.fn()},homePage:null,homePagePending:true,activeView:view==='loading'?'home':view,appURLs:false,setMessage:jest.fn(),showError:jest.fn(),renderHome:jest.fn(async()=>{})};
 const show=runInNewContext(implementation+'\ndisplayView;',context);return{context,show};
}
test('first Home displays the statistics already loaded with its profile without a duplicate history read',()=>{
 const s=setup();s.show('home');expect(s.context.renderHome).not.toHaveBeenCalled();expect(document.body.dataset.view).toBe('home');expect(document.getElementById('homeView').classList.contains('hidden')).toBe(false);expect(document.getElementById('homeEvents').textContent).toBe('7');expect(document.getElementById('homeAccuracy').textContent).toBe('50%');
});
test('later Home visits still refresh statistics rather than keeping the initial snapshot',()=>{
 const s=setup('settings');s.show('home');expect(s.context.renderHome).toHaveBeenCalledTimes(1);expect(document.body.dataset.view).toBe('home');
});
