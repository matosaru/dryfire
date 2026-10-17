/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrandHeader } from './BrandHeader.tsx';

test('branding, beta disclosure, live status and settings retain their native semantics', async () => {
  const onSettings = jest.fn();
  const { rerender } = render(<BrandHeader onSettings={onSettings} />);
  expect(screen.getByRole('heading', { name: 'Dry Fire With Ease', level: 1 })).toHaveTextContent('DRY FIREWITH EASE');
  expect(screen.getByLabelText('Beta version')).toHaveTextContent('BETA');
  expect(document.querySelector('.brand-logo')).toHaveAttribute('alt', '');
  expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  const settings = screen.getByRole('button', { name: 'Open settings' });
  expect(settings).not.toHaveAttribute('aria-current');
  await userEvent.setup().tab(); await userEvent.setup().keyboard('{Enter}');
  expect(onSettings).toHaveBeenCalledTimes(1);
  rerender(<BrandHeader view="settings" status="Microphone connected" onSettings={onSettings} />);
  expect(settings).toHaveAttribute('aria-current', 'page');
  expect(settings).toHaveClass('active');
  expect(settings).toHaveFocus();
  expect(screen.getByRole('status')).toHaveTextContent('Microphone connected');
  rerender(<BrandHeader view="about" status="Ready" onSettings={onSettings} />);
  expect(settings).not.toHaveAttribute('aria-current');
  expect(settings).not.toHaveClass('active');
});
