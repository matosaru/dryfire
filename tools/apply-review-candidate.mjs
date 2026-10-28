import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
function git(args){try{return execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']});}catch(error){const message=String(error.stderr||error.message).slice(0,1800).replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A');console.error('::error::Candidate preparation: '+message);throw error;}}
const patch=process.env.CANDIDATE_PATCH,ref=process.env.CANDIDATE_DESIGN_REF;
if(!patch||!/^docs\/design\/review-inputs\/[a-zA-Z0-9_.-]+\.patch$/.test(patch)||!existsSync(patch))throw Error('Expected an existing review-input patch.');
if(ref){
 if(!/^[a-f0-9]{40}$/.test(ref))throw Error('Design reference must be an immutable full commit.');
 git(['fetch','--no-tags','origin',ref]);
 // A shell-reference checkout must not roll current guide animations back to
 // another revision. GIF changes belong to the explicit source/media candidate.
 const media=git(['ls-tree','-r','--name-only',ref,'--','docs/design/screens','docs/design/baselines']).trim().split('\n').filter(path=>/\.png$/.test(path));
 if(!media.length)throw Error('Design reference contains no canonical media.');
 git(['restore','--source='+ref,'--worktree','--',...media]);
}
git(['apply','--',patch]);
