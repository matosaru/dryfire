/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { render, screen } from '@testing-library/react';
import { InformationCard } from './index.ts';

test('the card is named by its heading and React escapes supplied text', () => {
  render(<InformationCard id="info" title="Saved on your device"><p>{'<script>invalid()</script>'}</p></InformationCard>);
  expect(screen.getByRole('region', { name: 'Saved on your device' })).toHaveAttribute('aria-labelledby', 'info');
  expect(screen.getByText('<script>invalid()</script>')).toBeVisible();
  expect(document.querySelector('script')).toBeNull();
});
