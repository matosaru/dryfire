/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {act,fireEvent} from '@testing-library/react';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {mountSettingsPage} from '../apps/web/src/app/settingsPage.tsx';
const fixture=readFileSync(new URL('./fixtures/legacy-settings-page.html',import.meta.url),'utf8').replace('{{previewControls}}','');
function setup(){document.body.innerHTML=`<section id="settingsView">${fixture}</section>`;return document.querySelector('#settingsView')!;}
test('Settings handoff retains installation state, drafts, focus and file-input lifetime',()=>{
 const host=setup(),file=document.querySelector<HTMLInputElement>('#importFile')!,imported=jest.fn(),action=jest.fn();file.addEventListener('change',imported);
 document.querySelector('#installStatus')!.textContent='Installed';document.querySelector('#deviceCheck')!.textContent='Secure';document.querySelector('#soundResetOutcome')!.textContent='Kept history';document.querySelector('.gun-context-name')!.textContent='Owned gun';
 document.querySelector('details')!.open=true;(document.querySelector('#appearance') as HTMLSelectElement).value='system';const focused=document.querySelector<HTMLButtonElement>('#exportBtn')!;focused.focus();
 let page:ReturnType<typeof mountSettingsPage>;act(()=>{page=mountSettingsPage(host,{onAction:action});});
 expect(document.querySelector('#importFile')).toBe(file);expect(document.querySelector('details')).toHaveAttribute('open');expect(document.querySelector('#installStatus')).toHaveTextContent('Installed');expect(document.querySelector('#deviceCheck')).toHaveTextContent('Secure');expect(document.querySelector('#soundResetOutcome')).toHaveTextContent('Kept history');expect(document.querySelector('.gun-context-name')).toHaveTextContent('Owned gun');expect(document.querySelector('#appearance')).toHaveValue('system');expect(document.activeElement?.id).toBe('exportBtn');
 act(()=>fireEvent.click(document.querySelector('#exportBtn')!));expect(action).toHaveBeenCalledWith('exportBtn');fireEvent.change(file);expect(imported).toHaveBeenCalledTimes(1);
 act(()=>page.update({texts:{soundResetOutcome:'New outcome'},disabled:{exportBtn:true}}));expect(document.querySelector('#soundResetOutcome')).toHaveTextContent('New outcome');expect(document.querySelector('#exportBtn')).toBeDisabled();expect(document.querySelector('#importFile')).toBe(file);expect(document.querySelector('details')).toHaveAttribute('open');
 act(()=>page.dispose());act(()=>page.dispose());act(()=>page.update({texts:{soundResetOutcome:'Ignored'}}));expect(host.childNodes).toHaveLength(0);
});
test('private preview retains its native node, mode and event owner through updates',()=>{
 const host=setup(),preview=document.createElement('section');preview.id='previewTestingSection';preview.innerHTML='<select id="previewTestMode"><option value="free">Free</option><option value="full">Full</option></select>';host.prepend(preview);const input=preview.querySelector('select')!,changed=jest.fn();input.value='full';input.addEventListener('change',changed);
 let page:ReturnType<typeof mountSettingsPage>;act(()=>{page=mountSettingsPage(host,{});});act(()=>page.update({contextHidden:true}));expect(document.querySelector('#previewTestingSection')).toBe(preview);expect(input.value).toBe('full');fireEvent.change(input);expect(changed).toHaveBeenCalledTimes(1);expect(document.querySelector('.gun-context')).toHaveClass('hidden');act(()=>page.dispose());
});

test('preference updates preserve saved/applied states, unsupported controls and subsequent native drafts',()=>{
 const host=setup();let page:ReturnType<typeof mountSettingsPage>;const onPreference=jest.fn();act(()=>{page=mountSettingsPage(host,{onPreference});});
 const preferences={audio:[{inputId:'noiseFilter' as const,statusId:'noiseFilterStatus' as const,checked:true,disabled:true,status:'Unsupported recording remains available.'}],appearance:{value:'light',disabled:false},vibration:{checked:false,disabled:true,status:'Unavailable'}};
 act(()=>page.update({preferences}));expect(document.querySelector('#noiseFilter')).toBeChecked();expect(document.querySelector('#noiseFilter')).toBeDisabled();expect(document.querySelector('#appearance')).toHaveValue('light');expect(document.querySelector('#vibrationStatus')).toHaveTextContent('Unavailable');
 act(()=>fireEvent.change(document.querySelector('#appearance')!,{target:{value:'system'}}));expect(onPreference).toHaveBeenCalledWith('appearance','system');act(()=>page.update({texts:{deviceCheck:'Updated device'}}));expect(document.querySelector('#appearance')).toHaveValue('system');act(()=>page.dispose());
});
test('failed initial commit restores the native control nodes and listeners for retry',()=>{
 const host=setup(),file=document.querySelector('#importFile'),button=document.querySelector<HTMLButtonElement>('#exportBtn')!,clicked=jest.fn();button.addEventListener('click',clicked);button.focus();
 const environment=globalThis as typeof globalThis&{IS_REACT_ACT_ENVIRONMENT?:boolean};const previous=environment.IS_REACT_ACT_ENVIRONMENT;environment.IS_REACT_ACT_ENVIRONMENT=false;const query=host.querySelector.bind(host),spy=jest.spyOn(host,'querySelector');spy.mockImplementation(selector=>selector==='.gun-context-name'?{textContent:{invalid:true}} as unknown as Element:query(selector));
 try{expect(()=>mountSettingsPage(host,{})).toThrow();}finally{spy.mockRestore();environment.IS_REACT_ACT_ENVIRONMENT=previous;}expect(document.querySelector('#importFile')).toBe(file);expect(document.querySelector('#exportBtn')).toBe(button);expect(document.activeElement).toBe(button);button.click();expect(clicked).toHaveBeenCalledTimes(1);
});
