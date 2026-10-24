/** @jest-environment jsdom */
import {jest} from '@jest/globals';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import '@testing-library/jest-dom';
import {GunsPage,type GunLibraryRow} from './GunsPage.tsx';
afterEach(cleanup);
const rows:GunLibraryRow[]=[{gun:{id:'a',name:'<My gun>',type:'Handguns'},image:'/gun-types/handgun.svg',triggerReady:true,optionalReady:1,samples:8,presets:2},{gun:{id:'b'},image:'/gun-types/unknown.svg',triggerReady:false,optionalReady:0,samples:0,presets:0}];
test('owned cards retain names, type image, selected state and measured readiness',()=>{
 render(<GunsPage rows={rows} selectedId="a" loaded/>);
 expect(screen.getByText('<My gun>')).toBeVisible();expect(document.querySelector('My')).toBeNull();
 expect(document.querySelector('[data-gun-id="a"]')).toHaveAttribute('aria-pressed','true');
 expect(screen.getByText('Trigger ready · 1 optional sounds ready · 8 samples')).toBeVisible();
 expect(screen.getByText('Existing gun — add details')).toBeVisible();expect(screen.getByText('Choose gun type')).toBeVisible();
 expect(screen.getByText('Learn trigger · 0 optional sounds ready · 0 samples')).toBeVisible();
 expect(document.querySelector('img')).toHaveAttribute('src','/gun-types/handgun.svg');
});
test('select, edit, delete and backup invoke only their explicit callbacks',()=>{
 const onSelect=jest.fn(),onEdit=jest.fn(),onDelete=jest.fn(),onBackup=jest.fn();
 render(<GunsPage rows={rows} loaded onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onBackup={onBackup}/>);
 fireEvent.click(document.querySelector('[data-gun-id="a"]')!);fireEvent.click(screen.getByRole('button',{name:'Edit <My gun>'}));fireEvent.click(screen.getByRole('button',{name:'Delete <My gun>'}));fireEvent.click(screen.getByRole('button',{name:/Backup/}));
 expect(onSelect).toHaveBeenCalledWith('a');expect(onEdit).toHaveBeenCalledWith(rows[0].gun);expect(onDelete).toHaveBeenCalledWith(rows[0].gun);expect(onBackup).toHaveBeenCalledTimes(1);
});
test('public capacity keeps existing profiles visible and blocks new creation; Full restores capacity',()=>{
 const onAdd=jest.fn();const {rerender}=render(<GunsPage rows={rows} loaded onAdd={onAdd}/>);
 expect(screen.getByText('2 saved guns')).toBeVisible();expect(document.querySelector('#addGunBtn')).toHaveClass('hidden');expect(document.querySelector('#addGunBtn')).toBeDisabled();
 rerender(<GunsPage rows={rows} full limit={5} loaded onAdd={onAdd}/>);expect(screen.getByText('2 of 5 guns saved · Saved on this device')).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'+ Add gun'}));expect(onAdd).toHaveBeenCalledTimes(1);
});
test('locks disable all profile mutations and selection',()=>{
 const onSelect=jest.fn(),onEdit=jest.fn(),onDelete=jest.fn(),onAdd=jest.fn();render(<GunsPage rows={rows.slice(0,1)} locked loaded onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onAdd={onAdd}/>);
 for(const selector of ['[data-gun-id]','[data-edit-gun-id]','[data-delete-gun-id]','#addGunBtn']){const button=document.querySelector(selector)!;expect(button).toBeDisabled();fireEvent.click(button);}
 expect(onSelect).not.toHaveBeenCalled();expect(onEdit).not.toHaveBeenCalled();expect(onDelete).not.toHaveBeenCalled();expect(onAdd).not.toHaveBeenCalled();
});
test('empty, singular and maximum-capacity labels preserve existing copy',()=>{
 const {rerender}=render(<GunsPage/>);expect(screen.getByText('0 of 5 guns saved')).toBeVisible();
 rerender(<GunsPage rows={rows.slice(0,1)} loaded/>);expect(screen.getByText('1 saved gun')).toBeVisible();
 rerender(<GunsPage rows={Array.from({length:5},(_,i)=>({...rows[0],gun:{id:String(i)}}))} loaded full limit={5}/>);expect(screen.getByRole('button',{name:'5 of 5 guns saved'})).toBeDisabled();
});
test('callbacks are optional for static markup',()=>{
 render(<GunsPage rows={rows.slice(0,1)} loaded/>);for(const selector of ['[data-gun-id]','[data-edit-gun-id]','[data-delete-gun-id]'])fireEvent.click(document.querySelector(selector)!);
});
