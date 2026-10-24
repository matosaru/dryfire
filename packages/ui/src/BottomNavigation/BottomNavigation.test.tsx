/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomNavigation } from './BottomNavigation.tsx';

test('the five native navigation buttons retain their vocabulary, order and exact destination callbacks', async () => {
  const onNavigate = jest.fn();
  render(<BottomNavigation onNavigate={onNavigate} />);
  const buttons = screen.getAllByRole('button');
  expect(buttons.map(node => node.textContent)).toEqual(['Home', 'Learn', 'Drills', 'Live Listen', 'History']);
  for (const button of buttons) await userEvent.setup().click(button);
  expect(onNavigate.mock.calls).toEqual([['home'], ['learn'], ['drills'], ['recognize'], ['history']]);
  expect(document.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(5);
});

test.each(['home', 'learn', 'drills', 'recognize', 'history', 'session', 'practice', 'practiceGuide', 'settings', 'about', 'contact', 'guns', 'gunSetup'])('%s selects only its existing main-navigation parent', view => {
  render(<BottomNavigation view={view} />);
  const expected = ['session', 'practice', 'practiceGuide'].includes(view) ? 'drills' : view;
  for (const button of screen.getAllByRole('button')) {
    const current = button.getAttribute('data-view') === expected;
    expect(button.getAttribute('aria-current')).toBe(current ? 'page' : null);
    expect(button.classList.contains('active')).toBe(current);
  }
});

test('disabled/loading navigation cannot fire callbacks and preserves focused nodes on a route update', async () => {
  const onNavigate = jest.fn();
  const { rerender } = render(<BottomNavigation disabled onNavigate={onNavigate} />);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Drills' }));
  expect(onNavigate).not.toHaveBeenCalled();
  rerender(<BottomNavigation view="learn" onNavigate={onNavigate} />);
  await userEvent.setup().tab(); await userEvent.setup().keyboard('{Enter}');
  expect(onNavigate).toHaveBeenLastCalledWith('home');
  const focused = document.activeElement;
  rerender(<BottomNavigation view="practiceGuide" onNavigate={onNavigate} />);
  expect(document.activeElement).toBe(focused);
});

test('prerendered navigation does not require application services', async () => {
  render(<BottomNavigation />);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Learn' }));
});

test('public navigation links use real app paths and retain selected-item semantics',()=>{const hrefs={home:'/app/',learn:'/app/learn/',drills:'/app/drills/',recognize:'/app/live-listen/',history:'/app/history/'};const v=render(<BottomNavigation view="practice" hrefs={hrefs}/>);expect(v.getByRole('link',{name:'Drills'})).toHaveAttribute('aria-current','page');expect(v.getByRole('link',{name:'Home'})).toHaveAttribute('href','/app/');expect(v.queryByRole('button')).toBeNull();});
