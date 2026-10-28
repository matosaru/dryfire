/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppShell } from './AppShell.tsx';

test('one common shell composes safety, context, persistent content and both navigations in the established order', async () => {
  const onNavigate = jest.fn();
  render(<AppShell onNavigate={onNavigate}
    safety={<div data-testid="safety" />} context={<div data-testid="context" />}><section>Current page</section></AppShell>);
  expect(document.querySelectorAll('header')).toHaveLength(1);
  expect(screen.getAllByRole('main')).toHaveLength(1);
  expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
  expect(screen.getAllByRole('navigation')).toHaveLength(2);
  const shell = document.querySelector('.app-shell')!;
  expect([...shell.children].map(node => node.tagName)).toEqual(['HEADER', 'DIV', 'MAIN', 'FOOTER', 'NAV']);
  expect(screen.getByRole('main').children[0]).toBe(screen.getByTestId('context'));
  await userEvent.setup().click(screen.getByRole('button', { name: 'Settings' }));
  await userEvent.setup().click(screen.getByRole('link', { name: 'About' }));
  await userEvent.setup().click(screen.getByRole('button', { name: 'History' }));
  expect(onNavigate.mock.calls).toEqual([['settings'], ['about'], ['history']]);
});

test('rerendering shell props preserves a mounted invalid draft, its selection and focus', () => {
  const child = <input aria-label="Draft" defaultValue="draft" />;
  const { rerender } = render(<AppShell>{child}</AppShell>);
  const input = screen.getByRole('textbox') as HTMLInputElement;
  input.value = 'incomplete'; input.focus(); input.setSelectionRange(2, 5);
  rerender(<AppShell view="practice" status="Ready">{child}</AppShell>);
  expect(screen.getByRole('textbox')).toBe(input);
  expect(input).toHaveValue('incomplete');
  expect(input).toHaveFocus();
  expect([input.selectionStart, input.selectionEnd]).toEqual([2, 5]);
});

test('default static composition requires no callbacks', async () => {
  render(<AppShell />);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Settings' }));
});
