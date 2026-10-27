import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
const patch=process.env.CANDIDATE_PATCH,ref=process.env.CANDIDATE_DESIGN_REF;
if(!patch||!/^docs\/design\/review-inputs\/[a-zA-Z0-9_.-]+\.patch$/.test(patch)||!existsSync(patch))throw Error('Expected an existing review-input patch.');
if(ref){
 if(!/^[a-f0-9]{40}$/.test(ref))throw Error('Design reference must be an immutable full commit.');
 execFileSync('git',['fetch','--no-tags','origin',ref],{stdio:'inherit'});
 const media=execFileSync('git',['ls-tree','-r','--name-only',ref,'--','docs/design/screens','docs/design/baselines'],{encoding:'utf8'}).trim().split('\n').filter(path=>/\.(png|gif)$/.test(path));
 if(!media.length)throw Error('Design reference contains no canonical media.');
 execFileSync('git',['restore','--source='+ref,'--worktree','--',...media],{stdio:'inherit'});
}
execFileSync('git',['apply','--',patch],{stdio:'inherit'});
