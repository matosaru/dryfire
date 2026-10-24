/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { composedStyles } from '../tools/style-sources.mjs';
import {renderToStaticMarkup} from 'react-dom/server';
import {GunSwitcher} from '@dryfire/ui/GunSwitcher';
import {SafetyDisclosure} from '@dryfire/ui/SafetyDisclosure';
import {SafetyDialog} from '@dryfire/ui/SafetyDialog';
function tree(node:Node):unknown {
 if(node.nodeType===Node.TEXT_NODE)return node.textContent?.replace(/\s+/g,' ').trim()||null;
 if(!(node instanceof Element))return null;
 return [node.tagName,[...node.attributes].map(attr=>[attr.name,attr.value]).sort(),[...node.childNodes].map(tree).filter(Boolean)];
}
const parse=(html:string)=>{const host=document.createElement('div');host.innerHTML=html;return host;};
const fixture=(name:string)=>readFileSync(new URL(`./fixtures/legacy-${name}.html`,import.meta.url),'utf8');
test('safety disclosure and gun switcher preserve all released markup and accessibility defaults',()=>{
 const actual=parse(renderToStaticMarkup(<><SafetyDisclosure/><GunSwitcher/></>));
 const legacy=parse(fixture('context'));
 expect(tree(actual.querySelector('.safety-disclosure')!)).toEqual(tree(legacy.querySelector('.safety-disclosure')!));
 expect(tree(actual.querySelector('#gunSwitcherBtn')!)).toEqual(tree(legacy.querySelector('#gunSwitcherBtn')!));
});
test('the native modal retains the exact released nodes, text, labels, constraints and inactive state',()=>{
 expect(tree(parse(renderToStaticMarkup(<SafetyDialog/>)))).toEqual(tree(parse(fixture('safety-modal'))));
});

test('the compiled shell includes the same context/dialog without extra wrappers or automatic image requests',async()=>{
 const {renderAppShell}=await import('../apps/web/src/app/renderAppShell.tsx');
 const legacy=fixture('shell').replace('{{context}}',fixture('context')).replace('{{safetyModal}}',fixture('safety-modal'));
 const actual=renderAppShell().replace('{{footerNotice}}','<p id="previewModeBadge" class="preview-mode-badge" role="status">Private preview · Free mode</p>');
 const rendered=parse(actual);
 expect(rendered.querySelectorAll('link[rel="preload"]')).toHaveLength(0);
 expect(tree(rendered)).toEqual(tree(parse(legacy)));
});


test('ordered CSS matches the reviewed CHG-059 shared setup update with the existing shell intact',()=>{
 const proof=JSON.parse(readFileSync(new URL('../docs/design/baselines/chg-059-guide-review.json',import.meta.url),'utf8'));
 expect(createHash('sha256').update(composedStyles().css).digest('hex')).toBe(proof.expandedCSSSha256);
});
