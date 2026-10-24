import {jest} from '@jest/globals';
import {createPracticeGuideBridge} from '../src/practiceGuideBridge.js';
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
function setup(){
 const pending=deferred(),controller={open:jest.fn(),pause:jest.fn(),current:jest.fn(()=>({contextKey:'practice:a'})),connectView:jest.fn(()=>true),connectPage:jest.fn(()=>true)};
 const factory=jest.fn(()=>controller),load=jest.fn(()=>pending.promise),onNavigate=jest.fn(),onError=jest.fn(),onBack=jest.fn();
 const bridge=createPracticeGuideBridge({load,onNavigate,onError,onBack});let context={gunId:'gun',routeKey:'a',type:'practice',config:{repetitions:10}};
 return {pending,controller,factory,load,onNavigate,onError,onBack,bridge,resolve:()=>context,set:value=>{context=value;},module:{createPracticeGuideController:factory}};
}
test('prefetch deduplicates and caches without acquiring a controller or touching DOM/navigation',async()=>{
 const s=setup(),a=s.bridge.prepare(),b=s.bridge.prepare();expect(a).toBe(b);expect(s.bridge.current()).toBeNull();expect(s.bridge.connectPage(()=>{})).toBe(false);expect(s.bridge.connectView(()=>{})).toBe(false);
 s.pending.resolve(s.module);await a;expect(await s.bridge.prepare()).toBe(s.module);expect(s.load).toHaveBeenCalledTimes(1);expect(s.factory).not.toHaveBeenCalled();expect(s.onNavigate).not.toHaveBeenCalled();
});
test('an explicit open reads fresh setup after loading, creates once and retains all controller ports',async()=>{
 const s=setup(),open=s.bridge.open(s.resolve);s.set({...s.resolve(),config:{repetitions:20}});s.pending.resolve(s.module);expect(await open).toBe(true);
 expect(s.controller.open).toHaveBeenCalledWith(s.resolve());expect(s.factory).toHaveBeenCalledWith({onBack:s.onBack});expect(s.onNavigate).toHaveBeenCalledTimes(1);
 expect(s.bridge.current()).toEqual({contextKey:'practice:a'});const mount=()=>{};expect(s.bridge.connectView(mount)).toBe(true);expect(s.bridge.connectPage(mount)).toBe(true);s.bridge.pause();expect(s.controller.pause).toHaveBeenCalled();
 expect(await s.bridge.open(s.resolve)).toBe(true);expect(s.factory).toHaveBeenCalledTimes(1);
});
test.each(['cancel','gun','route','type','locked'])('late loading cannot open an obsolete or locked setup: %s',async kind=>{
 const s=setup(),open=s.bridge.open(s.resolve);
 if(kind==='cancel')s.bridge.pause();else if(kind==='locked')s.set(null);else s.set({...s.resolve(),[kind==='gun'?'gunId':kind==='route'?'routeKey':'type']:'changed'});
 s.pending.resolve(s.module);expect(await open).toBe(false);expect(s.factory).not.toHaveBeenCalled();expect(s.onNavigate).not.toHaveBeenCalled();
});
test('only the latest explicit click can open a shared pending import',async()=>{
 const s=setup(),a=s.bridge.open(s.resolve),b=s.bridge.open(s.resolve);s.pending.resolve(s.module);expect(await a).toBe(false);expect(await b).toBe(true);expect(s.onNavigate).toHaveBeenCalledTimes(1);
});
test('failed open retains setup, reports, and retries on a later click',async()=>{
 const s=setup(),open=s.bridge.open(s.resolve),error=new Error('chunk unavailable');s.pending.reject(error);expect(await open).toBe(false);expect(s.onError).toHaveBeenCalledWith(expect.objectContaining({cause:error,message:expect.stringContaining('Your setup is unchanged')}));expect(s.onNavigate).not.toHaveBeenCalled();
 s.load.mockResolvedValue(s.module);expect(await s.bridge.open(s.resolve)).toBe(true);expect(s.load).toHaveBeenCalledTimes(2);
});
test('cancelled load errors never repaint a later route',async()=>{
 const s=setup(),open=s.bridge.open(s.resolve);s.bridge.pause();s.pending.reject(new Error('offline'));expect(await open).toBe(false);expect(s.onError).not.toHaveBeenCalled();
});
test('invalid initial ownership never loads and controller errors preserve the parent',async()=>{
 const s=setup();s.set(null);expect(await s.bridge.open(s.resolve)).toBe(false);expect(s.load).not.toHaveBeenCalled();
 s.set({gunId:'gun',routeKey:'a',type:'practice'});s.pending.resolve(s.module);s.controller.open.mockImplementation(()=>{throw new Error('bad guide');});expect(await s.bridge.open(s.resolve)).toBe(false);expect(s.onError).toHaveBeenCalledWith(expect.objectContaining({message:'bad guide'}));expect(s.onNavigate).not.toHaveBeenCalled();
});

test('an import error from an old gun cannot overwrite another gun’s setup',async()=>{
 const s=setup(),open=s.bridge.open(s.resolve);s.set({...s.resolve(),gunId:'other'});s.pending.reject(new Error('offline'));expect(await open).toBe(false);expect(s.onError).not.toHaveBeenCalled();
});
test('the real default module can be prepared in Node without creating DOM or capture owners',async()=>{
 const bridge=createPracticeGuideBridge({onBack:jest.fn(),onNavigate:jest.fn(),onError:jest.fn()});
 expect(typeof(await bridge.prepare()).createPracticeGuideController).toBe('function');expect(bridge.current()).toBeNull();
});
