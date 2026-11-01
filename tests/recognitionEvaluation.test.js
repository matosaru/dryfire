import { evaluateRecognitionCorpus, compareRecognitionCorpus } from '../src/recognitionEvaluation.js';

const event=(id,expected,baselineCount,candidateCount,onsetMs=100,baselineOnsetMs=onsetMs,candidateOnsetMs=onsetMs)=>({id,expected,onsetMs,baseline:{count:baselineCount,onsetMs:baselineOnsetMs},candidate:{count:candidateCount,onsetMs:candidateOnsetMs}});

test('evaluation reports recall, false shots, duplicates and timing error without probability claims',()=>{
 const rows=[event('t1','trigger',1,1),event('t2','trigger',0,2,100,undefined,112),event('n1','negative',0,1),event('n2','negative',0,0)];
 expect(evaluateRecognitionCorpus(rows,'candidate')).toEqual({triggerEvents:2,negativeEvents:2,recognizedTriggers:2,missedTriggers:0,falseShots:1,duplicateShots:1,triggerRecall:1,falseShotRate:.5,duplicateRate:.5,meanAbsoluteTimingErrorMs:6});
});

test('paired comparison counts improvements and regressions on the same event IDs',()=>{
 const result=compareRecognitionCorpus([event('t1','trigger',0,1),event('t2','trigger',1,0),event('t3','trigger',0,1),event('n1','negative',0,0)]);
 expect(result.pairedTriggerChanges).toEqual({improved:2,regressed:1,unchanged:0});
 expect(result.candidate.triggerRecall-result.baseline.triggerRecall).toBeCloseTo(1/3);
});

test('invalid or duplicate labelled events are rejected',()=>{
 expect(()=>evaluateRecognitionCorpus([], 'candidate')).toThrow(/non-empty/i);
 expect(()=>compareRecognitionCorpus([event('same','trigger',1,1),event('same','negative',0,0)])).toThrow(/unique/i);
 expect(()=>evaluateRecognitionCorpus([{id:'x',expected:'unknown',candidate:{count:0}}],'candidate')).toThrow(/label/i);
});
