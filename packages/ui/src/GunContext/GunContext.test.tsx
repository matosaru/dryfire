/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {cleanup,render,screen} from '@testing-library/react';
import {GunContext} from './GunContext.tsx';
afterEach(cleanup);
test('context wording and escaped gun names preserve a single named child across updates',()=>{
 const {rerender,container}=render(<GunContext prefix="Practice for " name="<img src=x>"/>);
 const name=screen.getByText('<img src=x>');expect(container.querySelector('img')).toBeNull();
 expect(container.querySelector('p')).toHaveTextContent('Practice for <img src=x>.');
 rerender(<GunContext prefix="Saved results for " name="Second" hidden/>);
 expect(screen.getByText('Second')).toBe(name);expect(container.querySelector('p')).toHaveClass('gun-context','hidden');
});
