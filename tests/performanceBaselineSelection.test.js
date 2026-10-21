import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const workflow=readFileSync(new URL('../.github/workflows/check.yml',import.meta.url),'utf8');
const selection=workflow.split('name: Choose the immutable matching application baseline')[1].match(/node --input-type=module -e "([^"]+)"/)[1];
test.each([['public','6c38bff81662d30279d94d41ca5c949bdbbe1c6e'],['preview','a5b76e8d524c311bcbde1dc5740b2f5d0fa8e8bd']])('actual CI selection uses %s matrix edition rather than the branch default', (edition,revision)=>{
 const output=execFileSync(process.execPath,['--input-type=module','-e',selection],{env:{...process.env,APP_EDITION:edition},encoding:'utf8'});
 expect(output.trim()).toBe('source='+revision);
});
test('an invalid matrix edition never silently compares the public baseline',()=>{
 expect(()=>execFileSync(process.execPath,['--input-type=module','-e',selection],{env:{...process.env,APP_EDITION:'invalid'},stdio:'pipe'})).toThrow();
});
