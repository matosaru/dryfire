import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const helper=new URL('../tools/apply-review-candidate.mjs',import.meta.url).pathname;
let root;
afterEach(()=>{if(root)rmSync(root,{recursive:true,force:true});});
function setup(){
 root=mkdtempSync(join(tmpdir(),'dryfire-review-'));
 const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 const put=(path,text)=>{mkdirSync(join(root,path,'..'),{recursive:true});writeFileSync(join(root,path),text);};
 git('init','-q');git('config','user.email','test@example.invalid');git('config','user.name','Candidate test');git('config','commit.gpgsign','false');git('remote','add','origin',root);
 put('src/example.js','original\n');put('docs/design/screens/example.png','current PNG');put('docs/design/screens/example.gif','current GIF');git('add','.');git('commit','-qm','current');const base=git('rev-parse','HEAD');
 put('src/example.js','unrelated review source\n');put('docs/design/screens/example.png','review PNG');put('docs/design/screens/example.gif','stale GIF');git('add','.');git('commit','-qm','references');const reference=git('rev-parse','HEAD');git('reset','--hard',base);
 const patch='docs/design/review-inputs/example.patch';put(patch,'diff --git a/src/example.js b/src/example.js\n--- a/src/example.js\n+++ b/src/example.js\n@@ -1 +1 @@\n-original\n+candidate\n');
 const run=ref=>execFileSync(process.execPath,[helper],{cwd:root,env:{...process.env,CANDIDATE_PATCH:patch,CANDIDATE_DESIGN_REF:ref},stdio:['ignore','pipe','pipe']});
 return{git,run,reference,read:path=>readFileSync(join(root,path),'utf8')};
}
test('review references update only PNGs, retain current GIF/source ownership and then apply the explicit patch',()=>{
 const s=setup();s.run(s.reference);expect(s.read('docs/design/screens/example.png')).toBe('review PNG');expect(s.read('docs/design/screens/example.gif')).toBe('current GIF');expect(s.read('src/example.js')).toBe('candidate\n');expect(s.git('diff','--cached','--name-only')).toBe('');
});
test('non-immutable review references fail before touching source or images',()=>{
 const s=setup();expect(()=>s.run('main')).toThrow();expect(s.read('docs/design/screens/example.png')).toBe('current PNG');expect(s.read('docs/design/screens/example.gif')).toBe('current GIF');expect(s.read('src/example.js')).toBe('original\n');
});
