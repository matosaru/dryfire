/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {readFileSync} from 'node:fs';
import {renderPageTemplates} from '../tools/page-templates.mjs';
import {semanticTree} from './helpers/guidePresentation.js';
test.each(['practice','session','practiceGuide'])('%s complete parent structure matches its reviewed reference',id=>{
 const doc=document.implementation.createHTMLDocument('');doc.body.innerHTML=renderPageTemplates('{{app}}');const original=document.createElement('section');original.innerHTML=readFileSync(new URL('./fixtures/session-pages/'+(id==='practice'?'practice.setup-v2':id)+'.html',import.meta.url),'utf8');const actual=document.createElement('section');actual.append(...doc.getElementById(id+'View').childNodes);expect(semanticTree(actual)).toEqual(semanticTree(original));
});

test('CHG-058 preserves all native input/select constraints and run/review markup from released Practice',()=>{
 const current=document.createElement('section'),old=document.createElement('section');current.innerHTML=readFileSync(new URL('./fixtures/session-pages/practice.setup-v2.html',import.meta.url),'utf8');old.innerHTML=readFileSync(new URL('./fixtures/session-pages/practice.html',import.meta.url),'utf8');
 const controls=host=>[...host.querySelectorAll('input,select')].map(node=>[node.id,[...node.attributes].map(a=>[a.name,a.value]).sort(),node.tagName==='SELECT'?[...node.options].map(o=>[o.value,o.textContent]):null]);expect(controls(current)).toEqual(controls(old));
 for(const id of ['practiceRun','practiceReview'])expect(semanticTree(current.querySelector('#'+id))).toEqual(semanticTree(old.querySelector('#'+id)));
});
