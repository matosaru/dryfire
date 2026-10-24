export function timingStatistics(values) {
  const sorted = [...values].sort((a,b)=>a-b);
  return {median:sorted[Math.floor(sorted.length/2)],p95:sorted[Math.ceil(sorted.length*.95)-1],samples:values};
}

/** Paired resampling retains runner/order covariance. The former point-only
 * p95 rule signaled even on identical code; 20 values have only one tail rank.
 * Keep its criteria, but require positive 99% interval evidence after repeats. */
export function timingEvidence(original, changed, identical = false) {
  if (original.length !== changed.length || original.length < 2 || [...original,...changed].some(value=>!Number.isFinite(value)||value<0)) throw new Error('Timing samples must be finite, nonnegative and paired.');
  const baseline=timingStatistics(original),candidate=timingStatistics(changed),count=changed.length;
  const slowerPairs=changed.filter((value,index)=>value>original[index]).length;
  const repeatedSlowdown=slowerPairs>=Math.ceil(count*.8)&&candidate.median>baseline.median;
  const slowerTail=candidate.p95>baseline.p95*1.05&&changed.filter(value=>value>baseline.p95).length>=Math.ceil(count*.2);
  let seed=0xD1F1A;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const differences={median:[],p95:[]};
  for(let run=0;run<5000;run++) {
    const before=[],after=[];
    for(let i=0;i<count;i++){const index=Math.floor(random()*count);before.push(original[index]);after.push(changed[index]);}
    const a=timingStatistics(before),b=timingStatistics(after);
    differences.median.push(b.median-a.median);differences.p95.push(b.p95-a.p95);
  }
  const interval=values=>{values.sort((a,b)=>a-b);return {lower:values[Math.floor(values.length*.005)],upper:values[Math.ceil(values.length*.995)-1]};};
  const confidence={method:'paired bootstrap 99% interval, 5000 deterministic resamples; milliseconds',median:interval(differences.median),p95:interval(differences.p95)};
  const medianConfirmed=repeatedSlowdown&&confidence.median.lower>0,tailConfirmed=slowerTail&&confidence.p95.lower>0;
  const regression=!identical&&(medianConfirmed||tailConfirmed);
  return {baseline,candidate,slowerPairs,observedSignal:repeatedSlowdown||slowerTail,confirmedSignal:medianConfirmed||tailConfirmed,
    medianConfirmed,tailConfirmed,confidence,regression,
    interpretation:identical?'Identical application assets; timing variance is diagnostic.':regression?'Confirmed timing regression: stop migration.':repeatedSlowdown||slowerTail?'Point signal not confirmed after resampling; retain uncertainty, no speedup claimed.':'No repeatable slowdown detected; no speedup claimed.'};
}
