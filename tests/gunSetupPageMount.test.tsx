/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {act,fireEvent} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import {renderGunSetupPage} from '../apps/web/src/app/renderGunSetupPage.tsx';
import {type GunSetupPageProps} from '../apps/web/src/pages/GunSetupPage/index.ts';
import {mountGunSetupPage} from '../apps/web/src/app/profilePages/index.ts';
const fixture=readFileSync(new URL('./fixtures/legacy-gun-setup-page.html',import.meta.url),'utf8');
function tree(node:Node):unknown{if(node.nodeType===Node.TEXT_NODE)return node.textContent?.replace(/\s+/g,' ').trim()||null;if(!(node instanceof Element))return null;return[node.tagName,[...node.attributes].map(attr=>[attr.name,attr.value]).sort(),[...node.childNodes].map(tree).filter(Boolean)];}
test('static gun form preserves every released node, default, constraint and type image',()=>{const old=document.createElement('div'),actual=document.createElement('div');old.innerHTML=fixture;actual.innerHTML=renderGunSetupPage();expect(tree(actual)).toEqual(tree(old));});
test('saving/notice changes preserve invalid drafts; only explicit reset changes form identity',()=>{
 document.body.innerHTML=`<section id="gunSetupView">${fixture}</section>`;let page:ReturnType<typeof mountGunSetupPage>;
 act(()=>{page=mountGunSetupPage(document,{name:'Old',type:'Handguns'});});const name=document.querySelector<HTMLInputElement>('#gunName')!;fireEvent.change(name,{target:{value:''}});fireEvent.click(document.querySelector('input[value="Shotguns"]')!);name.focus();
 act(()=>page.setSaving(true));act(()=>page.setSaving(true));act(()=>page.setNotice('Full'));act(()=>page.setNotice('Full'));act(()=>page.setSaving(false));expect(document.querySelector('#gunName')).toBe(name);expect(name.value).toBe('');expect(document.activeElement).toBe(name);expect(document.querySelector('#gunType')).toHaveValue('Shotguns');expect((document.querySelector('#gunForm') as HTMLFormElement).checkValidity()).toBe(false);
 act(()=>page.reset({name:'New',type:'Rifles and Carbines'}));expect(document.querySelector('#gunName')).not.toBe(name);expect(document.querySelector('#gunName')).toHaveValue('New');expect(document.querySelector('#gunType')).toHaveValue('Rifles and Carbines');
 act(()=>page.dispose());act(()=>page.dispose());act(()=>page.reset({}));act(()=>page.setSaving(true));act(()=>page.setNotice('No'));expect(document.querySelector('#gunSetupView')?.childNodes).toHaveLength(0);
});
test('missing mount is explicit and failed initial commit restores native form/focus',()=>{
 document.body.innerHTML='';expect(()=>mountGunSetupPage(document,{})).toThrow('Gun setup mount is missing.');document.body.innerHTML=`<section id="gunSetupView">${fixture}</section>`;const name=document.querySelector<HTMLInputElement>('#gunName')!;name.value='Keep';name.focus();
 const environment=globalThis as typeof globalThis&{IS_REACT_ACT_ENVIRONMENT?:boolean};const previous=environment.IS_REACT_ACT_ENVIRONMENT;environment.IS_REACT_ACT_ENVIRONMENT=false;
 try{expect(()=>mountGunSetupPage(document,{description:{invalid:true}} as unknown as GunSetupPageProps)).toThrow();}finally{environment.IS_REACT_ACT_ENVIRONMENT=previous;}
 expect(document.querySelector('#gunName')).toBe(name);expect(name.value).toBe('Keep');expect(document.activeElement).toBe(name);
});
