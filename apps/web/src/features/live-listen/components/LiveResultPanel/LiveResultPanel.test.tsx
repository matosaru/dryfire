/** @jest-environment jsdom */
import '@dryfire/testing/setup';import{cleanup,render,screen,fireEvent}from'@testing-library/react';import{jest}from'@jest/globals';import{LiveResultPanel}from'./LiveResultPanel.tsx';
afterEach(cleanup);
test('recognition feedback updates preserve an unfinished verification choice and dispatch verification once',()=>{
 const onAction=jest.fn(),onChange=jest.fn(),state={hidden:{predictionCard:false},texts:{predictionLabel:'Trigger'}};const {rerender}=render(<LiveResultPanel state={state} onAction={onAction} onChange={onChange}/>);
 const actual=document.getElementById('latestActual')!;fireEvent.change(actual,{target:{value:'trigger'}});expect(onChange).toHaveBeenCalledWith('latestActual');
 rerender(<LiveResultPanel state={{...state,texts:{predictionLabel:'Rack'}}} onAction={onAction} onChange={onChange}/>);expect(document.getElementById('latestActual')).toBe(actual);expect(actual).toHaveValue('trigger');expect(screen.getByRole('heading',{name:'Rack'})).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'Verify'}));expect(onAction.mock.calls).toEqual([['verifyLatestBtn']]);
});
