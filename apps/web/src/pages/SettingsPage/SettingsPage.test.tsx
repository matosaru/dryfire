/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {jest} from '@jest/globals';
import {SettingsPage} from './SettingsPage.tsx';
afterEach(cleanup);
test('destructive scopes, backup warnings and browser controls retain distinct labels',()=>{
 render(<SettingsPage/>);expect(screen.getByRole('button',{name:/Reset all sounds for this gun/})).toBeVisible();expect(screen.getByRole('button',{name:'Delete all guns & app data'})).toBeVisible();
 expect(screen.getByText(/backup contains no raw recordings/)).toBeVisible();expect(screen.getByLabelText('Appearance')).toHaveValue('dark');expect(document.querySelector('#importFile')).toHaveAttribute('accept','application/json,.json');
 expect(document.querySelectorAll('.settings-group.deferred-settings')).toHaveLength(5);expect(screen.getByText('Learned Sounds').closest('.settings-group')).not.toHaveClass('deferred-settings');
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

test('page updates preserve the import island and in-progress native preference values',()=>{
 const fileInput=<input id="importFile" type="file" data-native-island="import"/>;
 const {rerender}=render(<SettingsPage fileInput={fileInput} state={{gunName:'First gun'}}/>);
 const file=document.getElementById('importFile'),noise=screen.getByRole('switch',{name:/^Noise Filter/}),appearance=screen.getByLabelText('Appearance');
 fireEvent.click(noise);fireEvent.change(appearance,{target:{value:'system'}});
 rerender(<SettingsPage fileInput={fileInput} preview={<p>Preview controls</p>} state={{gunName:'Second gun'}}/>);
 expect(document.getElementById('importFile')).toBe(file);
 expect(screen.getByRole('switch',{name:/^Noise Filter/})).toBe(noise);
 expect(noise).toBeChecked();expect(appearance).toHaveValue('system');
 expect(screen.getByText('Second gun')).toBeVisible();
});

test('unavailable actions retain their identity and cannot dispatch during profile changes',()=>{
 const onAction=jest.fn();const ids=['resetModelBtn','exportBtn','importBtn','resetLibraryBtn'];
 render(<SettingsPage onAction={onAction} state={{contextHidden:true,disabled:Object.fromEntries(ids.map(id=>[id,true])),texts:{soundResetSummary:'Choose a gun before resetting.'}}}/>);
 for(const id of ids){const action=document.getElementById(id)!;expect(action).toBeDisabled();fireEvent.click(action);}
 expect(onAction).not.toHaveBeenCalled();
 expect(document.querySelector('.gun-context')).toHaveClass('hidden');
 expect(document.getElementById('soundResetSummary')).toHaveTextContent('Choose a gun before resetting.');
});
