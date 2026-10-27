/** @jest-environment jsdom */
import {jest} from '@jest/globals';
import {createGunLibraryCoordinator} from '../src/gunLibraryCoordinator.js';
const deferred=()=>{let resolve;const promise=new Promise(yes=>{resolve=yes;});return{promise,resolve};};
function setup(){
 document.body.innerHTML='<form id="gunForm"><input id="gunName"><input id="gunType" value="Handguns"><input name="gunTypeChoice" type="radio" value="Handguns"><p id="gunSetupTitle"></p><p id="gunSetupDescription"></p><button id="saveGunBtn"></button><button id="cancelGunSetupBtn"></button><p id="gunCapacityNotice"></p></form><input id="safetyAck" type="checkbox" checked>';
 const gun={id:'a',name:'First',type:'Handguns'},other={id:'b',name:'Second',type:'Handguns'};let busy=false,selected='a';
 const state={guns:[gun,other],gun,capabilities:{edition:'public',gunCreationLimit:2},loading:false,events:Promise.resolve(),session:{flush:jest.fn(async()=>{}),hasUnsavedResults:()=>false},practice:{flush:jest.fn(async()=>{}),hasUnsavedResults:()=>false},pendingEntry:null,pages:null};
 const page={update:jest.fn(),setLocked:jest.fn()},setupPage={reset:jest.fn(),setSaving:jest.fn(),setNotice:jest.fn()},pages={mountGunsPage:jest.fn(()=>page),mountGunSetupPage:jest.fn(()=>setupPage)};
 const store={getGuns:jest.fn(async()=>state.guns),getExamples:jest.fn(async()=>[{label:'trigger'},{label:'trigger'},{label:'trigger'}]),getCustomDrills:jest.fn(async()=>[]),deleteGun:jest.fn(async id=>{state.guns=state.guns.filter(gun=>gun.id!==id);}),setActiveGun:jest.fn(async id=>{selected=id;}),updateGun:jest.fn(async()=>{}),createGun:jest.fn(async()=>{})};
 const ui={document,$:id=>document.querySelector(id),profileLocked:()=>busy||state.loading,setMessage:jest.fn(),switchView:jest.fn(),loadProfilePages:jest.fn(async()=>pages),showError:jest.fn(),setBusy:jest.fn(value=>{busy=value;}),loadActiveGun:jest.fn(async()=>{state.gun=state.guns.find(gun=>gun.id===selected)??null;}),setStatus:jest.fn(),openEntry:jest.fn(async()=>{}),renderGunControls:jest.fn(),renderLiveButton:jest.fn(),renderClassCards:jest.fn(),gunImagePath:()=>'/gun.svg',confirm:jest.fn(()=>true)};
 return{state,store,ui,page,setupPage,pages,api:createGunLibraryCoordinator(state,store,ui),busy:()=>busy};
}
test('invalidating pending library reads prevents stale rows from mounting',async()=>{
 const s=setup(),read=deferred(),original=s.state.guns;s.store.getGuns.mockReturnValueOnce(read.promise);const pending=s.api.render();s.api.invalidate();read.resolve([{id:'stale'}]);await pending;expect(s.state.guns).toBe(original);expect(s.ui.loadProfilePages).not.toHaveBeenCalled();
 await s.api.render();expect(s.pages.mountGunsPage).toHaveBeenCalledTimes(1);expect(s.pages.mountGunsPage.mock.calls[0][1].rows[0]).toMatchObject({triggerReady:true,optionalReady:0,samples:3});expect(s.api.syncLocked()).toBe(true);expect(s.page.setLocked).toHaveBeenCalledWith(false);
});
test('selection waits for durable work, resets safety and releases its lock on success or failure',async()=>{
 const s=setup();await s.api.select('b');expect(s.store.setActiveGun).toHaveBeenCalledWith('b');expect(s.state.gun.id).toBe('b');expect(document.getElementById('safetyAck').checked).toBe(false);expect(s.state.loading).toBe(false);expect(s.ui.switchView).toHaveBeenCalledWith('home');
 s.state.session.flush.mockRejectedValue(Error('save failed'));await expect(s.api.select('a')).rejects.toThrow('save failed');expect(s.state.loading).toBe(false);expect(s.store.setActiveGun).toHaveBeenCalledTimes(1);
});
test('late unsaved results and cancellation prevent deletion; busy state always clears',async()=>{
 const s=setup();s.ui.confirm.mockReturnValueOnce(false);await s.api.remove(s.state.gun);expect(s.store.deleteGun).not.toHaveBeenCalled();
 s.state.session.flush.mockImplementation(async()=>{s.state.session.hasUnsavedResults=()=>true;});await expect(s.api.remove(s.state.gun)).rejects.toThrow(/not saved/);expect(s.store.deleteGun).not.toHaveBeenCalled();expect(s.busy()).toBe(false);
});
test('creation limits preserve native drafts and editing keeps one setup owner',async()=>{
 const s=setup();document.getElementById('gunName').value='Unfinished';s.api.open();expect(document.getElementById('gunName').value).toBe('Unfinished');expect(s.ui.setMessage).toHaveBeenCalledWith(expect.stringContaining('cannot create another gun'));
 s.state.pages=s.pages;s.api.open(s.state.gun);s.api.open(s.state.gun);expect(s.pages.mountGunSetupPage).toHaveBeenCalledTimes(1);expect(s.setupPage.reset).toHaveBeenCalledTimes(1);document.getElementById('gunName').value='  Renamed  ';await s.api.submit({preventDefault:jest.fn()});expect(s.store.updateGun).toHaveBeenCalledWith('a',{name:'Renamed',type:'Handguns'});expect(s.store.createGun).not.toHaveBeenCalled();expect(s.setupPage.setSaving.mock.calls).toEqual([[true],[false]]);expect(s.busy()).toBe(false);
});
