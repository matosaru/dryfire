import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGE_DEFINITIONS } from '../src/pageDefinitions.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const errors = [];
const require = (condition, message) => { if (!condition) errors.push(message); };
const folders = ['packages/ui/src', 'apps/web/src/pages'];
const imports = text => [...text.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
let components = 0;
for (const base of folders) {
  for (const entry of readdirSync(resolve(root, base), { withFileTypes: true }).filter(e => e.isDirectory())) {
    const path = `${base}/${entry.name}`, name = entry.name;
    components++;
    for (const suffix of ['.tsx', '.css', '.test.tsx']) require(existsSync(resolve(root, `${path}/${name}${suffix}`)), `${path}: missing ${name}${suffix}`);
    require(existsSync(resolve(root, `${path}/index.ts`)), `${path}: missing public entry`);
    const source = read(`${path}/${name}.tsx`);
    if (base.startsWith('packages/ui')) {
      require(!imports(source).some(s => s.startsWith('@dryfire/web') || s.startsWith('.') && !resolve(root, path, s).startsWith(resolve(root, 'packages/ui/src') + '/')), `${path}: shared UI imports app/private implementation`);
      require(!/\b(?:getUserMedia|indexedDB|localStorage)\b/.test(source), `${path}: shared UI acquires platform services`);
    }
    require(!source.includes('dangerouslySetInnerHTML'), `${path}: use typed composition instead of injected page HTML`);
    require(read(`${path}/index.ts`).includes(`./${name}`), `${path}: public entry does not export its component`);
  }
}
const inventory = JSON.parse(read('docs/architecture/component-map.json'));
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
