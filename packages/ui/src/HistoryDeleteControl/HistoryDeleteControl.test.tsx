/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,fireEvent,cleanup} from '@testing-library/react';
import {jest} from '@jest/globals';
import {HistoryDeleteControl} from './HistoryDeleteControl';
afterEach(cleanup);
test('requests confirmation before deletion and exposes labeled confirm/cancel actions',()=>{
 const onOpen=jest.fn(),onConfirm=jest.fn(),onCancel=jest.fn();
 const view=render(<HistoryDeleteControl open={false} triggerLabel="Delete result" confirmationLabel="Delete this result?" confirmLabel="Confirm deletion" cancelLabel="Cancel deletion" groupLabel="Delete result confirmation" onOpen={onOpen} onConfirm={onConfirm} onCancel={onCancel}/>);
 fireEvent.click(view.getByRole('button',{name:'Delete result'}));expect(onOpen).toHaveBeenCalledTimes(1);
 view.rerender(<HistoryDeleteControl open={true} triggerLabel="Delete result" confirmationLabel="Delete this result?" confirmLabel="Confirm deletion" cancelLabel="Cancel deletion" groupLabel="Delete result confirmation" onOpen={onOpen} onConfirm={onConfirm} onCancel={onCancel}/>);
 expect(view.getByRole('group',{name:'Delete result confirmation'})).toHaveTextContent('Delete this result?');fireEvent.click(view.getByRole('button',{name:'Confirm deletion'}));fireEvent.click(view.getByRole('button',{name:'Cancel deletion'}));expect(onConfirm).toHaveBeenCalledTimes(1);expect(onCancel).toHaveBeenCalledTimes(1);
});
test('disabled confirmation cannot delete while Cancel remains available',()=>{
 const onConfirm=jest.fn(),onCancel=jest.fn();const view=render(<HistoryDeleteControl open triggerLabel="Delete result" confirmationLabel="Delete this result?" confirmLabel="Confirm deletion" cancelLabel="Cancel deletion" groupLabel="Delete result confirmation" disabled onOpen={jest.fn()} onConfirm={onConfirm} onCancel={onCancel}/>);
 expect(view.getByRole('button',{name:'Confirm deletion'})).toBeDisabled();fireEvent.click(view.getByRole('button',{name:'Confirm deletion'}));fireEvent.click(view.getByRole('button',{name:'Cancel deletion'}));expect(onConfirm).not.toHaveBeenCalled();expect(onCancel).toHaveBeenCalledTimes(1);
});
