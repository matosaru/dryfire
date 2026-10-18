/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {jest} from '@jest/globals';
import '@dryfire/testing/setup';
import {act} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {GunsPage} from '../apps/web/src/pages/GunsPage/index.ts';
import {mountGunsPage} from '../apps/web/src/app/gunsPage.tsx';
function tree(node:Node):unknown{
 if(node.nodeType===Node.TEXT_NODE)return node.textContent?.replace(/\s+/g,' ').trim()||null;
 if(!(node instanceof Element))return null;
 return[node.tagName,[...node.attributes].map(attr=>[attr.name,attr.value]).sort(),[...node.childNodes].map(tree).filter(Boolean)];
}
function parse(html:string){const host=document.createElement('div');host.innerHTML=html;return host;}
test('prerendered library retains the complete released page structure and defaults',()=>{
 const old=readFileSync(new URL('./fixtures/legacy-guns-page.html',import.meta.url),'utf8');expect(tree(parse(renderToStaticMarkup(<GunsPage/>)))).toEqual(tree(parse(old)));
});
test('mounted library updates locks, retains focused action and dispatches each callback once',()=>{
 document.body.innerHTML='<section id="gunsView"></section>';const onEdit=jest.fn();let page:ReturnType<typeof mountGunsPage>;
 const props={rows:[{gun:{id:'a',name:'Test'},image:'/gun-types/unknown.svg',triggerReady:false,optionalReady:0,samples:0,presets:0}],loaded:true,onEdit};
 act(()=>{page=mountGunsPage(document,props);});
 const button=document.querySelector<HTMLButtonElement>('[data-edit-gun-id]')!;button.focus();act(()=>button.click());expect(onEdit).toHaveBeenCalledTimes(1);
 act(()=>page.update({...props,full:true,limit:5}));expect(document.activeElement).toBe(button);
 act(()=>page.setLocked(true));expect(button.disabled).toBe(true);act(()=>button.click());expect(onEdit).toHaveBeenCalledTimes(1);
 act(()=>page.setLocked(true));act(()=>page.setLocked(false));expect(button.disabled).toBe(false);
 act(()=>page.dispose());act(()=>page.dispose());act(()=>page.update(props));act(()=>page.setLocked(true));expect(document.querySelector('#gunsView')?.childNodes).toHaveLength(0);
});
test('missing mount fails explicitly',()=>{document.body.innerHTML='';expect(()=>mountGunsPage(document,{})).toThrow('Gun library mount is missing.');});
test('failed initial rendering restores the original native nodes for retry',()=>{
 document.body.innerHTML='<section id="gunsView"><button id="native">Original</button></section>';const original=document.querySelector<HTMLButtonElement>('#native')!;original.focus();
 const gun={id:'a',get name():string{throw new Error('presentation failed');}};
 const environment=globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT?:boolean};const previous=environment.IS_REACT_ACT_ENVIRONMENT;environment.IS_REACT_ACT_ENVIRONMENT=false;
 try{expect(()=>mountGunsPage(document,{rows:[{gun,image:'x',triggerReady:false,optionalReady:0,samples:0,presets:0}]})).toThrow('presentation failed');}
 finally{environment.IS_REACT_ACT_ENVIRONMENT=previous;}
 expect(document.querySelector('#native')).toBe(original);expect(document.activeElement).toBe(original);
});
test('selection, delete and add focus survive library updates without changing action identity',()=>{
 document.body.innerHTML='<section id="gunsView"></section>';let page:ReturnType<typeof mountGunsPage>;
 const props={rows:[{gun:{id:'a',name:'Test'},image:'/gun-types/unknown.svg',triggerReady:false,optionalReady:0,samples:0,presets:0}],loaded:true,full:true,limit:5};
 act(()=>{page=mountGunsPage(document,props);});
 for(const selector of ['[data-gun-id]','[data-delete-gun-id]','#addGunBtn']){
  const button=document.querySelector<HTMLButtonElement>(selector)!;button.focus();act(()=>page.update(props));expect(document.activeElement).toBe(button);
 }
 act(()=>page.dispose());
});
