/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {readFileSync} from 'node:fs';
import {renderSettingsPage} from '../apps/web/src/app/renderSettingsPage.tsx';
function tree(node:Node):unknown{if(node.nodeType===Node.TEXT_NODE)return node.textContent?.replace(/\s+/g,' ').trim()||null;if(!(node instanceof Element))return null;return[node.tagName,[...node.attributes].map(attr=>[attr.name,attr.value]).sort(),[...node.childNodes].map(tree).filter(Boolean)];}
const parse=(html:string)=>{const host=document.createElement('div');host.innerHTML=html;return host;};
test.each(['public','preview'])('Settings prerender preserves every released node, constraint, text and native preview island for %s',edition=>{
 const filter=(html:string)=>html.replace(/<!-- private-preview:start -->([\s\S]*?)<!-- private-preview:end -->/g,(_,content)=>edition==='preview'?content:'');
 const original=readFileSync(new URL('./fixtures/legacy-settings-page.html',import.meta.url),'utf8');expect(tree(parse(filter(renderSettingsPage(original.match(/<!-- private-preview:start -->[\s\S]*?<!-- private-preview:end -->/)![0]))))).toEqual(tree(parse(filter(original))));
});
