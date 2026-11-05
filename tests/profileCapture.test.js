import {recordProfileFeature,replaceSoundProfile} from '../src/optional/profileCapture.js';
import {jest} from '@jest/globals';

test('records spectral profile data through the shared Learn-only capture',async()=>{
 const record=jest.fn(async(_status,options)=>{options.onAnalysis({spectralFeatures:[1,2,3]});return[4,5];});
 await expect(recordProfileFeature(record,jest.fn(),{noiseSuppression:true},jest.fn())).resolves.toEqual({features:[4,5],spectralFeatures:[1,2,3]});
 expect(record.mock.calls[0][1].featureExtractor).toBeInstanceOf(Function);
});

test('replaces a profile only after a successful confirmed capture',async()=>{
 const replace=jest.fn(),onExamples=jest.fn(),setStatus=jest.fn(),setMessage=jest.fn();
 await replaceSoundProfile('trigger',false,['trigger'],()=>true,label=>label==='trigger'?'Trigger pull':label,()=> 'gun-1',async action=>action(),async()=>({features:[1],spectralFeatures:[2]}),replace,async()=>[{id:'new'}],onExamples,setStatus,setMessage);
 expect(replace).toHaveBeenCalledWith('trigger',[1],'gun-1',{spectralFeatures:[2]});
 expect(onExamples).toHaveBeenCalledWith([{id:'new'}]);
 expect(setStatus).toHaveBeenCalledWith('Trigger pull profile replaced');
 expect(setMessage).toHaveBeenCalledWith(expect.stringContaining('replaced only after'));
});

test('does not capture when replacement is locked or declined',async()=>{
 const capture=jest.fn();
 const args=[['trigger',true,['trigger'],()=>true],['trigger',false,['trigger'],()=>false]];
 for(const [label,locked,labels,confirm] of args)await replaceSoundProfile(label,locked,labels,confirm,value=>value,jest.fn(),capture,jest.fn(),jest.fn(),jest.fn(),jest.fn(),jest.fn(),jest.fn());
 expect(capture).not.toHaveBeenCalled();
});
