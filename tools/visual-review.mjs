import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { cases, baselineName } from '../visual-tests/catalog.js';
const environment = JSON.parse(readFileSync('visual-tests/environment.json'));
const paths = ['chromium', 'webkit'].flatMap(browser => cases.map(item => `${browser}/${baselineName(item)}`));
const root = 'docs/design/baselines';
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(`${dir}/${item.name}`) : [`${dir}/${item.name}`]);
const actual = walk(root).filter(path => path.endsWith('.png')).map(path => path.slice(root.length + 1));
if (JSON.stringify([...paths].sort()) !== JSON.stringify(actual.sort())) throw new Error('Missing or unowned visual baselines.');
const images = Object.fromEntries(paths.map(path => {
  const bytes = readFileSync(`${root}/${path}`);
  if (!bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error(`Invalid PNG: ${path}`);
  return [path, { sha256: createHash('sha256').update(bytes).digest('hex'), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }];
}));
const manifest = JSON.stringify({ environment, images }, null, 2) + '\n';
const path = `${root}/manifest.json`;
if (process.argv.includes('--write')) {
  if (process.env.CI) throw new Error('CI cannot accept new baseline fingerprints.');
  writeFileSync(path, manifest); console.log(`Recorded ${paths.length} reviewed baseline fingerprints.`);
} else {
  if (!existsSync(path) || readFileSync(path, 'utf8') !== manifest) throw new Error('Baselines changed without review; review images and run npm run visual:review -- --write.');
  console.log(`Visual coverage verified: ${cases.length} states/widths × 2 browsers, exact matching enabled.`);
}
