/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InfoFooter } from './InfoFooter.tsx';

test('independent native information buttons delegate navigation and keep current state controlled', async () => {
  const onNavigate = jest.fn();
  const { rerender } = render(<InfoFooter onNavigate={onNavigate} />);
  const about = screen.getByRole('button', { name: 'About' }), contact = screen.getByRole('button', { name: 'Contact' });
  expect(about).not.toHaveAttribute('aria-current');
  await userEvent.setup().tab(); await userEvent.setup().keyboard('{Enter}');
  await userEvent.setup().click(contact);
  expect(onNavigate.mock.calls).toEqual([['about'], ['contact']]);
  rerender(<InfoFooter view="about" onNavigate={onNavigate} notice={<p>Private preview · Full mode</p>} />);
  expect(about).toHaveAttribute('aria-current', 'page');
  expect(contact).not.toHaveAttribute('aria-current');
  expect(screen.getByText('Private preview · Full mode')).toBeVisible();
  rerender(<InfoFooter view="contact" onNavigate={onNavigate} />);
  expect(about).not.toHaveAttribute('aria-current');
  expect(contact).toHaveAttribute('aria-current', 'page');
  expect(screen.queryByText('Private preview · Full mode')).not.toBeInTheDocument();
  expect(screen.getByRole('contentinfo')).toHaveTextContent('No raw audio is saved or uploaded.');
  expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Dry Fire With Ease. All rights reserved.');
});

test('build-time rendering has no required callback or private notice', async () => {
  render(<InfoFooter />);
  await userEvent.setup().click(screen.getByRole('button', { name: 'About' }));
  await userEvent.setup().click(screen.getByRole('button', { name: 'Contact' }));
  expect(screen.queryByText(/Private preview/)).not.toBeInTheDocument();
});
