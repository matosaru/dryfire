/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {jest} from '@jest/globals';
import {HomePage} from './HomePage.tsx';
afterEach(cleanup);
test('Home presents selected gun and supplied training/accuracy summaries as text',()=>{
 render(<HomePage gunName="<Test>" training="5 / 8 trigger" events={7} accuracy="75%"/>);
 expect(screen.getByText('<Test>')).toBeVisible();expect(document.querySelector('Test')).toBeNull();
 expect(screen.getByText('5 / 8 trigger')).toBeVisible();expect(screen.getByText('7')).toBeVisible();expect(screen.getByText('75%')).toBeVisible();
});
test('Home actions dispatch one explicit destination and respect recognition readiness',()=>{
 const onNavigate=jest.fn();const {rerender}=render(<HomePage onNavigate={onNavigate} listenDisabled/>);
 fireEvent.click(screen.getByRole('button',{name:/Live Listen/}));expect(onNavigate).not.toHaveBeenCalled();
 for(const name of ['Learn Sounds','Drills','History'])fireEvent.click(screen.getByRole('button',{name:new RegExp(name)}));
 rerender(<HomePage onNavigate={onNavigate}/>);fireEvent.click(screen.getByRole('button',{name:/Live Listen/}));
 expect(onNavigate.mock.calls).toEqual([['learn'],['drills'],['history'],['recognize']]);
});
test('static defaults and no-gun context preserve the existing visible controls',()=>{
 const {rerender}=render(<HomePage/>);expect(screen.getByText('0 / 32')).toBeVisible();
 for(const name of ['Learn Sounds','Drills','Live Listen','History'])fireEvent.click(screen.getByRole('button',{name:new RegExp(name)}));
 rerender(<HomePage contextHidden/>);expect(document.querySelector('.gun-context')).toHaveClass('hidden');
});
