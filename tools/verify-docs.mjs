import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, relative, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { PRACTICE_MODES } from '../src/practiceSession.js';
import { renderPageTemplates } from './page-templates.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mapPath = 'docs/architecture/screen-map.json';
const read = path => readFileSync(resolve(root, path), 'utf8');
const digest = path => createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex');
const registry = JSON.parse(read(mapPath));
const screens = registry.screens;
const entries = [...screens, ...registry.shared];
const args = process.argv.slice(2);
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const local = path => !path.startsWith('/') && !path.split('/').includes('..') && existsSync(resolve(root, path));

if (args.includes('--review')) {
  for (const path of Object.keys(registry.reviewedSources)) registry.reviewedSources[path] = digest(path);
  registry.reviewedOn = new Date().toISOString().slice(0, 10);
  writeFileSync(resolve(root, mapPath), JSON.stringify(registry, null, 2) + '\n');
  console.log('Recorded current UI/navigation source fingerprints. Review affected requirements, designs and captures before committing.');
  process.exit(0);
}

const html = renderPageTemplates(read('index.html'));
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const views = [...html.matchAll(/<section\b[^>]*\bid="([^"]+View)"[^>]*\bclass="[^"]*\bview\b/g)].map(m => m[1]);
check(same(views, screens.map(s => s.domId)), 'HTML functional views differ from the screen registry; update architecture/design coverage.');
check(new Set(entries.map(s => s.id)).size === entries.length, 'Duplicate screen/shared IDs in registry.');
check(new Set(entries.map(s => s.design)).size === entries.length, 'Two screens share a current design document.');
check(same(registry.publicPaths, ['/']), 'Public paths changed; review actual routes and proposed SEO templates together.');
check(registry.publicOrigin === 'https://dryfire.matosaru.workers.dev', 'Public origin changed; review canonical, storage and indexing scope.');
check(same(screens.find(s => s.id === 'practice')?.modes ?? [], PRACTICE_MODES.map(m => m.id)), 'Practice mode definitions differ from documented configurations.');
for (const [path, hash] of Object.entries(registry.reviewedSources)) {
  check(local(path) && digest(path) === hash, `${path}: source changed since the screen audit; review affected docs/images, then run docs:review.`);
}
const declaredIds = new Set(screens.map(s => s.id));
const images = new Set();
const hashes = new Map();
for (const screen of entries) {
  check(ids.has(screen.domId), `${screen.id}: missing app anchor ${screen.domId}.`);
  check(!screen.parent || declaredIds.has(screen.parent), `${screen.id}: unknown parent screen.`);
  // Detect cycles instead of silently omitting disconnected branches from the generated tree.
  const visited = new Set([screen.id]);
  let parent = screen.parent;
  while (parent) {
    check(!visited.has(parent), `${screen.id}: cycle in parent tree.`);
    if (visited.has(parent)) break;
    visited.add(parent);
    parent = screens.find(s => s.id === parent)?.parent;
  }
  check(screen.design === `docs/design/screens/${screen.folder}/README.md`, `${screen.id}: design path must follow screen naming convention.`);
  check(local(screen.design), `${screen.id}: missing design document ${screen.design}.`);
  check(screen.states?.length > 0 && screen.requirements?.length > 0, `${screen.id}: missing design states or functional specifications.`);
  const text = local(screen.design) ? read(screen.design) : '';
  for (const spec of screen.requirements ?? []) {
    check(local(spec) && spec.startsWith('docs/requirements/'), `${screen.id}: missing/noncanonical functional specification ${spec}.`);
    const target = relative(dirname(resolve(root, screen.design)), resolve(root, spec)).split(sep).join('/');
    check(text.includes(`](${target})`), `${screen.id}: design Markdown does not link its mapped specification ${spec}.`);
  }
  for (const state of screen.states ?? []) {
    check(state.edition === undefined || ['public', 'preview'].includes(state.edition), `${screen.id}/${state.key}: invalid build edition.`);
    check(ids.has(state.anchor), `${screen.id}/${state.key}: missing state anchor ${state.anchor}.`);
    check(state.image === `docs/design/screens/${screen.folder}/${state.key}.png` && /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:dark|light)$/.test(state.key), `${screen.id}: invalid current state/image naming: ${state.key}.`);
    check(!images.has(state.image), `Duplicate current image path: ${state.image}.`);
    images.add(state.image);
    check(local(state.image), `${screen.id}: missing screenshot ${state.image}.`);
    check(text.includes(`](${state.key}.png)`), `${screen.id}: screenshot ${state.key} is absent from its Markdown.`);
    if (local(state.image)) {
      const bytes = readFileSync(resolve(root, state.image));
      check(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && bytes.length > 100, `Invalid PNG: ${state.image}.`);
      const hash = digest(state.image);
      check(!hashes.has(hash), `Byte-identical current screenshots: ${hashes.get(hash)} / ${state.image}.`);
      hashes.set(hash, state.image);
    }
  }
}
function walk(dir, extensions) {
  return readdirSync(resolve(root, dir), {withFileTypes:true}).flatMap(entry => {
    if (['.git', 'node_modules', 'dist', 'coverage', '.codex', '.agents'].includes(entry.name)) return [];
    const path = dir ? `${dir}/${entry.name}` : entry.name;
    return entry.isDirectory() ? walk(path, extensions) : extensions.includes(extname(path)) ? [path] : [];
  });
}
check(same(walk('docs/design/screens', ['.png']), images), 'Current PNG files differ from registered state images (missing or unowned capture).');

