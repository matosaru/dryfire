import {jest} from '@jest/globals';
import {validateBackup} from '../src/storage/backupValidation.js';
import {normalizeMaxResults,validGunDetails,validatePracticeSetting} from '../src/storage/validation.js';
import {validateSession} from '../src/storage/sessionValidation.js';
const gun={id:'g',name:'Training gun',type:'Handguns',needsDetails:false,createdAt:1};
const backup=()=>({format:'sound-trainer-backup',version:4,featureVersion:2,guns:[{...gun}],activeGunId:'g',settings:{appearance:'dark'},gunSettings:[],examples:[],events:[],sessions:[]});
test('pure backup normalization detaches records without opening the database',()=>{
 const input=backup(),before=structuredClone(input),open=jest.spyOn(indexedDB,'open');
 try{const normalized=validateBackup(input,()=>{throw Error('No legacy gun expected');},()=>7);normalized.guns[0].name='Changed';normalized.settings.appearance='light';expect(input).toEqual(before);expect(open).not.toHaveBeenCalled();}finally{open.mockRestore();}
});
test('legacy conversion obtains identity and missing times only from supplied factories',()=>{
 const create=jest.fn(()=>({id:'legacy',name:'',type:null,needsDetails:true,createdAt:1})),clock=jest.fn(()=>7);
 const value=validateBackup({format:'sound-trainer-backup',version:1,featureVersion:2,examples:[],events:[{id:'event',label:'trigger',score:50}]},create,clock);
 expect(create).toHaveBeenCalledTimes(1);expect(clock).toHaveBeenCalledTimes(1);expect(value.activeGunId).toBe('legacy');expect(value.events[0]).toMatchObject({gunId:'legacy',createdAt:7});
});
test('invalid owners and session identities are rejected before any persistence work',()=>{
 const input=backup();input.events=[{id:'event',gunId:'another',label:'trigger',score:50,createdAt:1}];expect(()=>validateBackup(input,()=>null,()=>7)).toThrow(/unknown gun owner/);expect(()=>validateSession({},'g')).toThrow(/Invalid saved drill session/);
 expect(()=>validatePracticeSetting('practiceConfig',{unsupported:{}})).toThrow(/Invalid practice mode/);
});
test.each([[NaN,50],[-2,1],[1000,500],[3.9,3]])('existing normalization preserves %s → %s',(input,expected)=>expect(normalizeMaxResults(input)).toBe(expected));
test('gun details preserve trimming and existing validation errors',()=>{expect(validGunDetails('  Trainer  ','Handguns')).toEqual({name:'Trainer',type:'Handguns'});expect(()=>validGunDetails('', 'Handguns')).toThrow(/1–80/);});
test('sequence-event backups retain outcomes and reject invalid outcomes before mutation',()=>{const input=backup();input.events=[{id:'event',gunId:'g',label:'trigger',score:70,createdAt:1,drillId:'saved-sequence',drillTitle:'Saved sequence',drillSteps:['rack','trigger'],drillOutcome:'completed',drillPosition:1,drillCompleted:true}];expect(validateBackup(input,()=>null,()=>7).events[0]).toMatchObject({drillOutcome:'completed',drillSteps:['rack','trigger']});input.events[0].drillOutcome='invalid';expect(()=>validateBackup(input,()=>null,()=>7)).toThrow(/invalid drill metadata/);});
