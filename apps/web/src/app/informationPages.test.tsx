/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import { mountInformationPages } from './informationPages.tsx';

beforeEach(() => { document.body.innerHTML = '<section id="aboutView"></section><section id="contactView"></section>'; });
afterEach(() => { document.body.replaceChildren(); });

test('page roots retain DOM and update edition copy without losing navigation callbacks', async () => {
  const onBack = jest.fn();
  let pages: ReturnType<typeof mountInformationPages>;
  act(() => { pages = mountInformationPages({ onBack }); });
  const aboutBack = screen.getByRole('button', { name: 'Back to previous screen' });
  act(() => { pages.setFull(true); pages.setFull(true); });
  expect(screen.getByText(/up to five guns/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Back to previous screen' })).toBe(aboutBack);
  await userEvent.click(aboutBack);
  expect(onBack).toHaveBeenCalledTimes(1);
  act(() => pages.setFull(false));
  expect(screen.getByText(/built-in practice mode/)).toBeInTheDocument();
  act(() => { pages.dispose(); pages.dispose(); pages.setFull(true); });
  expect(document.querySelector('#aboutView')).toBeEmptyDOMElement();
  expect(document.querySelector('#contactView')).toBeEmptyDOMElement();
});

test('missing mounts fail before acquiring a root', () => {
  document.querySelector('#contactView')?.remove();
  expect(() => mountInformationPages({ onBack: () => {} })).toThrow('mounts are missing');
  expect(document.querySelector('#aboutView')).toBeEmptyDOMElement();
});

test('connecting React preserves keyboard focus inside the prerendered page', () => {
  document.querySelector('#aboutView')!.innerHTML = '<button data-r-back>Back</button>';
  const initialBack = document.querySelector<HTMLButtonElement>('[data-r-back]')!;
  initialBack.focus();
  let pages: ReturnType<typeof mountInformationPages>;
  act(() => { pages = mountInformationPages({ onBack() {} }); });
  expect(screen.getByRole('button', { name: 'Back to previous screen' })).toHaveFocus();
  act(() => pages.dispose());
});
