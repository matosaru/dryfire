/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {act} from '@testing-library/react';
import {jest} from '@jest/globals';
import {serialize,deserialize} from 'node:v8';
import {mountGuideContents} from '../apps/web/src/app/guideContents';
// @ts-expect-error Existing JS renderer/controller boundary.
import {createGuideExampleRenderer} from '../src/practiceGuideRendering.js';
// @ts-expect-error Frozen original guide orchestrator is the independent native oracle.
import {createGuideExampleRenderer as nativeRenderer} from './fixtures/legacy-guide-rendering.js';
// @ts-expect-error Original engine scenarios/DOM normalization are shared test helpers.
import {guideCases,guideScenario,nativeExampleMarkup,semanticTree} from './helpers/guidePresentation.js';
const originalClone=globalThis.structuredClone;
beforeAll(()=>{globalThis.structuredClone=value=>deserialize(serialize(value));});
afterAll(()=>{globalThis.structuredClone=originalClone;});
function setup(){const doc=document.implementation.createHTMLDocument('');doc.body.innerHTML=nativeExampleMarkup();doc.querySelectorAll('[role="status"],[aria-live]').forEach(node=>node.setAttribute('aria-live','off'));doc.getElementById('example-practiceStopBtn')!.setAttribute('aria-label','Stop example');return doc;}
function tree(doc:Document){const copy=doc.getElementById('practiceGuideExample')!.cloneNode(true) as HTMLElement;copy.querySelectorAll('[data-react-session]').forEach(node=>node.removeAttribute('data-react-session'));copy.querySelectorAll('div[style="display: contents;"]').forEach(node=>node.replaceWith(...node.childNodes));return semanticTree(copy);}
for(const name of guideCases)test(`${name} React examples retain every native engine frame, silent status and saved-note wording`,()=>{
 const native=setup(),typed=setup(),reference=nativeRenderer(native),render=createGuideExampleRenderer(typed),{guide,scenario}=guideScenario(name),action=jest.fn();
 reference(scenario.frames[0],guide);render(scenario.frames[0],guide);
 let view!:ReturnType<typeof mountGuideContents>;
 act(()=>{expect(render.connectView((...args:Parameters<typeof mountGuideContents>)=>(view=mountGuideContents(...args)),action)).toBe(true);});
 expect(render.connectView(jest.fn(),action)).toBe(false);
 for(const frame of scenario.frames){reference(frame,guide);act(()=>render(frame,guide));expect(tree(typed)).toEqual(tree(native));}
 expect(typed.querySelector('#example-sessionReview .session-review-card button')).toBeNull();
 act(()=>typed.getElementById('example-practiceStopBtn')!.click());expect(action).toHaveBeenCalledWith('practiceStopBtn');
 act(()=>view.dispose());
});
test('failed second pair restores all original guide nodes, listeners, meter and focus',()=>{
 const doc=setup(),hosts=['practiceRun','practiceReview','sessionRun','sessionReview'].map(id=>doc.getElementById('example-'+id)!),backups=hosts.map(host=>[...host.childNodes]),meter=doc.getElementById('example-practiceLevelPanel')!,button=doc.getElementById('example-practicePauseBtn')!,click=jest.fn();button.addEventListener('click',click);
 const env=globalThis as typeof globalThis&{IS_REACT_ACT_ENVIRONMENT?:boolean},previous=env.IS_REACT_ACT_ENVIRONMENT;env.IS_REACT_ACT_ENVIRONMENT=false;
 try{expect(()=>mountGuideContents(doc,{models:{setSequenceReview:{title:{invalid:true} as unknown as string,status:'completed',summary:[],savedNote:'Example',retryHidden:true,retryDisabled:false,repeatDisabled:false,results:[]}},titleFor:label=>label,onAction:()=>{}})).toThrow();}finally{env.IS_REACT_ACT_ENVIRONMENT=previous;}
 hosts.forEach((host,index)=>expect([...host.childNodes]).toEqual(backups[index]));expect(doc.getElementById('example-practiceLevelPanel')).toBe(meter);button.click();expect(click).toHaveBeenCalledTimes(1);
});
