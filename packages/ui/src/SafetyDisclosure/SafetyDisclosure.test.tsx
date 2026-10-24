/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import { SafetyDisclosure } from './SafetyDisclosure.tsx';

test('native disclosure and acknowledgement report changes without recording or persisting',async()=>{
  const onChange=jest.fn();
  const {rerender}=render(<SafetyDisclosure onChange={onChange} />);
  document.querySelector('details')!.open=true;
  expect(screen.getByText('Required before recording')).toBeInTheDocument();
  const checkbox=screen.getByRole('checkbox',{name:'I confirm the safety check.'});
  await userEvent.click(checkbox);expect(onChange).toHaveBeenCalledWith(true);
  rerender(<SafetyDisclosure confirmed onChange={onChange} />);
  expect(checkbox).toBeChecked();expect(screen.getByText('Confirmed for this session')).toBeInTheDocument();
  await userEvent.click(checkbox);expect(onChange).toHaveBeenLastCalledWith(false);
});
test('default presentation is safe without a callback',async()=>{
  render(<SafetyDisclosure />);document.querySelector('details')!.open=true;
  await userEvent.click(screen.getByRole('checkbox'));expect(screen.getByRole('checkbox')).not.toBeChecked();
});
