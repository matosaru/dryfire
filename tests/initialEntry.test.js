import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const open=source.slice(source.indexOf('async function openEntry()'),source.indexOf('const gunTypeImages'));
const start=source.indexOf('  if (!activeGun || activeGun.needsDetails)',source.indexOf('  const recovered = [];'));
const entry=source.slice(start,source.indexOf('  const recoveredForGun',start));
function setup(pendingEntry,activeGun={id:'a'}){
 let release;const pending=new Promise(resolve=>{release=resolve;});
 const context={pendingEntry,activeGun,switchView:jest.fn(()=>pending),practiceController:{open:jest.fn(()=>pending)},openGunSetup:jest.fn(),setStatus:jest.fn()};
 const run=runInNewContext(`${open}\nasync function finish(){${entry}\nsetStatus('Ready');}\nfinish;`,context);
 return {run,context,release};
}
test.each([null,{view:'home'}])('returning Home does not add an initialization wait to navigation: %p',async target=>{
 const s=setup(target);const completed=s.run();await Promise.resolve();await Promise.resolve();
 expect(s.context.switchView).toHaveBeenCalledWith('home');expect(s.context.setStatus).toHaveBeenCalledWith('Ready');expect(s.context.pendingEntry).toBeNull();s.release();await completed;
});
test.each([{view:'history'},{view:'settings'},{view:'practice',mode:'par'}])('explicit non-Home deep links finish before readiness: %p',async target=>{
 const s=setup(target);const completed=s.run();await Promise.resolve();expect(s.context.setStatus).not.toHaveBeenCalled();
 if(target.mode)expect(s.context.practiceController.open).toHaveBeenCalledWith('par');else expect(s.context.switchView).toHaveBeenCalledWith(target.view);
 expect(s.context.pendingEntry).toBeNull();s.release();await completed;expect(s.context.setStatus).toHaveBeenCalledWith('Ready');
});
test.each([null,{id:'a',needsDetails:true}])('missing or incomplete profiles retain a blocked practice entry until setup: %p',async gun=>{
 const target={view:'practice',mode:'par'};const s=setup(target,gun);await s.run();expect(s.context.openGunSetup).toHaveBeenCalledWith(gun);expect(s.context.pendingEntry).toBe(target);expect(s.context.practiceController.open).not.toHaveBeenCalled();expect(s.context.switchView).not.toHaveBeenCalled();
});
test('settings remains available without a profile and still waits for its guarded route',async()=>{
 const s=setup({view:'settings'},null);const completed=s.run();await Promise.resolve();expect(s.context.switchView).toHaveBeenCalledWith('settings');expect(s.context.openGunSetup).not.toHaveBeenCalled();expect(s.context.setStatus).not.toHaveBeenCalled();s.release();await completed;expect(s.context.setStatus).toHaveBeenCalledWith('Ready');
});

test.each(['rack-trigger','mag-trigger','draw-mag-trigger'])('sequence entry initializes the exact requested preset before readiness: %s',async preset=>{
 const s=setup({view:'session',preset});s.context.getDrill=jest.fn(id=>({id,steps:['trigger']}));s.context.customDrills=[];s.context.DRILLS=[];s.context.chooseDrill=jest.fn(()=>Promise.resolve());await s.run();expect(s.context.chooseDrill).toHaveBeenCalledWith(preset);expect(s.context.practiceController.open).not.toHaveBeenCalled();expect(s.context.setStatus).toHaveBeenCalledWith('Ready');
});
test('a missing custom selection returns to Drills rather than inventing a built-in',async()=>{
 const s=setup({view:'session',preset:'custom'});s.context.getGunSetting=jest.fn(async()=> 'missing');s.context.getDrill=jest.fn(()=>null);s.context.customDrills=[];s.context.setMessage=jest.fn();const completed=s.run();await new Promise(resolve=>setImmediate(resolve));expect(s.context.switchView).toHaveBeenCalledWith('drills');s.release();await completed;expect(s.context.setMessage).toHaveBeenCalledWith(expect.stringContaining('not available'));
});
