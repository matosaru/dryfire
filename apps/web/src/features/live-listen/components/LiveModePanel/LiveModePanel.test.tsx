/** @jest-environment jsdom */
import '@dryfire/testing/setup';import{cleanup,render,screen,fireEvent}from'@testing-library/react';import{jest}from'@jest/globals';import{LiveModePanel}from'./LiveModePanel.tsx';
afterEach(cleanup);
test('mode selection and action identity remain native while unavailable actions cannot dispatch',()=>{
 const onAction=jest.fn(),onChange=jest.fn();const {rerender}=render(<LiveModePanel state={{options:[{value:'custom',title:'Saved sequence'}]}} onAction={onAction} onChange={onChange}/>);
 fireEvent.change(document.getElementById('drillSelect')!,{target:{value:'custom'}});expect(onChange).toHaveBeenCalledWith('drillSelect');fireEvent.click(screen.getByRole('button',{name:'Change mode / choose drill'}));expect(onAction).toHaveBeenCalledWith('changeDrillBtn');
 rerender(<LiveModePanel state={{disabled:{changeDrillBtn:true}}} onAction={onAction}/>);fireEvent.click(screen.getByRole('button',{name:'Change mode / choose drill'}));expect(onAction).toHaveBeenCalledTimes(1);
});
