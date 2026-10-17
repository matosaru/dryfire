/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PracticeCatalog } from './PracticeCatalog.tsx';

const modes = [{id:'single',title:'Single trigger press',description:'One click after each signal.'},
  {id:'repeated',title:'Repeated trigger presses',description:'Click intervals.'}];
test('ordered native choices delegate the selected identifier and remain controlled', async () => {
  const onSelect = jest.fn(), user = userEvent.setup();
  const { rerender } = render(<PracticeCatalog modes={modes} onSelect={onSelect} />);
  expect(screen.getAllByRole('heading').map(node=>node.textContent)).toEqual(modes.map(mode=>mode.title));
  await user.tab(); await user.keyboard('{Enter}');
  await user.click(screen.getAllByRole('button')[1]);
  expect(onSelect.mock.calls).toEqual([['single'],['repeated']]);
  rerender(<PracticeCatalog modes={modes} disabled onSelect={onSelect} />);
  await user.click(screen.getAllByRole('button')[0]);
  expect(onSelect).toHaveBeenCalledTimes(2);
  rerender(<PracticeCatalog modes={modes} />);
  await user.click(screen.getAllByRole('button')[0]);
  rerender(<PracticeCatalog modes={[]} />);
  expect(screen.queryAllByRole('button')).toHaveLength(0);
});
