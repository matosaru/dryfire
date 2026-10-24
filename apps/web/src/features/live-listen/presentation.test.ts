/** @jest-environment jsdom */
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {distancePresentation,liveDrillPresentation} from './presentation.ts';
const legacy=readFileSync(new URL('../../../../../tests/fixtures/legacy-live-feedback.js',import.meta.url),'utf8');
const labels=['draw','rack','trigger','reload'],titleFor=(label:string)=>label??'Unknown sound';
test('distance labels, finite normalization and unlearned rows preserve the native presentation',()=>{
 for(const distances of [{draw:0,rack:2,trigger:1,reload:Infinity},{draw:NaN,rack:NaN,trigger:NaN,reload:NaN}]){
  document.body.innerHTML='<div id="distanceBars"></div>';const render=vm.runInNewContext(legacy+';renderDistances;',{$:(selector:string)=>document.querySelector(selector),document,labels,titleFor});render(distances);const rows=[...document.querySelector('#distanceBars')!.children].map(row=>({title:row.querySelector('.distance-label')!.children[0].textContent,value:row.querySelector('.distance-label')!.children[1].textContent,width:row.querySelector<HTMLElement>('.bar span')!.style.width}));expect(distancePresentation(labels,distances,titleFor)).toEqual(rows);
 }
});
test('free listening and every sequence outcome retain the native feedback and step classes',()=>{
 const fixture=readFileSync(new URL('../../../../../tests/fixtures/legacy-live-listen-page.html',import.meta.url),'utf8');
 for(const outcome of [undefined,'ready','matched','completed','incorrect','unknown'])for(const selected of [false,true]){
  document.body.innerHTML=fixture;const drill=selected?{steps:['draw','rack','trigger']}:null,state={stepIndex:outcome==='matched'?1:0,completed:2,incorrect:1,unknown:0,lastOutcome:outcome};const render=vm.runInNewContext(legacy+';renderDrill;',{$:(selector:string)=>document.querySelector(selector),document,currentDrill:()=>drill,drillState:state,titleFor});render();const view=liveDrillPresentation(drill,state,titleFor);for(const[id,text]of Object.entries(view.texts))expect(document.getElementById(id)!.textContent).toBe(text);for(const[id,hidden]of Object.entries(view.hidden))expect(document.getElementById(id)!.classList.contains('hidden')).toBe(hidden);expect(view.steps).toEqual([...document.getElementById('drillSteps')!.children].map(row=>({className:row.className,number:row.children[0].textContent,title:row.children[1].textContent})));
 }
});
