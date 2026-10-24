import { build } from 'vite';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

// An isolated dependency lower-bound probe, never an application entry point.
const project = fileURLToPath(new URL('../../',import.meta.url));
const temporary = mkdtempSync(join(tmpdir(),'dryfire-react-shell-'));
try {
  writeFileSync(join(temporary,'index.html'),'<!doctype html><html><body><div id="root"><button type="button">Count 0</button></div><script type="module" src="/entry.js"></script></body></html>');
  writeFileSync(join(temporary,'entry.js'),`import{createElement,useState}from${JSON.stringify(resolve(project,'node_modules/react/index.js'))};import{hydrateRoot}from${JSON.stringify(resolve(project,'node_modules/react-dom/client.js'))};function Shell(){const[count,setCount]=useState(0);return createElement('button',{type:'button',onClick:()=>setCount(count+1)},'Count '+count)}hydrateRoot(document.getElementById('root'),createElement(Shell));`);
  const built = await build({configFile:false,root:temporary,logLevel:'error',build:{write:false,minify:'oxc',cssMinify:'lightningcss',sourcemap:false,target:'safari16.4'}});
  const chunks = built.output.filter(item=>item.type==='chunk');
  const baseline = JSON.parse(readFileSync(resolve(project,'docs/architecture/performance-baseline.json'))).editions.public.critical.js;
  const report = {version:1,measuredOn:'2026-10-17',kind:'Isolated interactive React hydration dependency lower bound; no application features included.',react:JSON.parse(readFileSync(resolve(project,'node_modules/react/package.json'))).version,target:'safari16.4',minifier:'oxc',sourceMaps:false,node:process.version,
    raw:chunks.reduce((n,item)=>n+Buffer.byteLength(item.code),0),gzip:chunks.reduce((n,item)=>n+gzipSync(item.code).length,0),chunkHashes:chunks.map(item=>createHash('sha256').update(item.code).digest('hex')),existingPublicCritical:{raw:baseline.raw,gzip:baseline.gzip}};
  mkdirSync('performance-results',{recursive:true});writeFileSync('performance-results/react-shell-floor.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
} finally {rmSync(temporary,{recursive:true,force:true});}
