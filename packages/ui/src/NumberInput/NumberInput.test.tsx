/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { render, screen } from '@testing-library/react';
import { NumberInput } from './NumberInput.tsx';
import {loadLocale} from '../../../../apps/web/src/localization/runtime.ts';

test('native numeric controls expose the approved constraints and associated hint', () => {
  render(<label>Seconds<NumberInput id="seconds" name="delay" min={0} max={30} step={0.1} defaultValue="3" required inputMode="decimal" hintText="0.1 increments" /></label>);
  const input = screen.getByRole('spinbutton', { name: 'Seconds 0–30 · 0.1 increments' }) as HTMLInputElement;
  expect(input).toHaveAttribute('min', '0'); expect(input).toHaveAttribute('max', '30');
  expect(input).toHaveAttribute('step', '0.1'); expect(input).toHaveAttribute('inputmode', 'decimal');
  expect(input).toHaveAccessibleDescription('0–30 · 0.1 increments');
  expect(input).toBeRequired(); expect(input.value).toBe('3');
  input.value='31'; expect(input.validity.rangeOverflow).toBe(true);
});

test('whole-number controls preserve native value and optional validation', () => {
  render(<NumberInput id="count" min={1} max={500} step={1} defaultValue="50" hintText="whole numbers" />);
  const input=screen.getByRole('spinbutton') as HTMLInputElement;
  expect(input).not.toBeRequired(); expect(input.value).toBe('50');
  expect(input).toHaveAccessibleDescription('1–500 · whole numbers');
  input.value='1.5'; expect(input.validity.stepMismatch).toBe(true);
});

test('numeric hints update in place when the application locale changes', async()=>{
  try {
    await loadLocale('de');
    render(<NumberInput id="count" min={1} max={500} step={1} defaultValue="50" hintText="ganze Zahlen" />);
    expect(screen.getByText('1–500 · ganze Zahlen')).toBeInTheDocument();
    await loadLocale('nl');
    expect(screen.getByText('1–500 · hele getallen')).toBeInTheDocument();
  } finally {
    await loadLocale('en');
  }
});
