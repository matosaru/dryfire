/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {SettingsSection} from './SettingsSection.tsx';
afterEach(cleanup);
test('section title and native children retain semantics and unfinished values on updates',()=>{
 const {rerender}=render(<SettingsSection title="Audio"><label>Name<input aria-label="Name" defaultValue="Original"/></label></SettingsSection>);
 const input=screen.getByRole('textbox',{name:'Name'});fireEvent.change(input,{target:{value:'Unfinished'}});
 rerender(<SettingsSection title="Preferences" className="preference-group"><label>Name<input aria-label="Name" defaultValue="Original"/></label></SettingsSection>);
 expect(screen.getByRole('heading',{level:3,name:'Preferences'})).toBeVisible();
 expect(screen.getByRole('textbox',{name:'Name'})).toBe(input);expect(input).toHaveValue('Unfinished');
 expect(input.closest('.settings-group')).toHaveClass('preference-group');
});
