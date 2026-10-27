/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {jest} from '@jest/globals';
import {SettingsAction} from './SettingsAction.tsx';
afterEach(cleanup);
test('an action exposes its own name and dispatches its ID only when enabled',()=>{
 const onAction=jest.fn();const props={id:'exportBtn',label:'Export backup',icon:'↑',className:'button secondary',onAction};
 const {rerender}=render(<SettingsAction {...props}/>);fireEvent.click(screen.getByRole('button',{name:'Export backup'}));expect(onAction).toHaveBeenCalledWith('exportBtn');
 rerender(<SettingsAction {...props} disabled/>);fireEvent.click(screen.getByRole('button',{name:'Export backup'}));expect(onAction).toHaveBeenCalledTimes(1);
});
