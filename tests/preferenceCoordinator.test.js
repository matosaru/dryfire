import {jest} from '@jest/globals';
import {createPreferenceState,createPreferenceActions} from '../src/preferenceCoordinator.js';
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
function setup(){const state=createPreferenceState(),ports={read:jest.fn(id=>id==='appearance'?{value:'system'}:{checked:true}),locked:()=>state.pending,owner:()=> 'a',activeOwner:jest.fn(()=> 'a'),saveDevice:jest.fn(async()=>{}),saveGun:jest.fn(async()=>{}),render:jest.fn(),refresh:jest.fn(),applyTheme:jest.fn(),reload:jest.fn(async()=>{}),error:jest.fn(),message:jest.fn()};return{state,ports,actions:createPreferenceActions(state,ports)};}
test('pending audio writes preserve the captured previous snapshot and roll back on failure',async()=>{
 const {state,ports,actions}=setup(),write=deferred(),previous=state.audio;ports.saveGun.mockReturnValue(write.promise);
 const pending=actions.audio('noiseFilter','noiseFilter');expect(state.pending).toBe(true);expect(ports.saveGun).toHaveBeenCalledWith('audioPreferences',expect.objectContaining({noiseFilter:true}),'a');expect(previous.noiseFilter).toBe(false);
 write.reject(Error('write failed'));await pending;expect(state.audio).toBe(previous);expect(state.pending).toBe(false);expect(ports.error).toHaveBeenCalledTimes(1);expect(ports.refresh).toHaveBeenCalledTimes(2);
});
test('a completed write cannot replace another gun snapshot and locked inputs do not write',async()=>{
 const {state,ports,actions}=setup(),write=deferred();ports.saveGun.mockReturnValue(write.promise);const pending=actions.audio('noiseFilter','noiseFilter');const changed={noiseFilter:false,autoGain:true};state.audio=changed;ports.activeOwner.mockReturnValue('b');write.resolve();await pending;expect(state.audio).toBe(changed);expect(state.pending).toBe(false);expect(ports.message).not.toHaveBeenCalled();
 state.pending=true;await actions.audio('autoGainControl','autoGain');expect(ports.saveGun).toHaveBeenCalledTimes(1);
});
test('device failures preserve committed appearance and reload vibration preferences',async()=>{
 const {state,ports,actions}=setup();ports.saveDevice.mockRejectedValue(Error('offline'));await actions.appearance();expect(state.theme).toBe('dark');expect(ports.applyTheme).not.toHaveBeenCalled();
 ports.reload.mockImplementation(async()=>{state.vibration=false;});await actions.vibration();expect(ports.reload).toHaveBeenCalledTimes(1);expect(state.vibration).toBe(false);expect(ports.error).toHaveBeenCalledTimes(2);
 ports.read.mockReturnValue({value:'invalid'});await actions.appearance();expect(ports.saveDevice).toHaveBeenCalledTimes(2);
});
