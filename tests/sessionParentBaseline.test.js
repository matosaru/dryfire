/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {readFileSync} from 'node:fs';
import {renderPageTemplates} from '../tools/page-templates.mjs';
import {semanticTree} from './helpers/guidePresentation.js';
test.each(['practice','session','practiceGuide'])('%s complete parent structure matches the released pre-extraction source',id=>{
 const doc=document.implementation.createHTMLDocument('');doc.body.innerHTML=renderPageTemplates('{{app}}');const original=document.createElement('section');original.innerHTML=readFileSync(new URL('./fixtures/session-pages/'+id+'.html',import.meta.url),'utf8');const actual=document.createElement('section');actual.append(...doc.getElementById(id+'View').childNodes);expect(semanticTree(actual)).toEqual(semanticTree(original));
});
