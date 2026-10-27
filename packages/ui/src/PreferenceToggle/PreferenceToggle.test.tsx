/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {cleanup,render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {PreferenceToggle} from './PreferenceToggle.tsx';
afterEach(cleanup);
test('label activation changes one native switch and preserves its value across parent updates',async()=>{
 const user=userEvent.setup(),changes:boolean[]=[];const props={id:'sound',label:'Sound at start',description:'Play the signal.',onChange:(event:React.ChangeEvent<HTMLInputElement>)=>changes.push(event.currentTarget.checked)};
 const {rerender}=render(<PreferenceToggle {...props}/>);const input=screen.getByRole('switch');await user.click(screen.getByText('Sound at start'));
 expect(input).toBeChecked();expect(changes).toEqual([true]);
 rerender(<PreferenceToggle {...props} disabled description="Unavailable"/>);expect(screen.getByRole('switch')).toBe(input);expect(input).toBeChecked();await user.click(input);expect(changes).toEqual([true]);
});
test('status and externally supplied descriptions retain their distinct accessible wiring',()=>{
 const {rerender}=render(<PreferenceToggle id="noise" label="Noise Filter" description="Checking" descriptionId="noiseStatus" descriptionRole="status"/>);
 expect(screen.getByRole('switch')).toHaveAttribute('aria-describedby','noiseStatus');expect(screen.getByRole('status')).toHaveTextContent('Checking');
 rerender(<PreferenceToggle id="noise" label="Noise Filter" description="Help" aria-describedby="externalNote" name="startSound" defaultChecked/>);
 expect(screen.getByRole('switch')).toHaveAttribute('aria-describedby','externalNote');expect(screen.getByRole('switch')).toHaveAttribute('name','startSound');expect(screen.queryByRole('status')).toBeNull();
});
