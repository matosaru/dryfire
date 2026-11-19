/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {render,screen,fireEvent,cleanup,act} from '@testing-library/react';
import {jest} from '@jest/globals';
import {GunSetupPage} from './GunSetupPage.tsx';
import {loadLocale} from '../../localization/runtime.ts';
afterEach(cleanup);
test('name and illustrated type controls retain native validation and one hidden type value',()=>{
 render(<GunSetupPage/>);const name=screen.getByRole('textbox',{name:'Gun name'});expect(name).toBeRequired();expect(name).toHaveAttribute('maxlength','80');
 expect((document.querySelector('#gunForm') as HTMLFormElement).checkValidity()).toBe(false);fireEvent.change(name,{target:{value:'Test'}});
 for(const type of ['Handguns','Rifles and Carbines','Shotguns']){fireEvent.click(screen.getByRole('radio',{name:type}));expect(document.querySelector('#gunType')).toHaveValue(type);expect(screen.getByRole('radio',{name:type})).toBeChecked();}
 expect((document.querySelector('#gunForm') as HTMLFormElement).checkValidity()).toBe(true);expect(document.querySelectorAll('.gun-type-choice img')).toHaveLength(3);
});
test('editing preloads details and dispatches the supplied submit, cancel and restore actions',()=>{
 const submit=jest.fn((event:React.FormEvent<HTMLFormElement>)=>event.preventDefault()),cancel=jest.fn(),restore=jest.fn();render(<GunSetupPage name="Existing" type="Handguns" title="Edit gun" submitLabel="Save Changes" cancelHidden={false} onSubmit={submit} onCancel={cancel} onRestore={restore}/>);
 expect(screen.getByRole('textbox')).toHaveValue('Existing');expect(screen.getByRole('radio',{name:'Handguns'})).toBeChecked();fireEvent.click(screen.getByRole('button',{name:'Save Changes'}));fireEvent.click(screen.getByRole('button',{name:'Cancel'}));fireEvent.click(screen.getByRole('button',{name:'Restore from backup'}));expect(submit).toHaveBeenCalledTimes(1);expect(cancel).toHaveBeenCalledTimes(1);expect(restore).toHaveBeenCalledTimes(1);
});
test('saving and notice rerenders retain unsaved name/type nodes and values',()=>{
 const {rerender}=render(<GunSetupPage/>);const name=screen.getByRole('textbox');fireEvent.change(name,{target:{value:'Draft'}});fireEvent.click(screen.getByRole('radio',{name:'Shotguns'}));
 rerender(<GunSetupPage saving notice="Full preview"/>);expect(screen.getByRole('textbox')).toBe(name);expect(name).toHaveValue('Draft');expect(document.querySelector('#gunType')).toHaveValue('Shotguns');expect(screen.getByRole('button',{name:'Save Gun & Continue'})).toBeDisabled();expect(screen.getByText('Full preview')).toBeVisible();
});
test('localized setup keeps its selected variant and native field values',async()=>{await act(async()=>{await loadLocale('de');});render(<GunSetupPage variant="edit" name="PDP" type="Handguns" cancelHidden={false} noticeMode="full"/>);expect(screen.getByRole('heading',{name:'Waffe bearbeiten'})).toBeVisible();expect(screen.getByRole('textbox',{name:'Waffenname'})).toHaveValue('PDP');expect(screen.getByRole('radio',{name:'Kurzwaffen'})).toBeChecked();expect(screen.getByRole('button',{name:'Änderungen speichern'})).toBeVisible();expect(screen.getByText('Du kannst bis zu 5 Waffen speichern.')).toBeVisible();await act(async()=>{await loadLocale('en');});});
