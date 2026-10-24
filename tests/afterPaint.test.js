import {jest} from '@jest/globals';
import {afterPaint} from '../src/afterPaint.js';
test('optional enhancement starts only in a task after the screen frame',async()=>{
 let paint,run;const frame=jest.fn(callback=>{paint=callback;}),task=jest.fn(callback=>{run=callback;}),load=jest.fn(async()=>({ready:true}));
 const result=afterPaint(load,frame,task);expect(load).not.toHaveBeenCalled();expect(task).not.toHaveBeenCalled();paint();expect(task).toHaveBeenCalledWith(expect.any(Function),0);expect(load).not.toHaveBeenCalled();run();expect(await result).toEqual({ready:true});expect(load).toHaveBeenCalledTimes(1);
});
test.each([()=>{throw new Error('failed');},()=>Promise.reject(new Error('failed'))])('sync and async import failures stay observable',async load=>{
 await expect(afterPaint(load,callback=>callback(),callback=>callback())).rejects.toThrow('failed');
});
test('the default browser scheduling APIs preserve the same boundary',async()=>{
 const originalFrame=globalThis.requestAnimationFrame,originalTask=globalThis.setTimeout;
 globalThis.requestAnimationFrame=callback=>callback();globalThis.setTimeout=callback=>callback();
 try{expect(await afterPaint(async()=>42)).toBe(42);}finally{globalThis.requestAnimationFrame=originalFrame;globalThis.setTimeout=originalTask;}
});
