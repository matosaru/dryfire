/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import { SafetyDialog } from './SafetyDialog.tsx';

test('mounting does not open the native modal; confirmation requires the acknowledged prop',async()=>{
  const ref=createRef<HTMLDialogElement>(),confirm=jest.fn(),cancel=jest.fn(),acknowledge=jest.fn();
  const {rerender}=render(<SafetyDialog ref={ref} onConfirm={confirm} onCancel={cancel} onAcknowledge={acknowledge} />);
  expect(ref.current!.open).toBe(false);ref.current!.open=true;
  expect(screen.getByRole('dialog')).toHaveAccessibleName('Confirm safety before practice');
  await userEvent.click(screen.getByRole('button',{name:'Confirm & continue'}));expect(confirm).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('checkbox'));expect(acknowledge).toHaveBeenCalledWith(true);
  rerender(<SafetyDialog ref={ref} acknowledged onConfirm={confirm} onCancel={cancel} />);
  await userEvent.click(screen.getByRole('button',{name:'Confirm & continue'}));expect(confirm).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByRole('button',{name:'Cancel'}));fireEvent(ref.current!,new Event('cancel'));
  expect(cancel).toHaveBeenCalledTimes(2);
  await userEvent.click(screen.getByRole('checkbox')); // No acknowledgement callback is required for static rendering.
});
