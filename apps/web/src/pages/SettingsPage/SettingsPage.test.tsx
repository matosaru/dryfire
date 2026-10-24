/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {jest} from '@jest/globals';
import {SettingsPage} from './SettingsPage.tsx';
afterEach(cleanup);
test('destructive scopes, backup warnings and browser controls retain distinct labels',()=>{
 render(<SettingsPage/>);expect(screen.getByRole('button',{name:/Reset all sounds for this gun/})).toBeVisible();expect(screen.getByRole('button',{name:'Delete all guns & app data'})).toBeVisible();
 expect(screen.getByText(/backup contains no raw recordings/)).toBeVisible();expect(screen.getByLabelText('Appearance')).toHaveValue('dark');expect(document.querySelector('#importFile')).toHaveAttribute('accept','application/json,.json');
});
test('each action and preference dispatches its own typed value without acquiring services',()=>{
 const onAction=jest.fn(),onPreference=jest.fn(),onBack=jest.fn(),onImport=jest.fn();render(<SettingsPage onAction={onAction} onPreference={onPreference} onBack={onBack} onImport={onImport}/>);
 for(const id of ['resetModelBtn','exportBtn','importBtn','resetLibraryBtn'])fireEvent.click(document.getElementById(id)!);
 for(const id of ['noiseFilter','autoGainControl','vibrationFeedback'])fireEvent.click(document.getElementById(id)!);
 fireEvent.change(screen.getByLabelText('Appearance'),{target:{value:'system'}});fireEvent.click(screen.getByRole('button',{name:'Back to previous screen'}));fireEvent.change(document.querySelector('#importFile')!,{target:{files:[new File(['{}'],'test.json')]}});
 expect(onAction.mock.calls).toEqual([['resetModelBtn'],['exportBtn'],['importBtn'],['resetLibraryBtn']]);expect(onPreference.mock.calls).toEqual([['noiseFilter',true],['autoGainControl',true],['vibrationFeedback',true],['appearance','system']]);expect(onBack).toHaveBeenCalledTimes(1);expect(onImport).toHaveBeenCalledTimes(1);
});
test('native controls remain usable without callbacks and preserve installation disclosure state on rerender',()=>{
 const {rerender}=render(<SettingsPage/>);const details=document.querySelector<HTMLDetailsElement>('details')!;details.open=true;
 for(const id of ['resetModelBtn','exportBtn','importBtn','resetLibraryBtn','noiseFilter','autoGainControl','vibrationFeedback'])fireEvent.click(document.getElementById(id)!);fireEvent.change(screen.getByLabelText('Appearance'),{target:{value:'light'}});rerender(<SettingsPage preview={<p>Private island</p>}/>);expect(document.querySelector('details')).toBe(details);expect(details.open).toBe(true);expect(screen.getByText('Private island')).toBeVisible();
});
