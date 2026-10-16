/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactPage } from './index.ts';

test('Contact exposes the approved mailto address and a working Back action', async () => {
  const back = jest.fn(); render(<ContactPage onBack={back} />);
  expect(screen.getByRole('region', { name: 'Get in touch' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'easydryfire@gmail.com' })).toHaveAttribute('href', 'mailto:easydryfire@gmail.com');
  expect(document.querySelector('form')).toBeNull();
  await userEvent.setup().click(screen.getByRole('button', { name: 'Back' })); expect(back).toHaveBeenCalledTimes(1);
});
