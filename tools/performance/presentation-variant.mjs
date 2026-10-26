// Diagnostic artifact ablation only. Never use its output for release acceptance.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
export function presentationVariant(production,candidate,mode){
 if(!['css','shell'].includes(mode))throw Error('Unknown presentation variant');
 const css=html=>{const matches=[...html.matchAll(/<link\b[^>]*href="(\/assets\/[^"?]+\.css)"[^>]*>/g)];if(matches.length!==1)throw Error('Expected one application stylesheet');return matches[0][1];};
 const a=readFileSync(resolve(production,'index.html'),'utf8');let b=readFileSync(resolve(candidate,'index.html'),'utf8');
 const from=css(a),to=css(b);
 writeFileSync(resolve(candidate,'.'+to),readFileSync(resolve(production,'.'+from)));
 if(mode==='shell')for(const tag of ['header','footer']){
  const pattern=new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`,'g'),sources=[...a.matchAll(pattern)],targets=[...b.matchAll(pattern)];
  if(sources.length!==1||targets.length!==1)throw Error(`Expected one ${tag}`);
  b=b.replace(pattern,()=>sources[0][0]);
 }
 writeFileSync(resolve(candidate,'index.html'),b);
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname)presentationVariant(...process.argv.slice(2));
