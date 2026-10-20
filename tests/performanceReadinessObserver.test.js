/** @jest-environment jsdom */
import {jest} from '@jest/globals';
import {observeReadiness} from '../tools/performance/observe-readiness.mjs';
let now, ready, originalObserver;
beforeEach(() => {
  now=0;ready=false;
  jest.spyOn(performance,'now').mockImplementation(()=>now++);
  jest.spyOn(window,'requestAnimationFrame').mockImplementation(()=>1);
  originalObserver=globalThis.PerformanceObserver;
  globalThis.PerformanceObserver=class {static supportedEntryTypes=[];};
  window.__performanceUsableScreen=()=>ready;
});
afterEach(()=>{jest.restoreAllMocks();globalThis.PerformanceObserver=originalObserver;document.body.replaceChildren();});
const mutate=async()=>{document.body.append(document.createElement('span'));await Promise.resolve();};
test.each([0,250])('readiness records once; %i ms probe stalls only after a usable screen exists', async startupStallMs => {
  observeReadiness({startupStallMs});
  await mutate();expect(window.__performanceReview.ready).toBeNull();expect(now).toBe(0);
  ready=true;await mutate();
  expect(window.__performanceReview.ready).toBe(startupStallMs ? 251 : 0);
  const recorded=window.__performanceReview.ready, calls=now;
  await mutate();expect(window.__performanceReview.ready).toBe(recorded);expect(now).toBe(calls);
});
test('ordinary readiness defaults to no synthetic delay', async () => {
  observeReadiness();ready=true;await mutate();
  expect(window.__performanceReview.ready).toBe(0);expect(now).toBe(1);
});
test('ordinary frame gaps and long-task observations remain available', async () => {
  let taskCallback, taskOptions;
  globalThis.PerformanceObserver=class {
    static supportedEntryTypes=['longtask'];
    constructor(callback){taskCallback=callback;}
    observe(options){taskOptions=options;}
  };
  observeReadiness();
  const first=window.requestAnimationFrame.mock.calls[0][0];first(10);first(26);
  taskCallback({getEntries:()=>[{duration:80},{duration:110}]});
  expect(window.__performanceReview.frameGaps).toEqual([16]);
  expect(window.__performanceReview.longTasks).toEqual([80,110]);
  expect(taskOptions).toEqual({type:'longtask'});
  ready=true;await mutate();
});
