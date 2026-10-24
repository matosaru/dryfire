/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {act,fireEvent} from '@testing-library/react';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {serialize,deserialize} from 'node:v8';
import {mountGuidePage} from '../apps/web/src/app/guidePage';
import {mountGuideContents} from '../apps/web/src/app/guideContents';
// @ts-expect-error Existing synthetic guide controller boundary.
import {createPracticeGuideController} from '../src/practiceGuideController.js';
function fixture(){document.body.innerHTML='<input id="outside"><div id="practiceGuideView">'+readFileSync(new URL('./fixtures/session-pages/practiceGuide.guide-v3.html',import.meta.url),'utf8')+'</div>';return document.getElementById('practiceGuideView')!;}
test('guide parent keeps its exact figure/child hosts and routes manual/options/Back state without taking outside focus',()=>{
 const host=fixture(),figure=host.querySelector('.guide-media'),child=host.querySelector('#example-practiceRun'),back=jest.fn(),action=jest.fn();host.querySelector('#practiceGuideSequence')!.innerHTML='<li class="drill-step" data-sound="rack">Rack slide</li>';document.getElementById('outside')!.focus();let view!:ReturnType<typeof mountGuidePage>;act(()=>{view=mountGuidePage(host,{onBack:back,onAction:action});});expect(host.querySelector('.guide-media')).toBe(figure);expect(host.querySelector('#example-practiceRun')).toBe(child);act(()=>view.update({texts:{practiceGuideName:'<script>',practiceGuidePurpose:'Purpose'},sequence:[{label:'rack',text:'Rack slide'},{label:'trigger',text:'Trigger pull'}],steps:['Wait','Listen'],early:true,sequenceHidden:false,examplesHidden:true}));act(()=>view.update({texts:{practiceGuideMeasures:'Timing'}}));expect(host.querySelector('#practiceGuideName')).toHaveTextContent('<script>');expect(host.querySelector('#practiceGuidePurpose')).toHaveTextContent('Purpose');expect(host.querySelector('#practiceGuideSequence')).toHaveTextContent('Rack slideTrigger pull');expect(host.querySelector('#practiceGuideSequence')?.tagName).toBe('OL');expect(host.querySelectorAll('#practiceGuideSequence > li.drill-step')).toHaveLength(2);expect(host.querySelectorAll('#practiceGuideSteps li')).toHaveLength(2);expect(host.querySelector('#practiceGuideEarlyBtn')).toHaveAttribute('aria-pressed','true');expect(host.querySelector('#practiceGuideExamples')).toHaveClass('hidden');expect(document.activeElement?.id).toBe('outside');fireEvent.click(host.querySelector('#practiceGuideBackBtn')!);fireEvent.click(host.querySelector('#practiceGuideReturnBtn')!);expect(back).toHaveBeenCalledTimes(1);expect(action).toHaveBeenCalledWith('practiceGuideReturnBtn');act(()=>view.dispose());
});
test('actual guide controller retains nested React examples while moving through Single, early and ordered manuals',()=>{
 const host=fixture(),oldClone=globalThis.structuredClone;globalThis.structuredClone=value=>deserialize(serialize(value));const back=jest.fn();let child!:ReturnType<typeof mountGuideContents>,parent!:ReturnType<typeof mountGuidePage>;
 try{
  const controller=createPracticeGuideController({onBack:back});expect(controller.connectPage(jest.fn())).toBe(false);
  const context={type:'practice',mode:'single',gunId:'one',routeKey:'setup',config:{}};controller.open(context);
  act(()=>{controller.connectView((...args:Parameters<typeof mountGuideContents>)=>(child=mountGuideContents(...args)));expect(controller.connectPage((...args:Parameters<typeof mountGuidePage>)=>(parent=mountGuidePage(...args)))).toBe(true);});expect(controller.connectPage(jest.fn())).toBe(false);
  const figure=host.querySelector('.guide-media'),meter=host.querySelector('#example-practiceLevelPanel');fireEvent.click(host.querySelector('#practiceGuideEarlyBtn')!);expect(host.querySelector('#practiceGuideEarlyBtn')).toHaveAttribute('aria-pressed','true');fireEvent.click(host.querySelector('#practiceGuideNormalBtn')!);expect(host.querySelector('#practiceGuideEarlyBtn')).toHaveAttribute('aria-pressed','false');
  act(()=>controller.open({type:'sequence',gunId:'one',routeKey:'sequence',drill:{id:'custom-one',title:'Custom example',steps:['rack','reload','trigger']},config:{}}));expect(host.querySelector('#practiceGuideName')).toHaveTextContent('Custom example');expect(host.querySelector('#practiceGuideSequence [data-sound="reload"]')).toBeInTheDocument();expect(host.querySelector('.guide-media')).toBe(figure);expect(host.querySelector('#example-practiceLevelPanel')).toBe(meter);expect(host.querySelector('#example-sessionRun')).toHaveAttribute('data-react-session','');fireEvent.click(host.querySelector('#practiceGuideReturnBtn')!);expect(back).toHaveBeenCalledWith('session');
 }finally{act(()=>child?.dispose());act(()=>parent?.dispose());globalThis.structuredClone=oldClone;}
});

test('startup guide uses the same semantic ordered list before React enhancement',()=>{
 const host=fixture(),oldClone=globalThis.structuredClone;globalThis.structuredClone=value=>deserialize(serialize(value));
 try{const controller=createPracticeGuideController({});controller.open({type:'sequence',gunId:'one',routeKey:'sequence',drill:{id:'custom',title:'Sequence',steps:['rack','reload','trigger']},config:{}});const list=host.querySelector('#practiceGuideSequence')!;expect(list.tagName).toBe('OL');expect([...list.children].map(n=>n.textContent)).toEqual(['Rack slide','Change magazine','Trigger pull']);expect(list.querySelectorAll('li.drill-step[data-sound]')).toHaveLength(3);expect(list.querySelector('.preset-chip')).toBeNull();controller.open({type:'practice',mode:'single',gunId:'one',routeKey:'practice',config:{}});expect(list).toHaveClass('hidden');expect(list.children).toHaveLength(0);}finally{globalThis.structuredClone=oldClone;}
});
