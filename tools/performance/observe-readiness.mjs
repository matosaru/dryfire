/** Browser-serialized observer; the nonzero delay is exclusive to the deliberate regression control. */
export function observeReadiness({ startupStallMs = 0 } = {}) {
  window.__performanceReview = {ready:null,longTasks:[],frameGaps:[]};
  let previous;
  const frame = now => { if(previous !== undefined) window.__performanceReview.frameGaps.push(now-previous); previous=now; requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
  const observer = new MutationObserver(()=>{
    if (window.__performanceUsableScreen(document)) {
      // A pre-network init stall can overlap resource loading and fail
      // to exercise readiness. This candidate-only control blocks the
      // UI thread at the usable-screen boundary before its next paint.
      if (startupStallMs) {
        const until = performance.now() + startupStallMs;
        while (performance.now() < until) { /* Deliberate control only. */ }
      }
      window.__performanceReview.ready = performance.now(); observer.disconnect();
    }
  });
  observer.observe(document,{subtree:true,childList:true,characterData:true,attributes:true});
  if (PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
    new PerformanceObserver(list=>window.__performanceReview.longTasks.push(...list.getEntries().map(entry=>entry.duration))).observe({type:'longtask'});
  }
}
