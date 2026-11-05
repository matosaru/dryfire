import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const workflow=readFileSync(new URL('../.github/workflows/check.yml',import.meta.url),'utf8');
const selection=workflow.split('name: Choose the immutable matching application baseline')[1].match(/node --input-type=module -e "([^"]+)"/)[1];
test.each([['public','12e12fd4c4084c77b7df87b16abc6e5ee0cd5b9b'],['preview','12e12fd4c4084c77b7df87b16abc6e5ee0cd5b9b']])('actual CI selection uses the accepted %s edition baseline rather than the branch default', (edition,revision)=>{
 const output=execFileSync(process.execPath,['--input-type=module','-e',selection],{env:{...process.env,APP_EDITION:edition},encoding:'utf8'});
 expect(output.trim()).toBe('source='+revision);
});
test('an invalid matrix edition never silently compares the public baseline',()=>{
 expect(()=>execFileSync(process.execPath,['--input-type=module','-e',selection],{env:{...process.env,APP_EDITION:'invalid'},stdio:'pipe'})).toThrow();
});
