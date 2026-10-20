import {jest} from '@jest/globals';
import {createModulePreparation} from '../src/modulePreparation.js';
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
const settle=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
test('first entry prepares once; completion only caches and later entries return the module',async()=>{
 const pending=deferred(),errors=jest.fn(),load=jest.fn(()=>pending.promise),prepare=createModulePreparation(errors),module={mount:jest.fn()};
 expect(prepare('practice',load)).toBeUndefined();expect(prepare('practice',load)).toBeUndefined();expect(load).toHaveBeenCalledTimes(1);
 pending.resolve(module);await settle();expect(module.mount).not.toHaveBeenCalled();expect(prepare('practice',load)).toBe(module);expect(load).toHaveBeenCalledTimes(1);expect(errors).not.toHaveBeenCalled();
});
test('different pages prepare independently without cross-page ownership',async()=>{
 const a=deferred(),b=deferred(),prepare=createModulePreparation(jest.fn());
 prepare('a',()=>a.promise);prepare('b',()=>b.promise);b.resolve({page:'b'});await settle();
 expect(prepare('b',jest.fn())).toEqual({page:'b'});expect(prepare('a',jest.fn())).toBeUndefined();a.resolve({page:'a'});await settle();expect(prepare('a',jest.fn())).toEqual({page:'a'});
});
test('failed imports report once and allow a later explicit retry',async()=>{
 const pending=deferred(),error=new Error('offline'),onError=jest.fn(),prepare=createModulePreparation(onError),load=jest.fn(()=>pending.promise);
 prepare('a',load);pending.reject(error);await settle();expect(onError).toHaveBeenCalledWith(error);
 const retry=jest.fn(async()=>({page:'a'}));expect(prepare('a',retry)).toBeUndefined();await settle();expect(prepare('a',retry)).toEqual({page:'a'});expect(retry).toHaveBeenCalledTimes(1);
});