const link = (label, path) => `[${label}](${relative(resolve(root, 'docs/architecture'), resolve(root, path)).split(sep).join('/')})`;
const treeLines = ['```text', '/', '├── First-use gate'];
const setup = screens.find(s => s.id === 'gunSetup');
treeLines.push(`│   └── ${setup.title} [${setup.id}]`);
const append = (screen, prefix, last) => {
  treeLines.push(`${prefix}${last ? '└──' : '├──'} ${screen.title} [${screen.id}]`);
  const children = screens.filter(s => s.parent === screen.id);
  children.forEach((child, index) => append(child, prefix + (last ? '    ' : '│   '), index === children.length - 1));
};
append(screens.find(s => s.id === 'home'), '', false);
treeLines.push('└── Shared capture gate', '    └── Safety confirmation dialog', '```');
const rows = entries.map(s => `| ${s.title} | \`${s.domId}\` | ${s.entry} | ${s.states.map(st => `\`${st.key}\`${st.edition ? ` (${st.edition})` : ""}`).join(', ')} | ${link('Design', s.design)} | ${s.requirements.map(p => link(p.split('/').at(-1).replace('.md',''),p)).join(', ')} |`);
const tree = `# Site and screen tree\n\nGenerated from [screen-map.json](screen-map.json). Reviewed ${registry.reviewedOn}; application source baseline \`${registry.sourceBaseline.slice(0,7)}\`, with ${(registry.implementationChanges ?? []).join(" / ")} documented changes and exact reviewed-source fingerprints in the registry. Regenerate with \`npm run docs:generate\`.\n\n## Public site\n\nCanonical production origin: \`${registry.publicOrigin}/\`. **One implemented public path: \`/\`.** The app states below use the same URL and browser history; they are not separate public pages or sitemap entries. Draft robots/sitemap/metadata live in the [SEO proposal](../seo/README.md) and are not deployed.\n\n## App hierarchy\n\n${treeLines.join('\n')}\n\nRegistry edition labels identify public-only and full-preview-only states; shared current images use public, and browser references test both editions. About and Contact retain the shared five-item bottom navigation.\n\nThe tree describes primary destinations, not a restriction on Back/Forward. About and Contact open separate screens from centered shared-footer controls, including before gun setup; Back returns to the visited screen. Settings is accessible from every compact screen heading; My Guns links to the shared add/edit form and backup/restore. History opens Practice or Drill Session review. Missing required sounds link to Learn. Gun Setup can also be reached from My Guns after first use.\n\n## Functional screens and states\n\n| Screen / shared gate | App anchor | Entry path | Captured states | Visual layout | Functional specifications |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n\n## Shared templates\n\nEvery screen uses the [reusable app layout and view wrapper](page-templates.md), one branded header, main content, informational footer and fixed five-item bottom navigation. Installation/help is existing Settings content. Keep this shell consistent when adding screens.\n\n## State transitions\n\n\`First visit → Gun setup → Home\`; returning visits restore a valid selected gun.\n\n\`Drills → Practice Configure → Safety if needed → Connecting → Countdown or external cue → Listening → Review\`. Single saves its first accepted click then automatically repeats fresh countdown/signal/listening until the target; Par/Reload offer Next; repeated/control/free remain continuous. Pause releases capture; Resume restarts appropriately. STOP/End saves partial results.\n\n\`Drills → Sequence Configure → Safety if needed → Countdown/GO → Ordered sounds → Saved repetition → Fresh countdown → Review\`. Pause/Resume and interruption preserve durable results.\n\n\`History → Saved Practice/Sequence Review\`; Back returns to the visited screen. Native/browser Back/Forward cleanly end active capture and validate gun/context ownership. Refresh preserves local data but never automatically acquires a microphone.\n\n\`My Guns → Delete one gun → Confirm → Remaining gun library or first-gun setup\`; atomically delete all records owned by that gun, preserving other guns/device preferences. Cancel keeps all data.\n\n\`History → Clear recognition history or Clear saved sessions → Confirm → Refreshed corresponding log/statistics\`; separate scopes preserve other data and guns. Deleted Review contexts resolve to Drills.\n\n\`Any capture action → Safety modal if unconfirmed → Confirm & continue original action or Cancel\`. Page-session safety acknowledgement resets on refresh or gun change.\n\n[Maintenance and data architecture](README.md) · [Current design catalog](../design/README.md) · [Implementation plan](../project/implementation-history.md)\n`;
const coverage = `| Screen / shared gate | Current layout and captures | Requirements |\n| --- | --- | --- |\n${entries.map(s => `| ${s.title} | [${s.states.length} state/theme references](${relative(resolve(root,'docs/design'),resolve(root,s.design)).split(sep).join('/')}) | ${s.requirements.map(p => `[${p.split('/').at(-1).replace('.md','')}](${relative(resolve(root,'docs/design'),resolve(root,p)).split(sep).join('/')})`).join(', ')} |`).join('\n')}\n`;
const catalogPath = 'docs/design/README.md';
const catalog = read(catalogPath);
const marker = /<!-- screen-coverage:start -->\n[\s\S]*?<!-- screen-coverage:end -->/;
check(marker.test(catalog), 'Missing generated coverage markers in design catalog.');
const catalogUpdated = catalog.replace(marker, `<!-- screen-coverage:start -->\n${coverage}<!-- screen-coverage:end -->`);
if (args.includes('--write')) {
  writeFileSync(resolve(root,'docs/architecture/site-tree.md'), tree);
  writeFileSync(resolve(root,catalogPath), catalogUpdated);
} else {
  check(existsSync(resolve(root,'docs/architecture/site-tree.md')) && read('docs/architecture/site-tree.md') === tree, 'Site tree is stale; run docs:generate after reviewing the registry.');
  check(catalog === catalogUpdated, 'Design screen coverage is stale; run docs:generate.');
}

