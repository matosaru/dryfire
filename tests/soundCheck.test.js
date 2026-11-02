import {createSoundCheck,beginSoundCheckAttempt,recordSoundCheckDetection,finishSoundCheckAttempt,buildSoundCheckReport} from '../src/soundCheck.js';

test('labelled attempts count matches, misses, duplicates and false trigger shots',()=>{
 let check=createSoundCheck({attempts:3,metadata:{room:'normal',distance:'practice'}});
 check=beginSoundCheckAttempt(check,0);
 check=recordSoundCheckDetection(check,{label:'trigger',score:80},{label:'trigger',score:84},100,{v2:Array(15).fill(.1),v3:Array(23).fill(.2)});
 check=recordSoundCheckDetection(check,{label:'trigger',score:77},{label:null,score:40},140);
 check=finishSoundCheckAttempt(check,{actualLabel:'trigger',startedAt:0,endedAt:1000});
 check=beginSoundCheckAttempt(check,1000);
 check=finishSoundCheckAttempt(check,{actualLabel:'trigger',startedAt:1000,endedAt:2000});
 check=beginSoundCheckAttempt(check,2000);
 check=recordSoundCheckDetection(check,{label:'trigger',score:91},{label:'trigger',score:90},2200);
 check=finishSoundCheckAttempt(check,{actualLabel:'other',startedAt:2000,endedAt:3000});
 const report=buildSoundCheckReport(check,{appVersion:'test',device:'iPhone Safari'});
 expect(report).toMatchObject({format:'dryfire-sound-check',version:1,targetAttempts:3,metadata:{room:'normal',distance:'practice',appVersion:'test',device:'iPhone Safari'}});
 expect(report.summary.v2).toEqual({expectedTriggers:2,matchedTriggers:1,misses:1,falseShots:1,duplicates:1});
 expect(report.summary.v3).toEqual({expectedTriggers:2,matchedTriggers:1,misses:1,falseShots:1,duplicates:0});
 expect(report.attempts).toHaveLength(3);
 expect(report.attempts[0].detections[0].features).toEqual({v2:{version:2,values:Array(15).fill(.1)},v3:{version:3,values:Array(23).fill(.2)}});
 expect(JSON.stringify(report)).not.toMatch(/pcm|samples|gunName/i);
});

test('detections outside an open attempt are ignored and reports reject unfinished checks',()=>{
 const check=createSoundCheck({attempts:1});
 expect(recordSoundCheckDetection(check,{label:'trigger'},null,10)).toBe(check);
 expect(()=>buildSoundCheckReport(check)).toThrow(/complete/i);
 expect(()=>createSoundCheck({attempts:0})).toThrow(RangeError);
 expect(()=>finishSoundCheckAttempt(check,{actualLabel:'invalid'})).toThrow(TypeError);
});
