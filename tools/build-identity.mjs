import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {execFileSync} from 'node:child_process';
const ignored=new Set(['node_modules','.git','dist','coverage']);
function files(root,dir,accept=()=>true){if(!existsSync(resolve(root,dir)))return[];return readdirSync(resolve(root,dir),{withFileTypes:true}).flatMap(entry=>entry.isDirectory()&&!ignored.has(entry.name)?files(root,`${dir}/${entry.name}`,accept):entry.isFile()&&accept(entry.name)?[`${dir}/${entry.name}`]:[]);}
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
/** Deterministic identity; no time, machine path or environment secrets. */
export function releaseIdentity(revision,sourceDigest,assets){const hash=createHash('sha256').update(revision).update('\0').update(sourceDigest);for(const[path,bytes]of Object.entries(assets).sort(([a],[b])=>a<b?-1:a>b?1:0)){hash.update('\0'+path+'\0'+bytes.length+'\0').update(bytes);}return hash.digest('hex');}
export function buildIdentity(root=process.cwd()){
 const inputs=['index.html','src/styles.css','vite.config.js','build-profile.json','package.json','package-lock.json','tools/build-identity.mjs','tools/build-profile.mjs','tools/page-templates.mjs','tools/minify-html.mjs','tools/static-catalog.mjs','tools/public-pages.mjs','tools/app-document.mjs',...['site','src','workers','apps','packages'].flatMap(dir=>files(root,dir,name=>/\.(js|html|ts|tsx|css)$/.test(name)||name==='package.json'))].sort();
 const source=createHash('sha256');for(const path of inputs){const bytes=readFileSync(resolve(root,path));source.update(path+'\0'+bytes.length+'\0').update(bytes);}
 const sourceDigest=source.digest('hex'),sourceRevision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
 const publicAssets=Object.fromEntries(files(root,'public').map(path=>['/'+relative('public',path).replaceAll('\\','/'),readFileSync(resolve(root,path))]));
 const guides=Object.fromEntries(files(root,'docs/design/screens/practice-guide/examples',name=>name.endsWith('.gif')).map(path=>['/'+path,readFileSync(resolve(root,path))]));
 return{sourceDigest,sourceRevision,release:releaseIdentity(sourceRevision,sourceDigest,{...publicAssets,...guides}),assetDigests:Object.fromEntries(Object.entries(publicAssets).map(([path,bytes])=>[path,sha(bytes)]))};
}
