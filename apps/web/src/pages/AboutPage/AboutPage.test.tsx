/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AboutPage } from './index.ts';

test('the beta, local-data and acoustic limitations remain available before gun setup', async () => {
  const back = jest.fn(); render(<AboutPage onBack={back} />);
  expect(screen.getByText('Sound trainer · Beta · v0.8.0')).toBeVisible();
  expect(screen.getByRole('region', { name: 'Feedback welcome' })).toHaveTextContent('All feedback and suggestions are welcome');
  expect(screen.getByRole('region', { name: 'Saved on your device' })).toHaveTextContent('No account is required');
  expect(screen.getByRole('heading', { name: 'Practice responsibly' }).parentElement).toHaveTextContent('cannot verify an unloaded firearm');
  await userEvent.setup().click(screen.getByRole('button', { name: 'Back to previous screen' }));
  expect(back).toHaveBeenCalledTimes(1);
});

test('a private simulation update changes the summary without replacing Back or duplicating cards', () => {
  const { rerender } = render(<AboutPage full={false} />);
  const back = screen.getByRole('button', { name: 'Back to previous screen' });
  expect(document.getElementById('aboutFeatureSummary')).toHaveTextContent('built-in practice mode');
  rerender(<AboutPage full />);
  expect(document.getElementById('aboutFeatureSummary')).toHaveTextContent('up to five guns');
  expect(screen.getByRole('button', { name: 'Back to previous screen' })).toBe(back);
  expect(screen.getAllByRole('region', { name: 'A simple practice routine' })).toHaveLength(1);
  rerender(<AboutPage full={false} />);
  expect(document.getElementById('aboutFeatureSummary')).not.toHaveTextContent('five guns');
});
