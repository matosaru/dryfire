import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGE_DEFINITIONS } from '../src/pageDefinitions.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const errors = [];
const require = (condition, message) => { if (!condition) errors.push(message); };
const folders = ['packages/ui/src', 'apps/web/src/pages', 'apps/web/src/public-site'];
for(const feature of readdirSync(resolve(root,'apps/web/src/features'),{withFileTypes:true}).filter(entry=>entry.isDirectory())){
 const components=`apps/web/src/features/${feature.name}/components`;
 if(existsSync(resolve(root,components)))folders.push(components);
}
const imports = text => [...text.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
let components = 0;
const packageRows=[];
for (const base of folders) {
  for (const entry of readdirSync(resolve(root, base), { withFileTypes: true }).filter(e => e.isDirectory())) {
    const path = `${base}/${entry.name}`, name = entry.name;
    components++;
    packageRows.push({name,source:`${path}/${name}.tsx`,css:`${path}/${name}.css`,tests:`${path}/${name}.test.tsx`,entry:`${path}/index.ts`});
    for (const suffix of ['.tsx', '.css', '.test.tsx']) require(existsSync(resolve(root, `${path}/${name}${suffix}`)), `${path}: missing ${name}${suffix}`);
    require(existsSync(resolve(root, `${path}/index.ts`)), `${path}: missing public entry`);
    const source = read(`${path}/${name}.tsx`);
    if (base.startsWith('packages/ui')) {
      require(!imports(source).some(s => s.startsWith('@dryfire/web') || s.startsWith('.') && !resolve(root, path, s).startsWith(resolve(root, 'packages/ui/src') + '/')), `${path}: shared UI imports app/private implementation`);
      require(!/\b(?:getUserMedia|indexedDB|localStorage)\b/.test(source), `${path}: shared UI acquires platform services`);
    }
    if(base.includes('/features/')){
      const owner=resolve(root,base.split('/components')[0])+'/';
      require(!imports(source).some(value=>value.startsWith('@dryfire/web')||value.startsWith('.')&&!resolve(root,path,value).startsWith(owner)&&!resolve(root,path,value).startsWith(resolve(root,'packages/ui/src')+'/')),`${path}: feature presentation imports another application owner`);
      require(!/\b(?:getUserMedia|indexedDB|localStorage)\b/.test(source),`${path}: feature presentation acquires platform services`);
    }
    require(!source.includes('dangerouslySetInnerHTML'), `${path}: use typed composition instead of injected page HTML`);
    require(read(`${path}/index.ts`).includes(`./${name}`), `${path}: public entry does not export its component`);
  }
}
// Validation/engines stay independent of IndexedDB, microphone and UI adapters.
const pureFiles=['storage/constants','storage/validation','storage/sessionValidation','storage/backupValidation','featureFormat','classifier','calibration','drills','drillSession','practiceSession','practiceModes','startCueProfile','evaluation','inputLimits'].map(name=>'src/'+name+'.js');
const pureSet=new Set(pureFiles.map(path=>resolve(root,path))),visiting=new Set(),visited=new Set();
function checkPure(path){
 if(visiting.has(path)){require(false,`Pure dependency cycle: ${path}`);return;}
 if(visited.has(path))return;visiting.add(path);
 const source=readFileSync(path,'utf8');
 require(!/\b(?:indexedDB|getUserMedia|localStorage|document|window)\b/.test(source),`${path}: pure module acquires platform services`);
 for(const dependency of imports(source)){
  const target=resolve(dirname(path),dependency);require(pureSet.has(target),`${path}: pure module imports external owner ${dependency}`);
  if(pureSet.has(target))checkPure(target);
 }
 visiting.delete(path);visited.add(path);
}
for(const path of pureSet)checkPure(path);
const inventory = JSON.parse(read('docs/architecture/component-map.json'));
packageRows.sort((a,b)=>a.source<b.source?-1:a.source>b.source?1:0);
if(process.argv.includes('--write')&&!errors.length){inventory.componentPackages=packageRows;writeFileSync(resolve(root,'docs/architecture/component-map.json'),JSON.stringify(inventory,null,2)+'\n');}
require(JSON.stringify(inventory.componentPackages)===JSON.stringify(packageRows),'Complete component map is stale; run npm run docs:generate.');
require(inventory.screens.length === PAGE_DEFINITIONS.length, 'Component inventory does not cover all screens');
for (const {id} of PAGE_DEFINITIONS) {
  const rows = inventory.screens.filter(row => row.id === id);
  require(rows.length === 1, `${id}: inventory owner must be unique`);
  for (const row of rows) {
    require(existsSync(resolve(root, row.source)), `${id}: owner source does not exist`);
    require(row.behaviorTests.length > 0, `${id}: no behavior test mapping`);
    for (const test of row.behaviorTests) require(existsSync(resolve(root, test)), `${id}: missing behavior test ${test}`);
    require(['legacy', 'react'].includes(row.renderer), `${id}: unknown renderer`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`${components} isolated component/page packages and ${inventory.screens.length} screen ownership/test mappings verified.`);