// Validate actual links, not examples in fenced code. Immutable remote URLs remain untouched.
const headingCache = new Map();
function headings(path) {
  if (headingCache.has(path)) return headingCache.get(path);
  const out = new Set(); const counts = new Map();
  const content = read(path).replace(/^(```|~~~)[\s\S]*?^\1.*$/gm,'');
  for (const line of content.split('\n')) {
    const match = line.match(/^#{1,6}\s+(.+?)\s*#*$/);
    if (!match) continue;
    const slug = match[1].replace(/<[^>]*>/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[`*_~]/g,'').toLowerCase().replace(/[^\p{L}\p{N}\p{M}\-_\s]/gu,'').replace(/\s/g,'-');
    const count = counts.get(slug) ?? 0; counts.set(slug, count+1);out.add(slug+(count ? `-${count}` : ''));
  }
  for (const m of content.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)) out.add(m[1]);
  headingCache.set(path,out);return out;
}
for (const path of walk('', ['.md'])) {
  const content = read(path).replace(/^(```|~~~)[\s\S]*?^\1.*$/gm,'');
  for (const match of content.matchAll(/!?\[[^\]\n]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const url = match[1].replace(/^<|>$/g,'');
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url) || url.startsWith('//')) continue;
    const [target, fragment] = url.split('#');
    const absolute = target ? resolve(dirname(resolve(root,path)), decodeURIComponent(target)) : resolve(root,path);
    const rel = relative(root,absolute).split(sep).join('/');
    check(!rel.startsWith('../') && existsSync(absolute), `${path}: broken local link ${url}.`);
    if (fragment && extname(absolute) === '.md' && existsSync(absolute)) check(headings(rel).has(decodeURIComponent(fragment)), `${path}: missing Markdown heading ${url}.`);
  }
}
const seo = JSON.parse(read('docs/seo/templates/webapplication.json'));
check(seo.url === `${registry.publicOrigin}/` && seo.name === 'Dry Fire With Ease', 'Prepared SEO canonical/brand differs from site registry.');
check(!seo.offers && !seo.aggregateRating && !seo.review, 'SEO template contains unverified price/ratings/reviews.');
const sitemap = read('docs/seo/templates/sitemap.xml');
check(same([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]), registry.publicPaths.map(p=>registry.publicOrigin+p)), 'Prepared sitemap differs from implemented public paths.');
if (errors.length) { console.error(errors.map(e => `- ${e}`).join('\n'));process.exit(1); }
console.log(`Documentation verified: ${screens.length} functional screens, ${registry.shared.length} shared dialog, ${images.size} unique current captures; generated tree/catalog, source review, local links and SEO proposal agree.`);
