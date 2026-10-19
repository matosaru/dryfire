/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {jest} from '@jest/globals';
import {act,fireEvent,waitFor} from '@testing-library/react';
import {renderPageTemplates} from '../tools/page-templates.mjs';
import {createCustomDrillEditor} from '../src/optional/customDrillEditor.js';
import {mountCustomDrillFields} from '../apps/web/src/app/customDrillFields.tsx';
import {editionCapabilities} from '../src/buildEdition.js';
const $=id=>document.getElementById(id);
let rendererMode='native',mountedView;
afterEach(()=>{if(mountedView)act(()=>mountedView.dispose());mountedView=null;document.body.replaceChildren();});
function setup(edition='preview'){
 document.body.innerHTML=renderPageTemplates('{{app}}');let busy=false,currentEdition=edition;
 const saved={id:'custom-existing',title:'Existing preset',steps:['draw','trigger']};
 const context={activeGun:{id:'gun-one',name:'Owned gun',type:'Handguns'},customDrills:[saved]};
 const onSave=jest.fn(async()=>{}),onError=jest.fn(),onMessage=jest.fn();
 const editor=createCustomDrillEditor({doc:document,getCapabilities:()=>editionCapabilities(currentEdition),getContext:()=>context,locked:()=>busy,titleFor:label=>label,setBusy:value=>{busy=value;},onSave,onError,onMessage});
 if(rendererMode==='react')act(()=>{mountedView=editor.connectView(mountCustomDrillFields);expect(editor.connectView(mountCustomDrillFields)).toBe(mountedView);});
 const actions={...editor,open(...args){act(()=>editor.open(...args));},reset(){act(()=>editor.reset());}};
 return{editor:actions,saved,context,onSave,onError,onMessage,lock:value=>{busy=value;},edition:value=>{currentEdition=value;},busy:()=>busy};
}
const add=label=>{$('customAction').value=label;fireEvent.click($('addCustomActionBtn'));};
const stepNames=()=>[...$('customDrillSteps').querySelectorAll('.custom-step-name')].map(node=>node.textContent);
for(const mode of ['native','react'])describe(`custom editor ${mode}`,()=>{
 beforeEach(()=>{rendererMode=mode;});
test('existing private draft reorders repeated actions and saves only the selected gun and original preset id',async()=>{const s=setup();s.editor.open(s.saved);$('customDrillName').value='Edited preset';add('trigger');fireEvent.click($('customDrillSteps').children[2].querySelector('[data-step-action="up"]'));fireEvent.click($('customDrillSteps').children[0].querySelector('[data-step-action="down"]'));expect(stepNames()).toEqual(['1. trigger','2. draw','3. trigger']);fireEvent.click($('customDrillSteps').children[2].querySelector('[data-step-action="remove"]'));fireEvent.submit($('customDrillForm'));await waitFor(()=>expect(s.onSave).toHaveBeenCalledWith({id:'custom-existing',title:'Edited preset',steps:['trigger','draw']},'gun-one'));await waitFor(()=>expect(s.busy()).toBe(false));expect($('customDrillForm')).toHaveClass('hidden');expect(s.onError).not.toHaveBeenCalled();});
test('Free keeps saved editing while denied creation leaves the existing draft intact',async()=>{const s=setup('public');s.editor.open(s.saved);$('customDrillName').value='Kept draft';s.editor.open();expect($('customDrillName').value).toBe('Kept draft');expect(s.onMessage).toHaveBeenCalledWith(expect.stringContaining('New custom drills are unavailable'));add('rack');fireEvent.submit($('customDrillForm'));await waitFor(()=>expect(s.onSave).toHaveBeenCalledWith(expect.objectContaining({id:'custom-existing',steps:['draw','trigger','rack']}),'gun-one'));});
test('new Full presets stop at 32 actions and lock boundary move/add controls',()=>{const s=setup();s.editor.open();expect($('saveCustomDrillBtn')).toBeDisabled();for(let i=0;i<32;i++)add('trigger');expect($('customDrillSteps').children).toHaveLength(32);expect($('addCustomActionBtn')).toBeDisabled();expect($('customDrillSteps').firstElementChild.querySelector('[data-step-action="up"]')).toBeDisabled();expect($('customDrillSteps').lastElementChild.querySelector('[data-step-action="down"]')).toBeDisabled();s.lock(true);fireEvent.click($('customDrillSteps').children[1].querySelector('[data-step-action="remove"]'));fireEvent.submit($('customDrillForm'));expect($('customDrillSteps').children).toHaveLength(32);expect(s.onSave).not.toHaveBeenCalled();s.lock(false);s.editor.reset();expect($('customDrillName').value).toBe('');expect($('customAction').value).toBe('draw');expect($('customDrillSteps').children).toHaveLength(0);});
test('save failures and invalid names preserve the editable draft and release the pending lock',async()=>{const s=setup();s.editor.open(s.saved);$('customDrillName').value='';fireEvent.submit($('customDrillForm'));await waitFor(()=>expect(s.onError).toHaveBeenCalledTimes(1));expect(s.onSave).not.toHaveBeenCalled();$('customDrillName').value='Retry draft';s.onSave.mockRejectedValueOnce(new Error('Storage unavailable'));fireEvent.submit($('customDrillForm'));await waitFor(()=>expect(s.onError).toHaveBeenCalledTimes(2));expect(s.busy()).toBe(false);expect($('customDrillForm')).not.toHaveClass('hidden');expect($('customDrillName').value).toBe('Retry draft');expect(stepNames()).toEqual(['1. draw','2. trigger']);});
test('Full creation saves a normalized new id without reusing another preset',async()=>{const s=setup();s.editor.open();$('customDrillName').value='New preset';add('trigger');fireEvent.submit($('customDrillForm'));await waitFor(()=>expect(s.onSave).toHaveBeenCalledWith(expect.objectContaining({id:expect.stringMatching(/^custom-/),title:'New preset',steps:['trigger']}),'gun-one'));expect(s.onSave.mock.calls[0][0].id).not.toBe(s.saved.id);expect(s.onError).not.toHaveBeenCalled();});
test('Cancel hides but retains a draft, and incomplete profiles cannot replace it',()=>{const s=setup();s.editor.open(s.saved);$('customDrillName').value='Keep on cancel';fireEvent.click($('cancelCustomDrillBtn'));expect($('customDrillForm')).toHaveClass('hidden');expect($('customDrillName').value).toBe('Keep on cancel');s.context.activeGun={...s.context.activeGun,needsDetails:true};s.editor.open();expect($('customDrillName').value).toBe('Keep on cancel');});
test('changed capability/profile guards prevent stale new-preset submissions without losing a draft',()=>{const s=setup();s.editor.open();$('customDrillName').value='New draft';add('trigger');s.edition('public');const before=stepNames();add('rack');fireEvent.click($('customDrillSteps').querySelector('[data-step-action="remove"]'));expect(stepNames()).toEqual(before);fireEvent.submit($('customDrillForm'));expect(s.onSave).not.toHaveBeenCalled();expect(s.onMessage).toHaveBeenCalledWith('New custom drills are unavailable in this public version.');s.context.activeGun=null;s.editor.open(s.saved);expect($('customDrillName').value).toBe('New draft');});

});
