import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const workflow=readFileSync(new URL('../.github/workflows/check.yml',import.meta.url),'utf8');
const selection=workflow.split('name: Choose the accepted SEO remediation performance baseline')[1].match(/node --input-type=module -e "([^"]+)"/)[1];
test.each([['public','799b8be7a43166fa276c2311edf2f55805c2cf9b'],['preview','799b8be7a43166fa276c2311edf2f55805c2cf9b']])('actual CI selection uses the accepted %s edition baseline rather than the branch default', (edition,revision)=>{
 const output=execFileSync(process.execPath,['--input-type=module','-e',selection],{env:{...process.env,APP_EDITION:edition},encoding:'utf8'});
 expect(output.trim()).toBe('source='+revision);
});
test('an invalid matrix edition never silently compares the public baseline',()=>{
 expect(()=>execFileSync(process.execPath,['--input-type=module','-e',selection],{env:{...process.env,APP_EDITION:'invalid'},stdio:'pipe'})).toThrow();
});
